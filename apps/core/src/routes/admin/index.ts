import { Elysia } from "elysia";
import { adminPathsRoutes } from "./paths";
import { adminPointsRoutes } from "./points";
import { adminCharactersRoutes } from "./characters";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(adminPathsRoutes)
  .use(adminPointsRoutes)
  .use(adminCharactersRoutes);

