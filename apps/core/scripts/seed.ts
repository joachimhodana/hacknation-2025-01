import { db } from "../src/db/index";
import { user, characters, points, paths, pathPoints } from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import { readFile } from "fs/promises";
import { join } from "path";

const SEED_DIR = join(process.cwd(), "seeds");
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@admin.com";
const FORCE_RESET = process.env.FORCE_RESET_SEEDS === "true";

interface CharacterSeed {
  name: string;
  avatarUrl?: string | null;
  description?: string | null;
}

interface PointSeed {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationLabel?: string | null;
  narrationText: string;
  audioUrl?: string | null;
  rewardLabel?: string | null;
  rewardIconUrl?: string | null;
  isPublic: boolean;
  characterId?: number | null; // This will be the index in the characters array after insertion
}

interface PathSeed {
  pathId: string;
  title: string;
  shortDescription: string;
  longDescription?: string | null;
  category: string;
  difficulty: string;
  totalTimeMinutes: number;
  distanceMeters?: number | null;
  thumbnailUrl?: string | null;
  isPublished: boolean;
  stylePreset?: string | null;
  markerIconUrl?: string | null;
}

interface PathPointSeed {
  pathId: string;
  pointOrder: Array<{
    locationLabel: string;
    orderIndex: number;
  }>;
}

async function getAdminUserId(): Promise<string> {
  const [adminUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, DEFAULT_ADMIN_EMAIL))
    .limit(1);

  if (!adminUser) {
    throw new Error(
      `Admin user with email ${DEFAULT_ADMIN_EMAIL} not found. Please run create-admin script first.`
    );
  }

  return adminUser.id;
}

async function seedCharacters(adminUserId: string): Promise<Map<number, number>> {
  console.log("📚 Seeding characters...");

  const filePath = join(SEED_DIR, "characters.json");
  const fileContent = await readFile(filePath, "utf-8");
  const seedData: CharacterSeed[] = JSON.parse(fileContent);

  const characterIdMap = new Map<number, number>(); // seed index -> database id

  for (let i = 0; i < seedData.length; i++) {
    const char = seedData[i];

    // Check if character already exists (by name)
    const [existing] = await db
      .select()
      .from(characters)
      .where(eq(characters.name, char.name))
      .limit(1);

    if (existing && !FORCE_RESET) {
      console.log(`  ⏭️  Character "${char.name}" already exists, skipping...`);
      characterIdMap.set(i, existing.id);
      continue;
    }

    if (existing && FORCE_RESET) {
      await db.delete(characters).where(eq(characters.id, existing.id));
    }

    const [inserted] = await db
      .insert(characters)
      .values({
        name: char.name,
        avatarUrl: char.avatarUrl || null,
        description: char.description || null,
        createdBy: adminUserId,
      })
      .returning();

    characterIdMap.set(i, inserted.id);
    console.log(`  ✅ Created character: ${char.name} (ID: ${inserted.id})`);
  }

  return characterIdMap;
}

async function seedPoints(
  adminUserId: string,
  characterIdMap: Map<number, number>
): Promise<Map<string, number>> {
  console.log("📍 Seeding points...");

  const filePath = join(SEED_DIR, "points.json");
  const fileContent = await readFile(filePath, "utf-8");
  const seedData: PointSeed[] = JSON.parse(fileContent);

  const pointIdMap = new Map<string, number>(); // locationLabel -> database id

  for (const point of seedData) {
    // Check if point already exists (by locationLabel and coordinates)
    let existing;
    if (point.locationLabel) {
      [existing] = await db
        .select()
        .from(points)
        .where(eq(points.locationLabel, point.locationLabel))
        .limit(1);
    }

    if (existing && !FORCE_RESET) {
      // Update audioUrl if it's missing or different
      if (point.audioUrl && existing.audioUrl !== point.audioUrl) {
        await db
          .update(points)
          .set({ audioUrl: point.audioUrl, updatedAt: new Date() })
          .where(eq(points.id, existing.id));
        console.log(
          `  🔄 Updated audioUrl for point "${point.locationLabel || "Unnamed"}"`
        );
      } else {
        console.log(
          `  ⏭️  Point "${point.locationLabel || "Unnamed"}" already exists, skipping...`
        );
      }
      if (point.locationLabel) {
        pointIdMap.set(point.locationLabel, existing.id);
      }
      continue;
    }

    if (existing && FORCE_RESET) {
      await db.delete(points).where(eq(points.id, existing.id));
    }

    // Map characterId from seed index to database id
    let characterDbId: number | null = null;
    if (point.characterId !== null && point.characterId !== undefined) {
      characterDbId = characterIdMap.get(point.characterId) || null;
      if (!characterDbId) {
        console.warn(
          `  ⚠️  Warning: Character index ${point.characterId} not found for point "${point.locationLabel}"`
        );
      }
    }

    const [inserted] = await db
      .insert(points)
      .values({
        latitude: point.latitude,
        longitude: point.longitude,
        radiusMeters: point.radiusMeters,
        locationLabel: point.locationLabel || null,
        narrationText: point.narrationText,
        audioUrl: point.audioUrl || null,
        rewardLabel: point.rewardLabel || null,
        rewardIconUrl: point.rewardIconUrl || null,
        isPublic: point.isPublic,
        characterId: characterDbId,
        createdBy: adminUserId,
      })
      .returning();

    if (point.locationLabel) {
      pointIdMap.set(point.locationLabel, inserted.id);
    }
    console.log(
      `  ✅ Created point: ${point.locationLabel || "Unnamed"} (ID: ${inserted.id})`
    );
  }

  return pointIdMap;
}

