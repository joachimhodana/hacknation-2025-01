import { Elysia, t } from "elysia";
import { db } from "@/db";
import { characters } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminMiddleware } from "@/lib/admin-middleware";

export const adminCharactersRoutes = new Elysia({ prefix: "/characters" })
  .use(adminMiddleware)
  .post(
    "/",
    async (context: any) => {
      // Create a new character
      const { body, user: adminUser } = context;
      if (!adminUser) {
        return { success: false, error: "Unauthorized" };
      }
      const [newCharacter] = await db
        .insert(characters)
        .values({
          ...body,
          createdBy: adminUser.id,
        })
        .returning();

      return {
        success: true,
        data: newCharacter,
      };
    },
    {
      body: t.Object({
        name: t.String(),
        avatarUrl: t.Optional(t.String()),
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
  })
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
  })
  .put(
    "/:id",
    async (context: any) => {
      const { params, body, user: adminUser } = context;
      if (!adminUser) {
        return { success: false, error: "Unauthorized" };
      }
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
