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
        "http://localhost:3000", // landing
        "http://localhost:3001", // admin
        "http://localhost:8081", // Expo web dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:8081",
        "exp://",
        "exp://10.250.163.140:8081",
        "exp://*/*",                 // Trust all Expo development URLs
        "exp://10.0.0.*:*/*",        // Trust 10.0.0.x IP range
        "exp://192.168.*.*:*/*",     // Trust 192.168.x.x IP range
        "exp://172.*.*.*:*/*",       // Trust 172.x.x.x IP range
        "exp://localhost:*/*"        // Trust localhost
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