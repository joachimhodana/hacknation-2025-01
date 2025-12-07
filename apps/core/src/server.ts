import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { cors } from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { openapi } from "@elysiajs/openapi";
import { staticPlugin } from "@elysiajs/static";
import { adminRoutes } from "./routes/admin";
import { userStatsRoutes } from "./routes/user/stats";
import { userPathsRoutes } from "./routes/user/paths";
import { db } from "./db";
import { user } from "./db/auth-schema";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const app = new Elysia();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8081", // Expo web dev server
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:8081",
  ...(process.env.SERVICE_URL_LANDING ? [process.env.SERVICE_URL_LANDING] : []),
  ...(process.env.SERVICE_URL_ADMIN ? [process.env.SERVICE_URL_ADMIN] : []),
];

const corsConfig = cors({
  credentials: true,
  origin: (request) => {
    const origin = request.headers.get("origin");
    if (!origin) return true;
    return allowedOrigins.includes(origin);
  },
});

app.use(corsConfig);

app.use(serverTiming());
app.use(openapi({ provider: "swagger-ui" }));

app.get("/resources/*", async ({ params, set }) => {
  const path = params["*"] || "";
  
  const publicPath = join(process.cwd(), "public", "resources", path);
  if (existsSync(publicPath)) {
    try {
      const file = await readFile(publicPath);
      const ext = path.split(".").pop()?.toLowerCase();
      const contentType = 
        ext === "png" ? "image/png" :
        ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
        ext === "gif" ? "image/gif" :
        ext === "svg" ? "image/svg+xml" :
        ext === "mp3" ? "audio/mpeg" :
        ext === "wav" ? "audio/wav" :
        "application/octet-stream";
      
      set.headers["Content-Type"] = contentType;
      set.headers["Cache-Control"] = "public, max-age=31536000";
      return file;
    } catch (error) {
      console.error(`[Static] Error reading ${publicPath}:`, error);
    }
  }
  
  const resourcesPath = join(process.cwd(), "resources", path);
  if (existsSync(resourcesPath)) {
    try {
      const file = await readFile(resourcesPath);
      const ext = path.split(".").pop()?.toLowerCase();
      const contentType = 
        ext === "png" ? "image/png" :
        ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
        ext === "gif" ? "image/gif" :
        ext === "svg" ? "image/svg+xml" :
        ext === "mp3" ? "audio/mpeg" :
        ext === "wav" ? "audio/wav" :
        "application/octet-stream";
      
      set.headers["Content-Type"] = contentType;
      set.headers["Cache-Control"] = "public, max-age=31536000";
      return file;
    } catch (error) {
      console.error(`[Static] Error reading ${resourcesPath}:`, error);
    }
  }
  
  set.status = 404;
  return "Not Found";
});

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

app.use(betterAuth);

app.onBeforeHandle(({ request, path }) => {
  if (path.startsWith("/api/auth")) {
    console.log(`[Better Auth] ${request.method} ${path}`, {
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
    });
  }
});

app.get("/health", () => "OK");

app.use(userStatsRoutes);
app.use(userPathsRoutes);

app.use(adminRoutes);

const port = Number(process.env.PORT) || 8080;
const hostname = process.env.HOST || "0.0.0.0";
app.listen(
  {
    port,
    hostname,
  },
  () => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`);
  }
);
