import { Elysia, t } from "elysia";
import { db } from "@/db";
import { paths, pathPoints, points } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";
import { join } from "path";
import { mkdir } from "fs/promises";

export const adminPathsRoutes = new Elysia({ prefix: "/paths" })
  .use(adminMiddleware)
  .post(
    "/",
    async (context: any) => {
      const { body, user } = context;
      if (!user) {
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

      return {
        success: true,
        data: newPath,
      };
    },
    {
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