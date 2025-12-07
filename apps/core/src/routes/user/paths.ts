import { Elysia } from "elysia";
import { db } from "@/db";
import { paths, pathPoints, points, userPathProgress, userPointVisit, userItems, characters } from "@/db/schema";
import { eq, and, asc, desc, isNotNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const userPathsRoutes = new Elysia({ prefix: "/user" })
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

      const allPaths = await db
        .select()
        .from(paths)
        .where(eq(paths.isPublished, true));

      console.log("[user/paths] Found", allPaths.length, "published paths");
      if (allPaths.length === 0) {
        console.warn("[user/paths] WARNING: No published paths found in database!");
        const totalPaths = await db.select().from(paths);
        console.log("[user/paths] Total paths in DB (including unpublished):", totalPaths.length);
      }

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
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

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

      const pathPointsData = await db
        .select({
          point: points,
          orderIndex: pathPoints.orderIndex,
        })
        .from(pathPoints)
        .innerJoin(points, eq(pathPoints.pointId, points.id))
        .where(eq(pathPoints.pathId, path.id))
        .orderBy(asc(pathPoints.orderIndex));

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
  })
  .post("/paths/:pathId/start", async ({ request, params }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const userId = session.user.id;

      const activeProgress = await db
        .select()
        .from(userPathProgress)
        .where(
          and(
            eq(userPathProgress.userId, userId),
            eq(userPathProgress.status, "in_progress")
          )
        )
        .limit(1);

      if (activeProgress.length > 0) {
        return {
          success: false,
          error: "You already have an active path. Please pause it before starting a new one.",
        };
      }

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

      const [newProgress] = await db
        .insert(userPathProgress)
        .values({
          userId,
          pathId: path.id,
          status: "in_progress",
          visitedStopsCount: 0,
        })
        .returning();

      return {
        success: true,
        data: {
          id: newProgress.id,
          pathId: path.pathId,
          status: newProgress.status,
          visitedStopsCount: newProgress.visitedStopsCount,
          startedAt: newProgress.startedAt,
        },
      };
    } catch (error: any) {
      console.error("[user/paths/:pathId/start] Error:", error);
      return {
        success: false,
        error: error.message || "Failed to start path",
      };
    }
  })
  .post("/paths/:pathId/pause", async ({ request, params }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const userId = session.user.id;

      const [path] = await db
        .select()
        .from(paths)
        .where(eq(paths.pathId, params.pathId))
        .limit(1);

      if (!path) {
        return {
          success: false,
          error: "Path not found",
        };
      }

      const [progress] = await db
        .select()
        .from(userPathProgress)
        .where(
          and(
            eq(userPathProgress.userId, userId),
            eq(userPathProgress.pathId, path.id),
            eq(userPathProgress.status, "in_progress")
          )
        )
        .limit(1);

      if (!progress) {
        return {
          success: false,
          error: "No active progress found for this path",
        };
      }

      const [updatedProgress] = await db
        .update(userPathProgress)
        .set({
          status: "paused",
          updatedAt: new Date(),
        })
        .where(eq(userPathProgress.id, progress.id))
        .returning();

      return {
        success: true,
        data: {
          id: updatedProgress.id,
          pathId: path.pathId,
          status: updatedProgress.status,
        },
      };
    } catch (error: any) {
      console.error("[user/paths/:pathId/pause] Error:", error);
      return {
        success: false,
        error: error.message || "Failed to pause path",
      };
    }
  })
  .get("/paths/progress", async ({ request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const userId = session.user.id;

      const [progress] = await db
        .select()
        .from(userPathProgress)
        .where(
          and(
            eq(userPathProgress.userId, userId),
            eq(userPathProgress.status, "in_progress")
          )
        )
        .limit(1);

      if (!progress) {
        return {
          success: true,
          data: null,
        };
      }

      const [path] = await db
        .select()
        .from(paths)
        .where(eq(paths.id, progress.pathId))
        .limit(1);

      if (!path) {
        return {
          success: false,
          error: "Path not found",
        };
      }

      const pathPointsData = await db
        .select({
          point: points,
          orderIndex: pathPoints.orderIndex,
          character: characters,
        })
        .from(pathPoints)
        .innerJoin(points, eq(pathPoints.pointId, points.id))
        .leftJoin(characters, eq(points.characterId, characters.id))
        .where(eq(pathPoints.pathId, path.id))
        .orderBy(asc(pathPoints.orderIndex));

      const visitedPoints = await db
        .select({
          pointId: userPointVisit.pointId,
        })
        .from(userPointVisit)
        .where(eq(userPointVisit.pathProgressId, progress.id));

      const visitedPointIds = new Set(visitedPoints.map((v) => v.pointId));

      const stops = pathPointsData.map((pp, index) => ({
        stop_id: index + 1,
        point_id: pp.point.id,
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
        radius_meters: pp.point.radiusMeters,
        reward_label: pp.point.rewardLabel,
        reward_icon_url: pp.point.rewardIconUrl,
        audio_url: pp.point.audioUrl || null,
        visited: visitedPointIds.has(pp.point.id),
        character: pp.character ? {
          id: pp.character.id,
          name: pp.character.name,
          avatarUrl: pp.character.avatarUrl,
          description: pp.character.description,
        } : null,
      }));

      return {
        success: true,
        data: {
          progress: {
            id: progress.id,
            status: progress.status,
            visitedStopsCount: progress.visitedStopsCount,
            lastVisitedStopOrder: progress.lastVisitedStopOrder,
            startedAt: progress.startedAt,
          },
          path: {
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
        },
      };
    } catch (error: any) {
      console.error("[user/paths/progress] Error:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch progress",
      };
    }
  })
  .post("/paths/progress/visit", async ({ request, body }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const userId = session.user.id;
      const { pointId, pathProgressId } = body as { pointId: number; pathProgressId: number };

      if (!pointId || !pathProgressId) {
        return {
          success: false,
          error: "pointId and pathProgressId are required",
        };
      }

      const [progress] = await db
        .select()
        .from(userPathProgress)
        .where(
          and(
            eq(userPathProgress.id, pathProgressId),
            eq(userPathProgress.userId, userId),
          )
        )
        .limit(1);

      if (!progress) {
        return {
          success: false,
          error: "Progress not found or does not belong to user",
        };
      }

      if (progress.status === "paused") {
        await db
          .update(userPathProgress)
          .set({ status: "in_progress" })
          .where(eq(userPathProgress.id, pathProgressId));
      }

      if (progress.status === "completed") {
        return {
          success: false,
          error: "Path is already completed",
        };
      }

      const existingVisit = await db
        .select()
        .from(userPointVisit)
        .where(
          and(
            eq(userPointVisit.pathProgressId, pathProgressId),
            eq(userPointVisit.pointId, pointId)
          )
        )
        .limit(1);

      if (existingVisit.length > 0) {
        await db
          .update(userPointVisit)
          .set({
            lastEnteredAt: new Date(),
          })
          .where(eq(userPointVisit.id, existingVisit[0].id));

        return {
          success: true,
          data: {
            alreadyVisited: true,
          },
        };
      }

      const [point] = await db
        .select()
        .from(points)
        .where(eq(points.id, pointId))
        .limit(1);

      if (!point) {
        return {
          success: false,
          error: "Point not found",
        };
      }

      const [pathPoint] = await db
        .select()
        .from(pathPoints)
        .where(
          and(
            eq(pathPoints.pathId, progress.pathId),
            eq(pathPoints.pointId, pointId)
          )
        )
        .limit(1);

      if (!pathPoint) {
        return {
          success: false,
          error: "Point not part of this path",
        };
      }

      await db.insert(userPointVisit).values({
        userId,
        pointId,
        pathProgressId,
      });

      if (point.rewardLabel) {
        const existingItem = await db
          .select()
          .from(userItems)
          .where(
            and(
              eq(userItems.userId, userId),
              eq(userItems.pointId, pointId)
            )
          )
          .limit(1);

        if (existingItem.length === 0) {
          await db.insert(userItems).values({
            userId,
            rewardLabel: point.rewardLabel,
            rewardIconUrl: point.rewardIconUrl || null,
            pointId,
          });
        }
      }

      const newVisitedCount = progress.visitedStopsCount + 1;

      const totalStops = await db
        .select()
        .from(pathPoints)
        .where(eq(pathPoints.pathId, progress.pathId));

      const isCompleted = newVisitedCount >= totalStops.length;

      const [updatedProgress] = await db
        .update(userPathProgress)
        .set({
          visitedStopsCount: newVisitedCount,
          lastVisitedStopOrder: pathPoint.orderIndex,
          status: isCompleted ? "completed" : "in_progress",
          completedAt: isCompleted ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(userPathProgress.id, pathProgressId))
        .returning();

      return {
        success: true,
        data: {
          progress: updatedProgress,
          isCompleted,
        },
      };
    } catch (error: any) {
      console.error("[user/paths/progress/visit] Error:", error);
      return {
        success: false,
        error: error.message || "Failed to mark point as visited",
      };
    }
  })
  .get("/points/public", async ({ request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const publicPointsData = await db
        .select({
          point: points,
          character: characters,
        })
        .from(points)
        .leftJoin(characters, eq(points.characterId, characters.id))
        .where(
          and(
            eq(points.isPublic, true),
            isNotNull(points.characterId)
          )
        );

      const publicPoints = publicPointsData.map((pp) => ({
        point_id: pp.point.id,
        name: pp.point.locationLabel || "Public Point",
        map_marker: {
          coordinates: {
            latitude: pp.point.latitude,
            longitude: pp.point.longitude,
          },
        },
        place_description: pp.point.narrationText,
        radius_meters: pp.point.radiusMeters,
        reward_label: pp.point.rewardLabel || null,
        reward_icon_url: pp.point.rewardIconUrl || null,
        audio_url: pp.point.audioUrl || null,
        character: pp.character ? {
          id: pp.character.id,
          name: pp.character.name,
          avatarUrl: pp.character.avatarUrl,
          description: pp.character.description,
        } : null,
      }));

      return {
        success: true,
        data: publicPoints,
      };
    } catch (error: any) {
      console.error("[user/points/public] Error:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch public points",
      };
    }
  });

