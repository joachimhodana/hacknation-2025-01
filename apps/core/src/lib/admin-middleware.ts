import { Elysia } from "elysia";
import { auth } from "./auth";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

// Better Auth middleware using macro (recommended approach for Elysia)
export const adminMiddleware = new Elysia({ name: "better-auth" })
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        try {
          console.log("[adminMiddleware macro] Getting session...");
          const session = await auth.api.getSession({
            headers,
          });

          if (!session?.user) {
            console.log("[adminMiddleware macro] No session or user found");
            return status(401);
          }

          // Check if user is admin
          const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);

          if (!userData || userData.role !== "admin") {
            console.log(`[adminMiddleware macro] User ${session.user.id} is not admin. Role: ${userData?.role || "none"}`);
            return status(403);
          }

          console.log(`[adminMiddleware macro] User authenticated: ${userData.id}, role: ${userData.role}`);
          return {
            user: userData,
            session: session.session,
          };
        } catch (error) {
          console.error("[adminMiddleware macro] Error getting session:", error);
          return status(401);
        }
      },
    },
  })
  // Also provide derive for backward compatibility and direct access
  .derive(async ({ request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
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
      console.error("[adminMiddleware derive] Error getting session:", error);
      return {
        isAdmin: false,
        user: null,
        error: "Unauthorized - Invalid session",
      };
    }
  })
  .onBeforeHandle(({ isAdmin, error, request, user }) => {
    if (!isAdmin) {
      return {
        success: false,
        error: error || "Forbidden - Admin access required",
      };
    }
  });

