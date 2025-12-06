import { Elysia, t } from "elysia";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";
import { join } from "path";

export const adminCharactersRoutes = new Elysia({ prefix: "/characters" })
  .use(adminMiddleware)
  .post(
    "/",
    async ({ body, user: adminUser }) => {
      // Create a new character
      if (!adminUser) {
        return { success: false, error: "Unauthorized" };
      }

      let avatarUrl: string | undefined;
      const avatarUUID = crypto.randomUUID();
      if (body.avatarFile) {
        const avatarBuffer = await body.avatarFile.arrayBuffer();
        const mimeType = body.avatarFile.type;
        const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
        const fileName = `${avatarUUID}${extension}`;
        const filePath = join(process.cwd(), "public", "resources", "avatars", fileName);
        await Bun.write(filePath, avatarBuffer);
        avatarUrl = `/public/resources/avatars/${fileName}`;
      }


      const [newCharacter] = await db
        .insert(characters)
        .values({
          ...body,
          createdBy: adminUser.id,
          avatarUrl: avatarUrl
        })
        .returning();



      

      return {
        success: true,
        data: {
          id: newCharacter.id,
          name: newCharacter.name,
          avatarUrl: avatarUrl,
          description: newCharacter.description,
        },
      };
    },
    {
      auth: true, // Use macro for authentication
      body: t.Object({
        name: t.String(),
        avatarFile: t.Optional(t.File({
          maxFileSize: "10MB",
          allowedMimeTypes: ["image/jpeg", "image/png"],
        })),
        description: t.Optional(t.String()),
        voicePreset: t.Optional(t.String()),
      }),
    }
  )
  .get("/", async () => {
    const allCharacters = await db.select().from(characters);
    return {
      success: true,
      data: allCharacters,
    };
  }, { auth: true })
  .get("/:id", async ({ params }) => {
    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, Number(params.id)))
      .limit(1);

    if (!character) {
      return {
        success: false,
        error: "Character not found",
      };
    }

    return {
      success: true,
      data: character,
    };
  }, { auth: true })
  .patch(
    "/:id",
    async (context: any) => {
      const { params, body, user: adminUser } = context;
      if (!adminUser) {
        return { success: false, error: "Unauthorized" };
      }

      // Handle avatar file update if present
      let avatarUrl = undefined;
      if (body.avatarFile) {
        const avatarUUID = crypto.randomUUID();
        const avatarBuffer = await body.avatarFile.arrayBuffer();
        const mimeType = body.avatarFile.type;
        const extension = mimeType === "image/jpeg" ? ".jpg" : ".png";
        const fileName = `${avatarUUID}${extension}`;
        const filePath = join(process.cwd(),"public", "resources", "avatars", fileName);
        await Bun.write(filePath, avatarBuffer);
        avatarUrl = `/resources/avatars/${fileName}`;
      }

      // Prepare update object, removing avatarFile, and updating updatedAt
      const { avatarFile, ...updateData } = body;
      if (avatarUrl !== undefined) {
        updateData.avatarUrl = avatarUrl;
      }
      updateData.updatedAt = new Date();
      const [updatedCharacter] = await db
        .update(characters)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(characters.id, Number(params.id)),
            eq(characters.createdBy, adminUser.id)
          )
        )
        .returning();

      if (!updatedCharacter) {
        return {
          success: false,
          error: "Character not found or you don't have permission",
        };
      }

      return {
        success: true,
        data: updatedCharacter,
      };
    },
    {
      auth: true,
      body: t.Object({
        name: t.Optional(t.String()),
        avatarUrl: t.Optional(t.String()),
        description: t.Optional(t.String()),
        voicePreset: t.Optional(t.String()),
      }),
    }
  )
  .delete("/:id", async (context: any) => {
    const { params, user: adminUser } = context;
    if (!adminUser) {
      return { success: false, error: "Unauthorized" };
    }
    const [deletedCharacter] = await db
      .delete(characters)
      .where(
        and(
          eq(characters.id, Number(params.id)),
          eq(characters.createdBy, adminUser.id)
        )
      )
      .returning();

    if (!deletedCharacter) {
      return {
        success: false,
        error: "Character not found or you don't have permission",
      };
    }

    return {
      success: true,
      message: "Character deleted successfully",
    };
  });
