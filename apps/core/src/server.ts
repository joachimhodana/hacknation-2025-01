import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { cors } from "@elysiajs/cors";
import { serverTiming } from "@elysiajs/server-timing";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia();

// plugins
app.use(cors());
app.use(serverTiming());
app.use(openapi({ provider: "swagger-ui" }));
app.use(staticPlugin());

// routes
app.get("/health", () => "OK");

app.mount(auth.handler);

// Admin routes
import { adminRoutes } from "./routes/admin";
import staticPlugin from "@elysiajs/static";
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
