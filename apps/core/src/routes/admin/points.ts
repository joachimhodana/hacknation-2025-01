import { Elysia, t } from "elysia";
import { db } from "@/db";
import { points, pathPoints } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";
import { join } from "path";
import { mkdir } from "fs/promises";

export const adminPointsRoutes = new Elysia({ prefix: "/points" })
  .use(adminMiddleware)
  .get("/", async () => {
    const allPoints = await db.select().from(points);
    return {
      success: true,
      data: allPoints,
    };
  })
  .post(
    "/:id/add-to-path/:pathId",
    async (context: any) => {
      const { params, body } = context;
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
      auth: true,
      body: t.Object({
        orderIndex: t.Number(),
      }),
    }
  )
  .delete("/:id/remove-from-path/:pathId", async (context: any) => {
    const { params } = context;
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
  }, {
    auth: true
  })
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
  .patch(
    "/:id",
    async (context: any) => {
      const { params, body, user } = context;
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }
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
      auth: true,
      body: t.Object({
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
  }, {
    auth: true
  });

