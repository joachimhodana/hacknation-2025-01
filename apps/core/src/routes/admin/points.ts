import { Elysia, t } from "elysia";
import { db } from "@/db";
import { points, pathPoints } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";
import { join } from "path";
import { mkdir } from "fs/promises";

export const adminPointsRoutes = new Elysia({ prefix: "/points" })
  .use(adminMiddleware)
  // POST endpoint removed - points are now created together with paths via /admin/paths POST
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

