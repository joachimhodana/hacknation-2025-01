import { Elysia } from "elysia";
import { db } from "@/db";
import { paths, userPathProgress, userItems, points } from "@/db/schema";
import { user } from "@/db/auth-schema";
import { eq, and, inArray, desc, sum, not } from "drizzle-orm";
import { auth } from "@/lib/auth";

// User stats endpoint - requires authentication but not admin
export const userStatsRoutes = new Elysia({ prefix: "/user" })
  .get("/stats", async ({ request }) => {
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const userId = session.user.id;

      // Get all published paths
      const allPublishedPaths = await db
        .select()
        .from(paths)
        .where(eq(paths.isPublished, true));

      const totalPublishedPaths = allPublishedPaths.length;

      // Get completed paths for user
      const completedPaths = await db
        .select()
        .from(userPathProgress)
        .where(
          and(
            eq(userPathProgress.userId, userId),
            eq(userPathProgress.status, "completed")
          )
        );

      const completedPathsCount = completedPaths.length;

      // Calculate completion percentage
      const completionPercentage =
        totalPublishedPaths > 0
          ? Math.round((completedPathsCount / totalPublishedPaths) * 100)
          : 0;

      // Calculate total distance from completed paths
      const completedPathIds = completedPaths.map((p) => p.pathId);
      let totalDistanceMeters = 0;

      if (completedPathIds.length > 0) {
        const completedPathsData = await db
          .select({
            distanceMeters: paths.distanceMeters,
          })
          .from(paths)
          .where(inArray(paths.id, completedPathIds));

        totalDistanceMeters =
          completedPathsData.reduce(
            (sum, path) => sum + (path.distanceMeters || 0),
            0
          ) || 0;
      }

      // Get collected items (rewards from points)
      const collectedItems = await db
        .select({
          id: userItems.id,
          rewardLabel: userItems.rewardLabel,
          rewardIconUrl: userItems.rewardIconUrl,
          pointId: userItems.pointId,
          collectedAt: userItems.collectedAt,
          locationLabel: points.locationLabel,
        })
        .from(userItems)
        .leftJoin(points, eq(userItems.pointId, points.id))
        .where(eq(userItems.userId, userId))
        .orderBy(desc(userItems.collectedAt));

      return {
        success: true,
        data: {
          completionPercentage,
          completedPathsCount,
          totalPublishedPaths,
          totalDistanceMeters,
          totalDistanceKm: Math.round((totalDistanceMeters / 1000) * 10) / 10, // Round to 1 decimal
          collectedItemsCount: collectedItems.length,
          collectedItems: collectedItems.map((item) => ({
            id: item.id.toString(),
            title: item.rewardLabel || "Przedmiot",
            description: item.locationLabel
              ? `Znaleziony w: ${item.locationLabel}`
              : "Opis do uzupełnienia",
            emoji: item.rewardIconUrl ? "🎁" : "📦", // Use icon URL if available, otherwise default emoji
            collected: true,
            placeName: item.locationLabel || "Miejsce do uzupełnienia",
            collectedAt: item.collectedAt
              ? new Date(item.collectedAt).toISOString().split("T")[0]
              : undefined,
          })),
        },
      };
    } catch (error) {
      console.error("[user/stats] Error:", error);
      return {
        success: false,
        error: "Internal server error",
      };
    }
  })
  .get("/leaderboard", async ({ request }) => {
    try {
      // Get session from Better Auth (optional - for identifying current user)
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      const currentUserId = session?.user?.id;

      // Calculate total points (visited stops count) for each user
      // Points = sum of all visitedStopsCount from userPathProgress
      // Exclude anonymous users from leaderboard
      const leaderboardData = await db
        .select({
          userId: userPathProgress.userId,
          totalPoints: sum(userPathProgress.visitedStopsCount).as("totalPoints"),
          userName: user.name,
        })
        .from(userPathProgress)
        .innerJoin(user, eq(userPathProgress.userId, user.id))
        .where(not(eq(user.isAnonymous, true))) // Exclude anonymous users
        .groupBy(userPathProgress.userId, user.name)
        .orderBy(desc(sum(userPathProgress.visitedStopsCount)))
        .limit(10);

      // Format leaderboard response
      const leaderboard = leaderboardData.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        name: entry.userName || "Użytkownik",
        points: Number(entry.totalPoints) || 0,
        isCurrentUser: currentUserId ? entry.userId === currentUserId : false,
      }));

      return {
        success: true,
        data: {
          leaderboard,
        },
      };
    } catch (error) {
      console.error("[user/leaderboard] Error:", error);
      return {
        success: false,
        error: "Internal server error",
      };
    }
  });

