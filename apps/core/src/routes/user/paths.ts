import { Elysia } from "elysia";
import { db } from "@/db";
import { paths, pathPoints, points } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";

// User paths endpoint - requires authentication, returns only published paths
export const userPathsRoutes = new Elysia({ prefix: "/user" })
  // Debug endpoint - no auth required (remove in production)
  .get("/paths/debug", async () => {
    try {
      const allPaths = await db
        .select()
        .from(paths)
        .where(eq(paths.isPublished, true));
      
      return {
        success: true,
        debug: true,
        count: allPaths.length,
        paths: allPaths.map(p => ({ id: p.id, pathId: p.pathId, title: p.title, isPublished: p.isPublished })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  })
  .get("/paths", async ({ request }) => {
    try {
      console.log("[user/paths] GET /user/paths called");
      
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      console.log("[user/paths] Session:", session ? "exists" : "missing");

      if (!session?.user) {
        console.log("[user/paths] Unauthorized - no session");
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      // Get all published paths
      const allPaths = await db
        .select()
        .from(paths)
        .where(eq(paths.isPublished, true));

      console.log("[user/paths] Found", allPaths.length, "published paths");
      if (allPaths.length === 0) {
        console.warn("[user/paths] WARNING: No published paths found in database!");
        // Also check total paths
        const totalPaths = await db.select().from(paths);
        console.log("[user/paths] Total paths in DB (including unpublished):", totalPaths.length);
      }

      // For each path, get its points
      const pathsWithPoints = await Promise.all(
        allPaths.map(async (path) => {
          const pathPointsData = await db
            .select({
              point: points,
              orderIndex: pathPoints.orderIndex,
            })
            .from(pathPoints)
            .innerJoin(points, eq(pathPoints.pointId, points.id))
            .where(eq(pathPoints.pathId, path.id))
            .orderBy(asc(pathPoints.orderIndex));

          // Transform points to match RouteStop interface
          const stops = pathPointsData.map((pp, index) => ({
            stop_id: index + 1,
            name: pp.point.locationLabel || `Stop ${index + 1}`,
            map_marker: {
              display_name: pp.point.locationLabel || `Stop ${index + 1}`,
              address: pp.point.locationLabel || "",
              coordinates: {
                latitude: pp.point.latitude,
                longitude: pp.point.longitude,
              },
            },
            place_description: pp.point.narrationText,
            voice_over_text: pp.point.narrationText,
          }));

          return {
            id: path.id,
            pathId: path.pathId,
            title: path.title,
            theme: path.shortDescription,
            category: path.category,
            total_time_minutes: path.totalTimeMinutes,
            difficulty: path.difficulty,
            distance_meters: path.distanceMeters,
            thumbnail_url: path.thumbnailUrl,
            marker_icon_url: path.markerIconUrl,
            style_preset: path.stylePreset,
            stops,
          };
        })
      );

      console.log("[user/paths] Returning", pathsWithPoints.length, "paths with points");
      return {
        success: true,
        data: pathsWithPoints,
      };
    } catch (error: any) {
      console.error("[user/paths] Error fetching paths:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch paths",
      };
    }
  })
  .get("/paths/:pathId", async ({ request, params }) => {
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      // Get path by pathId (not database id)
      const [path] = await db
        .select()
        .from(paths)
        .where(eq(paths.pathId, params.pathId))
        .limit(1);

      if (!path || !path.isPublished) {
        return {
          success: false,
          error: "Path not found",
        };
      }

      // Get points for this path
      const pathPointsData = await db
        .select({
          point: points,
          orderIndex: pathPoints.orderIndex,
        })
        .from(pathPoints)
        .innerJoin(points, eq(pathPoints.pointId, points.id))
        .where(eq(pathPoints.pathId, path.id))
        .orderBy(asc(pathPoints.orderIndex));

      // Transform points to match RouteStop interface
      const stops = pathPointsData.map((pp, index) => ({
        stop_id: index + 1,
        name: pp.point.locationLabel || `Stop ${index + 1}`,
        map_marker: {
          display_name: pp.point.locationLabel || `Stop ${index + 1}`,
          address: pp.point.locationLabel || "",
          coordinates: {
            latitude: pp.point.latitude,
            longitude: pp.point.longitude,
          },
        },
        place_description: pp.point.narrationText,
        voice_over_text: pp.point.narrationText,
      }));

      return {
        success: true,
        data: {
          id: path.id,
          pathId: path.pathId,
          title: path.title,
          theme: path.shortDescription,
          category: path.category,
          total_time_minutes: path.totalTimeMinutes,
          difficulty: path.difficulty,
          distance_meters: path.distanceMeters,
          thumbnail_url: path.thumbnailUrl,
          marker_icon_url: path.markerIconUrl,
          style_preset: path.stylePreset,
          stops,
        },
      };
    } catch (error: any) {
      console.error("[user/paths/:pathId] Error fetching path:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch path",
      };
    }
  });

