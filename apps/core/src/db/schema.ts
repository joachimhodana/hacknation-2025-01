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

export { user, session, account, verification };

export const paths = pgTable("paths", {
    id: serial("id").primaryKey(),

    pathId: text("path_id").notNull().unique(),

    title: text("title").notNull(),
    shortDescription: text("short_description").notNull(),
    longDescription: text("long_description"),

    category: text("category").notNull(),
    difficulty: text("difficulty").notNull(),

    totalTimeMinutes: integer("total_time_minutes").notNull(),
    distanceMeters: integer("distance_meters"),

    thumbnailUrl: text("thumbnail_url"),

    isPublished: boolean("is_published").notNull().default(false),

    stylePreset: text("style_preset"),

    markerIconUrl: text("marker_icon_url"),

    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const characters = pgTable("characters", {
    id: serial("id").primaryKey(),

    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    description: text("description"),

    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const points = pgTable("points", {
    id: serial("id").primaryKey(),

    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    radiusMeters: integer("radius_meters").notNull(),

    locationLabel: text("location_label"),

    characterId: integer("character_id").references(() => characters.id, {
        onDelete: "set null",
        onUpdate: "cascade",
    }),

    narrationText: text("narration_text").notNull(),

    audioUrl: text("audio_url"),

    rewardLabel: text("reward_label"),
    rewardIconUrl: text("reward_icon_url"),

    isPublic: boolean("is_public").notNull().default(false),

    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "restrict", onUpdate: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pathPoints = pgTable("path_points", {
    id: serial("id").primaryKey(),

    pathId: integer("path_id")
        .notNull()
        .references(() => paths.id, { onDelete: "cascade", onUpdate: "cascade" }),

    pointId: integer("point_id")
        .notNull()
        .references(() => points.id, { onDelete: "cascade", onUpdate: "cascade" }),

    orderIndex: integer("order_index").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPathProgress = pgTable("user_path_progress", {
    id: serial("id").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    pathId: integer("path_id")
        .notNull()
        .references(() => paths.id, { onDelete: "cascade", onUpdate: "cascade" }),

    status: text("status").notNull().default("in_progress"),

    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),

    visitedStopsCount: integer("visited_stops_count").notNull().default(0),
    lastVisitedStopOrder: integer("last_visited_stop_order"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userPointVisit = pgTable("user_point_visit", {
    id: serial("id").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    pointId: integer("point_id")
        .notNull()
        .references(() => points.id, { onDelete: "cascade", onUpdate: "cascade" }),

    pathProgressId: integer("path_progress_id").references(
        () => userPathProgress.id,
        { onDelete: "set null", onUpdate: "cascade" },
    ),

    firstEnteredAt: timestamp("first_entered_at").notNull().defaultNow(),
    lastEnteredAt: timestamp("last_entered_at").notNull().defaultNow(),
});

export const userItems = pgTable("user_items", {
    id: serial("id").primaryKey(),

    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

    rewardLabel: text("reward_label").notNull(),
    rewardIconUrl: text("reward_icon_url"),

    pointId: integer("point_id")
        .notNull()
        .references(() => points.id, { onDelete: "cascade", onUpdate: "cascade" }),

    collectedAt: timestamp("collected_at").notNull().defaultNow(),
});

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
