import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { anonymous, admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
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
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8081",
        ...(process.env.SERVICE_URL_LANDING ? [process.env.SERVICE_URL_LANDING] : []),
        ...(process.env.SERVICE_URL_ADMIN ? [process.env.SERVICE_URL_ADMIN] : []),
        ...(process.env.SERVICE_URL_CORE ? [process.env.SERVICE_URL_CORE] : []),
        ...(process.env.SERVICE_URL_DRIZZLE_STUDIO ? [process.env.SERVICE_URL_DRIZZLE_STUDIO] : []),
        "exp://",
        "exp://10.250.163.140:8081",
        "exp://192.168.1.14:8081",
        "exp://192.168.0.150:8081",
        ...(process.env.EXPO_PUBLIC_BETTER_AUTH_URL_NATIVE ? [`exp://${process.env.EXPO_PUBLIC_BETTER_AUTH_URL_NATIVE}`] : []),
        ...(process.env.EXPO_PUBLIC_BETTER_AUTH_URL_WEB ? [`exp://${process.env.EXPO_PUBLIC_BETTER_AUTH_URL_WEB}`] : []),
        "exp://*/*",
        "exp://10.0.0.*:*/*",
        "exp://192.168.*.*:*/*",
        "exp://172.*.*.*:*/*",
        "exp://localhost:*/*"
    ],
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
    },
    plugins: [
        expo(),
        anonymous(),
        admin()
    ],
});