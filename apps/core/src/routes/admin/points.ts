import { Elysia, t } from "elysia";
import { db } from "@/db";
import { points, pathPoints } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";
import { join } from "path";
import { mkdir } from "fs/promises";

export const adminPointsRoutes = new Elysia({ prefix: "/points" })
  .use(adminMiddleware)
  .post(
    "/",
    async (context: any) => {
      const { body, user } = context;
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }

      // Handle audio file upload if provided
      let audioUrl: string | undefined = undefined;
      if (body.audioFile) {
        const audioUUID = crypto.randomUUID();
        const audioBuffer = await body.audioFile.arrayBuffer();
        const mimeType = body.audioFile.type;
        // Determine extension from mime type or filename
        let extension = ".mp3";
        if (mimeType.includes("wav")) extension = ".wav";
        else if (mimeType.includes("ogg")) extension = ".ogg";
        else if (mimeType.includes("webm")) extension = ".webm";
        else if (mimeType.includes("m4a")) extension = ".m4a";
        
        const fileName = `${audioUUID}${extension}`;
        const filePath = join(process.cwd(), "resources", "audio", fileName);
        
        // Ensure directory exists
        await mkdir(join(process.cwd(), "resources", "audio"), { recursive: true });
        
        await Bun.write(filePath, audioBuffer);
        audioUrl = `/resources/audio/${fileName}`;
      }

      // Extract path-related fields if provided
      // Handle both JSON and FormData (for file uploads)
      const pathId = typeof body.pathId === 'string' ? Number(body.pathId) : body.pathId;
      const orderIndex = typeof body.orderIndex === 'string' ? Number(body.orderIndex) : body.orderIndex;
      const latitude = typeof body.latitude === 'string' ? Number(body.latitude) : body.latitude;
      const longitude = typeof body.longitude === 'string' ? Number(body.longitude) : body.longitude;
      const radiusMeters = typeof body.radiusMeters === 'string' ? Number(body.radiusMeters) : body.radiusMeters;
      const characterId = body.characterId ? (typeof body.characterId === 'string' ? Number(body.characterId) : body.characterId) : undefined;
      const isPublic = body.isPublic === 'true' || body.isPublic === true || body.isPublic === '1' || body.isPublic === 1;
      
      // Extract only valid point fields
      const {
        locationLabel,
        narrationText,
        fullNarrationText,
        audioUrl: audioUrlFromBody,
        triggerQuestion,
        rewardLabel,
        rewardIconUrl,
      } = body;

      // Step 2: Create point (can be created standalone or as part of path)
      const [newPoint] = await db
        .insert(points)
        .values({
          latitude,
          longitude,
          radiusMeters,
          locationLabel: locationLabel || null,
          narrationText: narrationText || '',
          fullNarrationText: fullNarrationText || null,
          characterId: characterId || null,
          audioUrl: audioUrl || audioUrlFromBody || null,
          triggerQuestion: triggerQuestion || null,
          rewardLabel: rewardLabel || null,
          rewardIconUrl: rewardIconUrl || null,
          isPublic: isPublic,
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
      type: "multipart/form-data",
      body: t.Object({
        latitude: t.Union([t.Number(), t.String()]),
        longitude: t.Union([t.Number(), t.String()]),
        radiusMeters: t.Union([t.Number(), t.String()]),
        locationLabel: t.Optional(t.String()),
        characterId: t.Optional(t.Union([t.Number(), t.String()])),
        narrationText: t.String(),
        fullNarrationText: t.Optional(t.String()),
        audioUrl: t.Optional(t.String()),
        audioFile: t.Optional(
          t.File({
            maxFileSize: "10MB",
            allowedMimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/x-m4a"],
          })
        ),
        triggerQuestion: t.Optional(t.String()),
        rewardLabel: t.Optional(t.String()),
        rewardIconUrl: t.Optional(t.String()),
        isPublic: t.Optional(t.Union([t.Boolean(), t.String()])),
        // Optional: if provided, point will be added to path
        pathId: t.Optional(t.Union([t.Number(), t.String()])),
        orderIndex: t.Optional(t.Union([t.Number(), t.String()])),
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

