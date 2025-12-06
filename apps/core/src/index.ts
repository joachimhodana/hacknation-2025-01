import { Elysia } from "elysia";
import { auth } from "./auth";

const app = new Elysia().mount(auth.handler)