async function seedPaths(adminUserId: string): Promise<Map<string, number>> {
  console.log("🛤️  Seeding paths...");

  const filePath = join(SEED_DIR, "paths.json");
  const fileContent = await readFile(filePath, "utf-8");
  const seedData: PathSeed[] = JSON.parse(fileContent);

  const pathIdMap = new Map<string, number>(); // pathId -> database id

  for (const path of seedData) {
    // Check if path already exists (by pathId)
    const [existing] = await db
      .select()
      .from(paths)
      .where(eq(paths.pathId, path.pathId))
      .limit(1);

    if (existing && !FORCE_RESET) {
      console.log(`  ⏭️  Path "${path.pathId}" already exists, skipping...`);
      pathIdMap.set(path.pathId, existing.id);
      continue;
    }

    if (existing && FORCE_RESET) {
      // Delete pathPoints first (foreign key constraint)
      await db.delete(pathPoints).where(eq(pathPoints.pathId, existing.id));
      await db.delete(paths).where(eq(paths.id, existing.id));
    }

    const [inserted] = await db
      .insert(paths)
      .values({
        pathId: path.pathId,
        title: path.title,
        shortDescription: path.shortDescription,
        longDescription: path.longDescription || null,
        category: path.category,
        difficulty: path.difficulty,
        totalTimeMinutes: path.totalTimeMinutes,
        distanceMeters: path.distanceMeters || null,
        thumbnailUrl: path.thumbnailUrl || null,
        isPublished: path.isPublished,
        stylePreset: path.stylePreset || null,
        markerIconUrl: path.markerIconUrl || null,
        createdBy: adminUserId,
      })
      .returning();

    pathIdMap.set(path.pathId, inserted.id);
    console.log(`  ✅ Created path: ${path.title} (${path.pathId}, ID: ${inserted.id})`);
  }

  return pathIdMap;
}

async function seedPathPoints(
  pathIdMap: Map<string, number>,
  pointIdMap: Map<string, number>
): Promise<void> {
  console.log("🔗 Seeding path-point relationships...");

  const filePath = join(SEED_DIR, "path-points.json");
  const fileContent = await readFile(filePath, "utf-8");
  const seedData: PathPointSeed[] = JSON.parse(fileContent);

  for (const pathPoint of seedData) {
    const pathDbId = pathIdMap.get(pathPoint.pathId);
    if (!pathDbId) {
      console.warn(
        `  ⚠️  Warning: Path "${pathPoint.pathId}" not found, skipping path-point relationships...`
      );
      continue;
    }

    // Delete existing pathPoints for this path if FORCE_RESET
    if (FORCE_RESET) {
      await db.delete(pathPoints).where(eq(pathPoints.pathId, pathDbId));
    }

    for (const pointOrder of pathPoint.pointOrder) {
      const pointDbId = pointIdMap.get(pointOrder.locationLabel);
      if (!pointDbId) {
        console.warn(
          `  ⚠️  Warning: Point with locationLabel "${pointOrder.locationLabel}" not found, skipping...`
        );
        continue;
      }

      // Check if relationship already exists
      if (!FORCE_RESET) {
        const [existing] = await db
          .select()
          .from(pathPoints)
          .where(
            and(
              eq(pathPoints.pathId, pathDbId),
              eq(pathPoints.pointId, pointDbId)
            )
          )
          .limit(1);

        if (existing) {
          console.log(
            `  ⏭️  Path-point relationship already exists for path "${pathPoint.pathId}" and point "${pointOrder.locationLabel}", skipping...`
          );
          continue;
        }
      }

      await db.insert(pathPoints).values({
        pathId: pathDbId,
        pointId: pointDbId,
        orderIndex: pointOrder.orderIndex,
      });

      console.log(
        `  ✅ Linked path "${pathPoint.pathId}" to point "${pointOrder.locationLabel}" (order: ${pointOrder.orderIndex})`
      );
    }
  }
}

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");
    console.log(`   Force reset: ${FORCE_RESET ? "YES" : "NO"}`);

    // Get admin user ID
    const adminUserId = await getAdminUserId();
    console.log(`   Using admin user: ${adminUserId}`);

    // Seed in order: characters -> points -> paths -> pathPoints
    const characterIdMap = await seedCharacters(adminUserId);
    const pointIdMap = await seedPoints(adminUserId, characterIdMap);
    const pathIdMap = await seedPaths(adminUserId);
    await seedPathPoints(pathIdMap, pointIdMap);

    console.log("\n✅ Database seeding completed successfully!");
  } catch (error: any) {
    console.error("❌ Error during database seeding:", error.message || error);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

