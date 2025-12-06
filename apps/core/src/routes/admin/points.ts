import { Elysia, t } from "elysia";
import { db } from "@/db";
import { points, pathPoints } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";
import { join } from "path";
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
      
      // Coerce string numbers to actual numbers (multipart/form-data sends everything as strings)
      const processedData = {
        ...pointData,
        latitude: typeof pointData.latitude === 'string' ? parseFloat(pointData.latitude) : pointData.latitude,
        longitude: typeof pointData.longitude === 'string' ? parseFloat(pointData.longitude) : pointData.longitude,
        radiusMeters: typeof pointData.radiusMeters === 'string' ? parseInt(pointData.radiusMeters, 10) : pointData.radiusMeters,
        characterId: pointData.characterId ? (typeof pointData.characterId === 'string' ? parseInt(pointData.characterId, 10) : pointData.characterId) : undefined,
      };
      const audioFile = pointData.audioFile;
      const rewardIconFile = pointData.rewardIconFile;
      const audioId = crypto.randomUUID();
      const rewardIconId = crypto.randomUUID();
      let audioUrl: string | undefined;
      let rewardIconUrl: string | undefined;
      if (audioFile) {
        const audioBuffer = await audioFile.arrayBuffer();
        const mimeType = audioFile.type;
        const extension = mimeType === "audio/mpeg" ? ".mp3" : ".wav";
        const fileName = `${audioId}${extension}`;
        const filePath = join(process.cwd(), "public", "resources", "audio", fileName);
        await Bun.write(filePath, audioBuffer);
        audioUrl = `/resources/audio/${fileName}`;
      }
      if (rewardIconFile) {
        const rewardIconBuffer = await rewardIconFile.arrayBuffer();
        const mimeType = rewardIconFile.type;
        const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
        const fileName = `${rewardIconId}${extension}`;
        const filePath = join(process.cwd(), "public", "resources", "reward_icons", fileName);
        await Bun.write(filePath, rewardIconBuffer);
        rewardIconUrl = `/resources/reward_icons/${fileName}`;
      }
      // Step 2: Create point (can be created standalone or as part of path)
      const [newPoint] = await db
        .insert(points)
        .values({
          latitude: processedData.latitude,
          longitude: processedData.longitude,
          radiusMeters: processedData.radiusMeters, 
          locationLabel: processedData.locationLabel,
          characterId: processedData.characterId,
          narrationText: processedData.narrationText,
          audioUrl: audioUrl,
          rewardIconUrl: rewardIconUrl,
          createdBy: "qfJBN4SC5nbceb4M4VQj7wTXGAVkrKYJ",
        })
        .returning();

      // If pathId and orderIndex are provided, create the path_point relationship
      let pathPoint = null;
      if (pathId !== undefined && orderIndex !== undefined) {
        const [newPathPoint] = await db
          .insert(pathPoints)
          .values({
            pathId: typeof pathId === 'string' ? parseInt(pathId, 10) : pathId,
            pointId: newPoint.id,
            orderIndex: typeof orderIndex === 'string' ? parseInt(orderIndex, 10) : orderIndex,
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
        // Accept strings for numbers since multipart/form-data sends everything as strings
        // We'll coerce them to numbers in the handler
        latitude: t.Union([t.Number(), t.String()]),
        longitude: t.Union([t.Number(), t.String()]),
        radiusMeters: t.Union([t.Number(), t.String()]),
        locationLabel: t.Optional(t.String()),
        characterId: t.Optional(t.Union([t.Number(), t.String()])),
        narrationText: t.String(),
        fullNarrationText: t.Optional(t.String()),
        audioFile: t.Optional(t.File({
          maxFileSize: "10MB",
          allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/mp3"],
        })),
        triggerQuestion: t.Optional(t.String()),
        rewardLabel: t.Optional(t.String()),
        rewardIconFile: t.Optional(t.File({
          maxFileSize: "10MB",
          allowedMimeTypes: ["image/jpeg", "image/png"],
        })),
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
      // User is guaranteed to be defined by adminMiddleware.onBeforeHandle
      
      // Handle file uploads
      const { audioFile, rewardIconFile, ...restBody } = body;
      let audioUrl: string | undefined;
      let rewardIconUrl: string | undefined;
      
      if (audioFile) {
        const audioId = crypto.randomUUID();
        const audioBuffer = await audioFile.arrayBuffer();
        const mimeType = audioFile.type;
        const extension = mimeType === "audio/mpeg" ? ".mp3" : ".wav";
        const fileName = `${audioId}${extension}`;
        const filePath = join(process.cwd(), "public", "resources", "audio", fileName);
        await Bun.write(filePath, audioBuffer);
        audioUrl = `/resources/audio/${fileName}`;
      }
      
      if (rewardIconFile) {
        const rewardIconId = crypto.randomUUID();
        const rewardIconBuffer = await rewardIconFile.arrayBuffer();
        const mimeType = rewardIconFile.type;
        const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
        const fileName = `${rewardIconId}${extension}`;
        const filePath = join(process.cwd(), "public", "resources", "reward_icons", fileName);
        await Bun.write(filePath, rewardIconBuffer);
        rewardIconUrl = `/resources/reward_icons/${fileName}`;
      }
      
      // Coerce string numbers to actual numbers (multipart/form-data sends everything as strings)
      const processedBody: any = { ...restBody };
      if (processedBody.latitude !== undefined && typeof processedBody.latitude === 'string') {
        processedBody.latitude = parseFloat(processedBody.latitude);
      }
      if (processedBody.longitude !== undefined && typeof processedBody.longitude === 'string') {
        processedBody.longitude = parseFloat(processedBody.longitude);
      }
      if (processedBody.radiusMeters !== undefined && typeof processedBody.radiusMeters === 'string') {
        processedBody.radiusMeters = parseInt(processedBody.radiusMeters, 10);
      }
      if (processedBody.characterId !== undefined && typeof processedBody.characterId === 'string') {
        processedBody.characterId = parseInt(processedBody.characterId, 10);
      }
      
      // Add file URLs if files were uploaded
      if (audioUrl) processedBody.audioUrl = audioUrl;
      if (rewardIconUrl) processedBody.rewardIconUrl = rewardIconUrl;
      
      const [updatedPoint] = await db
        .update(points)
        .set({
          ...processedBody,
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
        // Accept strings for numbers since multipart/form-data sends everything as strings
        latitude: t.Optional(t.Union([t.Number(), t.String()])),
        longitude: t.Optional(t.Union([t.Number(), t.String()])),
        radiusMeters: t.Optional(t.Union([t.Number(), t.String()])),
        locationLabel: t.Optional(t.String()),
        characterId: t.Optional(t.Union([t.Number(), t.String()])),
        narrationText: t.Optional(t.String()),
        fullNarrationText: t.Optional(t.String()),
        audioFile: t.Optional(t.File({
          maxFileSize: "10MB",
          allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/mp3"],
        })),
        triggerQuestion: t.Optional(t.String()),
        rewardLabel: t.Optional(t.String()),
        rewardIconFile: t.Optional(t.File({
          maxFileSize: "10MB",
          allowedMimeTypes: ["image/jpeg", "image/png"],
        })),
        isPublic: t.Optional(t.Boolean()),
      }),
      type: "multipart/form-data",
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

