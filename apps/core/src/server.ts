import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { cors } from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { openapi } from "@elysiajs/openapi";
// @ts-ignore - static plugin types may not be available
import { staticPlugin } from "@elysiajs/static";
import { adminRoutes } from "./routes/admin";
import { db } from "./db";
import { user } from "./db/auth-schema";
import { eq } from "drizzle-orm";

const app = new Elysia();

// CORS configuration - must be applied before Better Auth
const corsConfig = cors({
  credentials: true,
  origin: (request) => {
    // Allow requests from localhost and trusted origins
    const origin = request.headers.get("origin");
    if (!origin) return true; // Allow same-origin requests
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8081", // Expo web dev server
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:8081",
    ];
    return allowedOrigins.includes(origin);
  },
});

// Apply CORS globally first
app.use(corsConfig);

app.use(serverTiming());
app.use(openapi({ provider: "swagger-ui" }));

// Serve static files from resources directory using staticPlugin
// This is more efficient than custom route and handles caching, content-type, etc.
app.use(staticPlugin({
  assets: "./resources",
  prefix: "/resources",
  // Don't fail if directory doesn't exist - it will be created on first upload
  ignorePatterns: [],
}));

// Better Auth middleware using macro (as per Better Auth docs for Elysia)
// This allows access to user and session in all routes
// Mount Better Auth handler - must be after CORS is applied globally
const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        try {
          const session = await auth.api.getSession({
            headers,
          });

          if (!session) return status(401);

          return {
            user: session.user,
            session: session.session,
          };
        } catch (error) {
          console.error("[betterAuth macro] Error getting session:", error);
          return status(401);
        }
      },
    },
  });

// Use Better Auth middleware (includes auth.handler mount)
app.use(betterAuth);

// Debug: Log all requests to /api/auth/*
app.onBeforeHandle(({ request, path }) => {
  if (path.startsWith("/api/auth")) {
    console.log(`[Better Auth] ${request.method} ${path}`, {
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
    });
  }
});

// routes
app.get("/health", () => "OK");

// Admin routes
app.use(adminRoutes);

const port = Number(process.env.PORT) || 8080;
app.listen(
  {
    port,
    hostname: "0.0.0.0",
  },
  () => {
    console.log(`🦊 Elysia is running at 0.0.0.0:${port}`);
  }
);
