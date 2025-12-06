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

// Better Auth middleware using macro (as per Better Auth docs for Elysia)
// This allows access to user and session in all routes
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

const app = new Elysia();

// plugins
app.use(cors({
  credentials: true,
  origin: (request) => {
    // Allow requests from localhost and trusted origins
    const origin = request.headers.get("origin");
    if (!origin) return true; // Allow same-origin requests
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ];
    return allowedOrigins.includes(origin);
  },
}));
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

// Use Better Auth middleware (includes auth.handler mount)
app.use(betterAuth);

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
