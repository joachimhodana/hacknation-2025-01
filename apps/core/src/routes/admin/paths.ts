import { Elysia, t } from "elysia";
import { db } from "@/db";
import { paths, pathPoints, points } from "@/db/schema";
import { eq, and, count, inArray } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";
import { join } from "path";
import { mkdir } from "fs/promises";

const PointSchema = t.Object({
  latitude: t.Number(),
  longitude: t.Number(),
  radiusMeters: t.Optional(t.Number()),
  locationLabel: t.Optional(t.String()),
  narrationText: t.String(),
  characterId: t.Optional(t.Number()),
  rewardLabel: t.Optional(t.String()),
  rewardIconUrl: t.Optional(t.String()),
});

export const adminPathsRoutes = new Elysia({ prefix: "/paths" })
  .use(adminMiddleware)
  .post(
    "/",
    async (context: any) => {
      const { body, user } = context;
      console.log("[paths.ts POST] Handler called");
      console.log("[paths.ts POST] User:", user ? `id: ${user.id}` : "null");
      if (!user) {
        console.log("[paths.ts POST] No user found, returning Unauthorized");
        return { success: false, error: "Unauthorized" };
      }
      const thumbnailUUID = crypto.randomUUID();
      let thumbnailUrl: string | undefined;
      
      if (body.thumbnailFile) {
        const thumbnailBuffer = await body.thumbnailFile.arrayBuffer();
        const mimeType = body.thumbnailFile.type;
        const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
        const fileName = `${thumbnailUUID}${extension}`;
        const filePath = join(process.cwd(), "public", "resources", "thumbnails", fileName);
        
        await mkdir(join(process.cwd(),"public", "resources", "thumbnails"), { recursive: true });
        
        await Bun.write(filePath, thumbnailBuffer);
        thumbnailUrl = `/resources/thumbnails/${fileName}`;
      }

      const markerIconUUID = crypto.randomUUID();
      let markerIconUrl: string | undefined;
      
      if (body.markerIconFile) {
        const markerIconBuffer = await body.markerIconFile.arrayBuffer();
        const mimeType = body.markerIconFile.type;
        const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
        const fileName = `${markerIconUUID}${extension}`;
        const filePath = join(process.cwd(), "public", "resources", "marker_icons", fileName);
        
        await mkdir(join(process.cwd(), "public", "resources", "marker_icons"), { recursive: true });
        
        await Bun.write(filePath, markerIconBuffer);
        markerIconUrl = `/resources/marker_icons/${fileName}`;
      }

      const { thumbnailFile, markerIconFile, totalTimeMinutes, distanceMeters, ...pathData } = body;
      
      const totalTime = totalTimeMinutes 
        ? (typeof totalTimeMinutes === 'string' ? Number(totalTimeMinutes) : totalTimeMinutes)
        : 0;
      const distance = distanceMeters !== undefined && distanceMeters !== null
        ? (typeof distanceMeters === 'string' ? Number(distanceMeters) : distanceMeters)
        : null;
      
      const {
        pathId,
        title,
        shortDescription,
        longDescription,
        category,
        difficulty,
        stylePreset,
      } = pathData;

      const [newPath] = await db
        .insert(paths)
        .values({
          pathId,
          title,
          shortDescription,
          longDescription: longDescription || null,
          category,
          difficulty,
          totalTimeMinutes: totalTime,
          distanceMeters: distance,
          thumbnailUrl,
          markerIconUrl: markerIconUrl || null,
          stylePreset: stylePreset || null,
          createdBy: user.id,
        })
        .returning();

      const pathIdNumber = newPath.id;

      let pointsData: Array<{
        latitude: number;
        longitude: number;
        radiusMeters?: number;
        locationLabel?: string;
        narrationText: string;
        characterId?: number;
        rewardLabel?: string;
        rewardIconUrl?: string;
      }> = [];
      
      if (body.points) {
        try {
          const parsed = typeof body.points === 'string' ? JSON.parse(body.points) : body.points;
          if (!Array.isArray(parsed)) {
            return { success: false, error: "Points must be an array" };
          }
          for (const point of parsed) {
            if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number' || typeof point.narrationText !== 'string') {
              return { success: false, error: "Invalid point structure: latitude, longitude, and narrationText are required" };
            }
          }
          pointsData = parsed;
        } catch (error) {
          console.error("[paths.ts POST] Error parsing points JSON:", error);
          return { success: false, error: "Invalid points data format" };
        }
      }
      
      const createdPoints = [];

      const bodyAny = body as any;
      const audioFiles: Map<number, File> = new Map();
      for (const key in bodyAny) {
        if (key.startsWith('audioFile_')) {
          const index = parseInt(key.replace('audioFile_', ''));
          if (!isNaN(index) && bodyAny[key] instanceof File) {
            audioFiles.set(index, bodyAny[key]);
          }
        }
      }

      for (let i = 0; i < pointsData.length; i++) {
        const pointData = pointsData[i];
        
        let audioUrl: string | undefined = undefined;
        const audioFile = audioFiles.get(i);
        
        if (audioFile) {
          const audioUUID = crypto.randomUUID();
          const audioBuffer = await audioFile.arrayBuffer();
          const mimeType = audioFile.type;
          let extension = ".mp3";
          if (mimeType.includes("wav")) extension = ".wav";
          else if (mimeType.includes("ogg")) extension = ".ogg";
          else if (mimeType.includes("webm")) extension = ".webm";
          else if (mimeType.includes("m4a")) extension = ".m4a";
          
          const fileName = `${audioUUID}${extension}`;
          const filePath = join(process.cwd(), "public", "resources", "audio", fileName);
          
          await mkdir(join(process.cwd(),"public", "resources", "audio"), { recursive: true });
          await Bun.write(filePath, audioBuffer);
          audioUrl = `/resources/audio/${fileName}`;
        }

        const [newPoint] = await db
          .insert(points)
          .values({
            latitude: Number(pointData.latitude),
            longitude: Number(pointData.longitude),
            radiusMeters: Number(pointData.radiusMeters || 50),
            locationLabel: pointData.locationLabel || null,
            narrationText: pointData.narrationText || '',
            characterId: pointData.characterId ? Number(pointData.characterId) : null,
            audioUrl: audioUrl || null,
            rewardLabel: pointData.rewardLabel || null,
            rewardIconUrl: pointData.rewardIconUrl || null,
            isPublic: false,
            createdBy: user.id,
          })
          .returning();

        await db
          .insert(pathPoints)
          .values({
            pathId: pathIdNumber,
            pointId: newPoint.id,
            orderIndex: i,
          });

        createdPoints.push(newPoint);
      }

      return {
        success: true,
        data: {
          ...newPath,
          points: createdPoints,
        },
      };
    },
    {
      auth: true,
      type: "multipart/form-data",
      body: t.Object({
        pathId: t.String(),
        title: t.String(),
        shortDescription: t.String(),
        longDescription: t.Optional(t.String()),
        category: t.String(),
        difficulty: t.String(),
        totalTimeMinutes: t.Optional(t.Union([t.Number(), t.String()])),
        distanceMeters: t.Optional(t.Union([t.Number(), t.String()])),
        thumbnailFile: t.File({
          maxFileSize: "20MB",
          allowedMimeTypes: ["image/jpeg", "image/png"],
        }),
        stylePreset: t.Optional(t.String()),
        markerIconFile: t.Optional(
          t.File({
            maxFileSize: "10MB",
            allowedMimeTypes: ["image/jpeg", "image/png"],
          })
        ),
        points: t.Optional(t.String()),
      }),
    }
  )
  .get("/", async () => {
    const allPaths = await db.select().from(paths);
    const pathIds = allPaths.map(p => p.id);
    let pointsCounts: Record<number, number> = {};
    if (pathIds.length > 0) {
      const counts = await db
        .select({
          pathId: pathPoints.pathId,
          count: count(pathPoints.pointId).as("count")
        })
        .from(pathPoints)
        .where(inArray(pathPoints.pathId, pathIds))
        .groupBy(pathPoints.pathId);

      for (const row of counts) {
        pointsCounts[row.pathId] = Number(row.count);
      }
    }
    for (const p of allPaths) {
      (p as any).pointsCount = pointsCounts[p.id] ?? 0;
    }
    return {
      success: true,
      data: allPaths,
    };
  })
  .get("/:id", async ({ params }) => {
    const [path] = await db
      .select()
      .from(paths)
      .where(eq(paths.pathId, params.id))
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
      })
      .from(pathPoints)
      .innerJoin(points, eq(pathPoints.pointId, points.id))
      .where(eq(pathPoints.pathId, path.id))
      .orderBy(pathPoints.orderIndex);

    return {
      success: true,
      data: {
        ...path,
        points: pathPointsData,
      },
    };})
  .patch(
    "/:id",
    async (context: any) => {
      const { params, body, user } = context;
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }

      let thumbnailUrl: string | undefined;
      let markerIconUrl: string | undefined;

      if (body.thumbnailFile) {
        const uuid = crypto.randomUUID();
        const ext =
          body.thumbnailFile.type === "image/jpeg"
            ? ".jpg"
            : (body.thumbnailFile.type === "image/png" ? ".png" : "");
        const fileName = `${uuid}${ext}`;
        const filePath = join(process.cwd(), "public", "resources", "thumbnails", fileName);
        const fileBuffer = await body.thumbnailFile.arrayBuffer();
        await Bun.write(filePath, fileBuffer);
        thumbnailUrl = `/resources/thumbnails/${fileName}`;
      }

      if (body.markerIconFile) {
        const uuid = crypto.randomUUID();
        const ext =
          body.markerIconFile.type === "image/jpeg"
            ? ".jpg"
            : (body.markerIconFile.type === "image/png" ? ".png" : "");
        const fileName = `${uuid}${ext}`;
        const filePath = join(process.cwd(), "public", "resources", "markers", fileName);
        const fileBuffer = await body.markerIconFile.arrayBuffer();
        await Bun.write(filePath, fileBuffer);
        markerIconUrl = `/resources/markers/${fileName}`;
      }

      
      const {
        thumbnailFile,
        markerIconFile,
        points,
        ...updateData
      } = body;

      if (thumbnailUrl !== undefined) {
        updateData.thumbnailUrl = thumbnailUrl;
      }
      if (markerIconUrl !== undefined) {
        updateData.markerIconUrl = markerIconUrl;
      }
      updateData.updatedAt = new Date();

      if (updateData.totalTimeMinutes !== undefined) {
        updateData.totalTimeMinutes = Number(updateData.totalTimeMinutes);
      }
      
      if (updateData.distanceMeters !== undefined) {
        const d = Number(updateData.distanceMeters);
        updateData.distanceMeters = isNaN(d) ? null : d;
      }
      

      const [updatedPath] = await db
        .update(paths)
        .set(updateData)
        .where(
          and(
            eq(paths.pathId, params.id),
            eq(paths.createdBy, user.id)
          )
        )
        .returning();

      if (!updatedPath) {
        return {
          success: false,
          error: "Path not found or you don't have permission",
        };
      }

      if (typeof points === "string") {
        try {
          const pointsArray: number[] = JSON.parse(points);
          if (!Array.isArray(pointsArray)) {
            return {
              success: false,
              error: "Points must be an array of point IDs",
            };
          }

          const pathIdNumber = updatedPath.id;

          await db
            .delete(pathPoints)
            .where(eq(pathPoints.pathId, pathIdNumber));

          if (pointsArray.length > 0) {
            await db.insert(pathPoints).values(
              pointsArray.map((pointId, idx) => ({
                pathId: pathIdNumber,
                pointId: pointId,
                orderIndex: idx,
              }))
            );
          }
        } catch (err) {
          return {
            success: false,
            error: "Invalid points data: " + (err as Error).message,
          };
        }
      }

      return {
        success: true,
        data: updatedPath,
      };
    },
    {
      auth: true,
      body: t.Object({
        title: t.Optional(t.String()),
        shortDescription: t.Optional(t.String()),
        longDescription: t.Optional(t.String()),
        category: t.Optional(t.String()),
        difficulty: t.Optional(t.String()),
        totalTimeMinutes: t.Optional(t.Union([t.Number(), t.String()])),
        distanceMeters: t.Optional(t.Union([t.Number(), t.String()])),        
        thumbnailFile: t.Optional(t.File({
          maxFileSize: "10MB",
          allowedMimeTypes: ["image/jpeg", "image/png"],
        })),
        stylePreset: t.Optional(t.String()),
        markerIconFile: t.Optional(t.File({
          maxFileSize: "10MB",
          allowedMimeTypes: ["image/jpeg", "image/png"],
        })),
        points: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async (context: any) => {
    const { params, user } = context;
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    const [deletedPath] = await db
      .delete(paths)
      .where(
        and(eq(paths.pathId, params.id), eq(paths.createdBy, user.id))
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
  }, {auth: true})
  .patch("/:id/toggle", async (context: any) => {
    const { params, user } = context;
    if (!user) {
        return { success: false, error: "Unauthorized" };
      }

    const [existingPath] = await db
      .select({ isPublished: paths.isPublished })
      .from(paths)
      .where(
        and(
          eq(paths.pathId, params.id),
          eq(paths.createdBy, user.id)
        )
      )
      .limit(1);

    if (!existingPath) {
      return { success: false, error: "Path not found or you don't have permission" };
    }

    const newIsPublished = !existingPath.isPublished;

    const [updatedPath] = await db
      .update(paths)
      .set({
        isPublished: newIsPublished,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(paths.pathId, params.id),
          eq(paths.createdBy, user.id)
        )
      )
      .returning();

    return {
      success: true,
      data: updatedPath,
    };
  }, {
    auth: true
  })