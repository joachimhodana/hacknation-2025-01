import { Elysia, t } from "elysia";
import { db } from "@/db";
import { paths, pathPoints, points } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";
import { join } from "path";
import { mkdir } from "fs/promises";

// Point structure schema for validation
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
    async ({ body, user }) => {
      console.log("[paths.ts POST] Handler called");
      console.log("[paths.ts POST] User:", user ? `id: ${user.id}` : "null");
      if (!user) {
        console.log("[paths.ts POST] No user found, returning Unauthorized");
        return { success: false, error: "Unauthorized" };
      }
      // Step 1: Save thumbnail file
      const thumbnailUUID = crypto.randomUUID();
      let thumbnailUrl: string | undefined;
      
      if (body.thumbnailFile) {
        const thumbnailBuffer = await body.thumbnailFile.arrayBuffer();
        const mimeType = body.thumbnailFile.type;
        const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
        const fileName = `${thumbnailUUID}${extension}`;
        const filePath = join(process.cwd(), "resources", "thumbnails", fileName);
        
        // Ensure directory exists
        await mkdir(join(process.cwd(), "resources", "thumbnails"), { recursive: true });
        
        await Bun.write(filePath, thumbnailBuffer);
        thumbnailUrl = `/resources/thumbnails/${fileName}`;
      }

      // Step 2: Save marker icon file (if provided)
      const markerIconUUID = crypto.randomUUID();
      let markerIconUrl: string | undefined;
      
      if (body.markerIconFile) {
        const markerIconBuffer = await body.markerIconFile.arrayBuffer();
        const mimeType = body.markerIconFile.type;
        const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
        const fileName = `${markerIconUUID}${extension}`;
        const filePath = join(process.cwd(), "resources", "marker_icons", fileName);
        
        // Ensure directory exists
        await mkdir(join(process.cwd(), "resources", "marker_icons"), { recursive: true });
        
        await Bun.write(filePath, markerIconBuffer);
        markerIconUrl = `/resources/marker_icons/${fileName}`;
      }

      // Step 3: Create path with basic info
      const { thumbnailFile, markerIconFile, totalTimeMinutes, distanceMeters, ...pathData } = body;
      
      // Convert FormData strings to numbers if needed
      const totalTime = totalTimeMinutes 
        ? (typeof totalTimeMinutes === 'string' ? Number(totalTimeMinutes) : totalTimeMinutes)
        : 0;
      const distance = distanceMeters !== undefined && distanceMeters !== null
        ? (typeof distanceMeters === 'string' ? Number(distanceMeters) : distanceMeters)
        : null;
      
      // Extract only valid path fields to avoid passing invalid data
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

      // Step 4: Create points if provided
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
          // Validate that it's an array
          if (!Array.isArray(parsed)) {
            return { success: false, error: "Points must be an array" };
          }
          // Validate each point structure matches PointSchema
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

      // Get all audio files from body (they may have dynamic keys like audioFile_0, audioFile_1, etc.)
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
        
        // Handle audio file for this point
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
          const filePath = join(process.cwd(), "resources", "audio", fileName);
          
          await mkdir(join(process.cwd(), "resources", "audio"), { recursive: true });
          await Bun.write(filePath, audioBuffer);
          audioUrl = `/resources/audio/${fileName}`;
        }

        // Create point
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

        // Link point to path
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
      auth: true, // Use macro for authentication
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
        points: t.Optional(t.String()), // JSON string of points array - structure: Array<PointSchema> where PointSchema = {latitude: number, longitude: number, radiusMeters?: number, locationLabel?: string, narrationText: string, characterId?: number, rewardLabel?: string, rewardIconUrl?: string} - structure: Array<PointSchema>
        // Audio files will be handled dynamically (audioFile_0, audioFile_1, etc.)
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
    async (context: any) => {
      const { params, body, user } = context;
      if (!user) {
        return { success: false, error: "Unauthorized" };
      }
      const [updatedPath] = await db
        .update(paths)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(
          and(eq(paths.id, Number(params.id)), eq(paths.createdBy, user.id))
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
        thumbnailFile: t.Optional(t.File({
          maxFileSize: "20MB",
          allowedMimeTypes: ["image/jpeg", "image/png"],
        })),
        isPublished: t.Optional(t.Boolean()),
        stylePreset: t.Optional(t.String()),
        markerIconFile: t.Optional(t.File({
          maxFileSize: "10MB",
          allowedMimeTypes: ["image/jpeg", "image/png"],
        })),
      }),
      type: "multipart/form-data",
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
        and(eq(paths.id, Number(params.id)), eq(paths.createdBy, user.id))
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