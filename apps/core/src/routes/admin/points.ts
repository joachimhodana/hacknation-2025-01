import { Elysia, t } from "elysia";
import { db } from "@/db";
import { points, pathPoints } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";

export const adminPointsRoutes = new Elysia({ prefix: "/points" })
  .use(adminMiddleware)
  .post(
    "/",
    async (context: any) => {
      const { body, user } = context;
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }

      // Extract path-related fields if provided
      const { pathId, orderIndex, ...pointData } = body;

      // Step 2: Create point (can be created standalone or as part of path)
      const [newPoint] = await db
        .insert(points)
        .values({
          ...pointData,
          createdBy: user.id,
        })
        .returning();

      // If pathId and orderIndex are provided, create the path_point relationship
      let pathPoint = null;
      if (pathId !== undefined && orderIndex !== undefined) {
        const [newPathPoint] = await db
          .insert(pathPoints)
          .values({
            pathId: Number(pathId),
            pointId: newPoint.id,
            orderIndex: Number(orderIndex),
          })
          .returning();
        pathPoint = newPathPoint;
      }

      return {
        success: true,
        data: {
          point: newPoint,
          pathPoint: pathPoint, // null if not part of a path
        },
      };
    },
    {
      body: t.Object({
        latitude: t.Number(),
        longitude: t.Number(),
        radiusMeters: t.Number(),
        locationLabel: t.Optional(t.String()),
        characterId: t.Optional(t.Number()),
        narrationText: t.String(),
        fullNarrationText: t.Optional(t.String()),
        audioUrl: t.Optional(t.String()),
        triggerQuestion: t.Optional(t.String()),
        rewardLabel: t.Optional(t.String()),
        rewardIconUrl: t.Optional(t.String()),
        isPublic: t.Optional(t.Boolean()),
        // Optional: if provided, point will be added to path
        pathId: t.Optional(t.Number()),
        orderIndex: t.Optional(t.Number()),
      }),
    }
  )
  .get("/", async () => {
    const allPoints = await db.select().from(points);
    return {
      success: true,
      data: allPoints,
    };
  })
  // Specific routes must come before generic :id routes
  .post(
    "/:id/add-to-path/:pathId",
    async (context: any) => {
      const { params, body } = context;
      // Add existing point to a path with order index
      const [pathPoint] = await db
        .insert(pathPoints)
        .values({
          pathId: Number(params.pathId),
          pointId: Number(params.id),
          orderIndex: body.orderIndex,
        })
        .returning();

      return {
        success: true,
        data: pathPoint,
      };
    },
    {
      body: t.Object({
        orderIndex: t.Number(),
      }),
    }
  )
  .delete("/:id/remove-from-path/:pathId", async (context: any) => {
    const { params } = context;
    // Remove point from path
    await db
      .delete(pathPoints)
      .where(
        and(
          eq(pathPoints.pathId, Number(params.pathId)),
          eq(pathPoints.pointId, Number(params.id))
        )
      );

    return {
      success: true,
      message: "Point removed from path successfully",
    };
  })
  // Generic :id routes come after specific routes
  .get("/:id", async ({ params }) => {
    const [point] = await db
      .select()
      .from(points)
      .where(eq(points.id, Number(params.id)))
      .limit(1);

    if (!point) {
      return {
        success: false,
        error: "Point not found",
      };
    }

    return {
      success: true,
      data: point,
    };
  })
  .put(
    "/:id",
    async (context: any) => {
      const { params, body, user } = context;
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }
      const [updatedPoint] = await db
        .update(points)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(points.id, Number(params.id)),
            eq(points.createdBy, user.id)
          )
        )
        .returning();

      if (!updatedPoint) {
        return {
          success: false,
          error: "Point not found or you don't have permission",
        };
      }

      return {
        success: true,
        data: updatedPoint,
      };
    },
    {
      body: t.Object({
        latitude: t.Optional(t.Number()),
        longitude: t.Optional(t.Number()),
        radiusMeters: t.Optional(t.Number()),
        locationLabel: t.Optional(t.String()),
        characterId: t.Optional(t.Number()),
        narrationText: t.Optional(t.String()),
        fullNarrationText: t.Optional(t.String()),
        audioUrl: t.Optional(t.String()),
        triggerQuestion: t.Optional(t.String()),
        rewardLabel: t.Optional(t.String()),
        rewardIconUrl: t.Optional(t.String()),
        isPublic: t.Optional(t.Boolean()),
      }),
    }
  )
  .delete("/:id", async (context: any) => {
    const { params, user } = context;
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    const [deletedPoint] = await db
      .delete(points)
      .where(
        and(
          eq(points.id, Number(params.id)),
          eq(points.createdBy, user.id)
        )
      )
      .returning();

    if (!deletedPoint) {
      return {
        success: false,
        error: "Point not found or you don't have permission",
      };
    }

    return {
      success: true,
      message: "Point deleted successfully",
    };
  });

