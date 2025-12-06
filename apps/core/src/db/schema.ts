import { user, session, account, verification } from "@/db/auth-schema";
import {
    pgTable,
    text,
    timestamp,
    integer,
    boolean,
    doublePrecision,
    serial,
} from "drizzle-orm/pg-core";

// Re-export all auth tables for Better Auth adapter
export { user, session, account, verification };


// Main routes (paths)
export const paths = pgTable("paths", {
    id: serial("id").primaryKey(),

    pathId: text("path_id").notNull().unique(), // e.g. "route_001"

    title: text("title").notNull(),
    shortDescription: text("short_description").notNull(),
    longDescription: text("long_description"),

    category: text("category").notNull(),
    difficulty: text("difficulty").notNull(),

    totalTimeMinutes: integer("total_time_minutes").notNull(),
    distanceMeters: integer("distance_meters"),

    thumbnailUrl: text("thumbnail_url"),

    isPublished: boolean("is_published").notNull().default(false),

    // Style preset used by the UI (e.g. "historic", "baroque", "magic")
    stylePreset: text("style_preset"),

    // Optional custom marker icon override
    markerIconUrl: text("marker_icon_url"),

    // Admin who created this path
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Characters available in the experience
export const characters = pgTable("characters", {
    id: serial("id").primaryKey(),

    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    description: text("description"),

    // Admin who created this character
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Global reusable map points
export const points = pgTable("points", {
    id: serial("id").primaryKey(),

    // Geofence
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    radiusMeters: integer("radius_meters").notNull(),

    locationLabel: text("location_label"),

    // Optional character that appears at this point
    characterId: integer("character_id").references(() => characters.id, {
        onDelete: "set null",
        onUpdate: "cascade",
    }),

    // Short narration (auto-triggered on entering geofence)
    narrationText: text("narration_text").notNull(),

    audioUrl: text("audio_url"),

    // Reward obtained when a user enters this point
    rewardLabel: text("reward_label"),
    rewardIconUrl: text("reward_icon_url"),

    // If true, this point appears on public map even without starting a path
    isPublic: boolean("is_public").notNull().default(false),

    // Admin who created this point
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Many-to-many relation between paths and points
export const pathPoints = pgTable("path_points", {
    id: serial("id").primaryKey(),

    pathId: integer("path_id")
        .notNull()
        .references(() => paths.id, { onDelete: "cascade", onUpdate: "cascade" }),

    pointId: integer("point_id")
        .notNull()
        .references(() => points.id, { onDelete: "cascade", onUpdate: "cascade" }),

    orderIndex: integer("order_index").notNull(), // point order inside a path

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

//
// -----------------------
// User progress
// -----------------------
//

// Progress of a user on a specific path
export const userPathProgress = pgTable("user_path_progress", {
    id: serial("id").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    pathId: integer("path_id")
        .notNull()
        .references(() => paths.id, { onDelete: "cascade", onUpdate: "cascade" }),

    status: text("status").notNull().default("in_progress"), // "not_started" | "in_progress" | "completed"

    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),

    visitedStopsCount: integer("visited_stops_count").notNull().default(0),
    lastVisitedStopOrder: integer("last_visited_stop_order"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User entering a point (global, not bound to a path)
export const userPointVisit = pgTable("user_point_visit", {
    id: serial("id").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    pointId: integer("point_id")
        .notNull()
        .references(() => points.id, { onDelete: "cascade", onUpdate: "cascade" }),

    // Optional link to progress session of a path
    pathProgressId: integer("path_progress_id").references(
        () => userPathProgress.id,
        { onDelete: "set null", onUpdate: "cascade" },
    ),

    firstEnteredAt: timestamp("first_entered_at").notNull().defaultNow(),
    lastEnteredAt: timestamp("last_entered_at").notNull().defaultNow(),
});

// Items collected by the user from point rewards
export const userItems = pgTable("user_items", {
    id: serial("id").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    // the item rewarded by a point
    rewardLabel: text("reward_label").notNull(),
    rewardIconUrl: text("reward_icon_url"),

    pointId: integer("point_id")
        .notNull()
        .references(() => points.id, { onDelete: "cascade", onUpdate: "cascade" }),

    collectedAt: timestamp("collected_at").notNull().defaultNow(),
});

// Characters unlocked/collected by the user
export const userCharacters = pgTable("user_characters", {
    id: serial("id").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    characterId: integer("character_id")
        .notNull()
        .references(() => characters.id, { onDelete: "cascade", onUpdate: "cascade" }),

    unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});
