import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { anonymous, admin } from "better-auth/plugins";
import { user, session, account, verification } from "@/db/auth-schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user,
            session,
            account,
            verification,
        },
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8080",
    basePath: "/api/auth",
    trustedOrigins: [
        "http://localhost:3000", // landing
        "http://localhost:3001", // admin
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") || []),
    ],
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
    },
    plugins: [
        anonymous(),
        admin()
    ],
});