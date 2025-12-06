import { Elysia } from "elysia";
import { auth } from "./auth";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

export const adminMiddleware = new Elysia()
  .derive(async ({ request, headers }) => {
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({ 
        headers: new Headers(headers as Record<string, string>)
      });
      
      if (!session?.user) {
        return {
          isAdmin: false,
          user: null,
          error: "Unauthorized - Please log in",
        };
      }

      // Check if user is admin
      const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

      if (!userData || userData.role !== "admin") {
        return {
          isAdmin: false,
          user: userData,
          error: "Forbidden - Admin access required",
        };
      }

      return {
        isAdmin: true,
        user: userData,
        error: null,
      };
    } catch (error) {
      return {
        isAdmin: false,
        user: null,
        error: "Unauthorized - Invalid session",
      };
    }
  })
  .onBeforeHandle(({ isAdmin, error }) => {
    if (!isAdmin) {
      return {
        success: false,
        error: error || "Forbidden - Admin access required",
      };
    }
  });

