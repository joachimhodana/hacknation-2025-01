import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { cors } from '@elysiajs/cors'
import { serverTiming } from '@elysiajs/server-timing'
import { openapi } from '@elysiajs/openapi'

const app = new Elysia()

// plugins
app.use(cors())
app.use(serverTiming())
app.use(openapi())

// routes
app.get("/health", () => "OK")

app.mount(auth.handler)

app.listen(process.env.PORT || 8080, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
})