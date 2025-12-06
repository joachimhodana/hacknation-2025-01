import { Elysia, t } from "elysia";
import { db } from "@/db";
import { paths, pathPoints, points } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";

export const adminPathsRoutes = new Elysia({ prefix: "/paths" })
  .use(adminMiddleware)
  .post(
    "/",
    async ({ body, user }) => {
      // Step 1: Create path with basic info
      const [newPath] = await db
        .insert(paths)
        .values({
          ...body,
          createdBy: user!.id,
        })
        .returning();

      return {
        success: true,
        data: newPath,
      };
    },
    {
      body: t.Object({
        pathId: t.String(),
        title: t.String(),
        shortDescription: t.String(),
        longDescription: t.Optional(t.String()),
        category: t.String(),
        difficulty: t.String(),
        totalTimeMinutes: t.Number(),
        distanceMeters: t.Optional(t.Number()),
        thumbnailUrl: t.Optional(t.String()),
        stylePreset: t.Optional(t.String()),
        markerIconUrl: t.Optional(t.String()),
      }),
    }
  )
  .get("/", async () => {
    const allPaths = await db.select().from(paths);
    return {
      success: true,
      data: allPaths,
    };
  })
  .get("/:id", async ({ params }) => {
    const [path] = await db
      .select()
      .from(paths)
      .where(eq(paths.id, Number(params.id)))
      .limit(1);

    if (!path) {
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
      .where(eq(pathPoints.pathId, Number(params.id)))
      .orderBy(pathPoints.orderIndex);

    return {
      success: true,
      data: {
        ...path,
        points: pathPointsData,
      },
    };
  })
  .put(
    "/:id",
    async ({ params, body, user }) => {
      const [updatedPath] = await db
        .update(paths)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(paths.id, Number(params.id)),
            eq(paths.createdBy, user!.id)
          )
        )
        .returning();

      if (!updatedPath) {
        return {
          success: false,
          error: "Path not found or you don't have permission",
        };
      }

      return {
        success: true,
        data: updatedPath,
      };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        shortDescription: t.Optional(t.String()),
        longDescription: t.Optional(t.String()),
        category: t.Optional(t.String()),
        difficulty: t.Optional(t.String()),
        totalTimeMinutes: t.Optional(t.Number()),
        distanceMeters: t.Optional(t.Number()),
        thumbnailUrl: t.Optional(t.String()),
        isPublished: t.Optional(t.Boolean()),
        stylePreset: t.Optional(t.String()),
        markerIconUrl: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async ({ params, user }) => {
    const [deletedPath] = await db
      .delete(paths)
      .where(
        and(
          eq(paths.id, Number(params.id)),
          eq(paths.createdBy, user!.id)
        )
      )
      .returning();

    if (!deletedPath) {
      return {
        success: false,
        error: "Path not found or you don't have permission",
      };
    }

    return {
      success: true,
      message: "Path deleted successfully",
    };
  });

