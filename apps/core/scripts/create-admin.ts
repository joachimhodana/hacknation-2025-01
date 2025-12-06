import { db } from "../src/db/index";
import { user, account } from "../src/db/auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "../src/lib/auth";

const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@admin.com";
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "Admin";
const FORCE_RECREATE = process.env.FORCE_RECREATE_ADMIN === "true";

async function createDefaultAdmin() {
  try {
    console.log("Checking for default admin user...");

    // Check if admin user already exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, ADMIN_EMAIL))
      .limit(1);

    if (existingUser && !FORCE_RECREATE) {
      console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
      
      // Ensure the existing user has admin role
      if (existingUser.role !== "admin") {
        await db
          .update(user)
          .set({ role: "admin" })
          .where(eq(user.id, existingUser.id));
        console.log("Updated existing user to admin role.");
      }
      return;
    }

    // If user exists and we're forcing recreation, delete it first
    if (existingUser && FORCE_RECREATE) {
      console.log("Deleting existing admin user to recreate with correct password...");
      // Delete account first (foreign key constraint)
      await db.delete(account).where(eq(account.userId, existingUser.id));
      // Then delete user
      await db.delete(user).where(eq(user.id, existingUser.id));
    }

    console.log(`Creating default admin user: ${ADMIN_EMAIL}`);

    // Use Better Auth's API to create the user (this handles password hashing correctly)
    const mockHeaders = new Headers();
    mockHeaders.set("Content-Type", "application/json");

    const response = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
      headers: mockHeaders,
    });

    if (response.user) {
      // Update the user to be admin and verified
      await db
        .update(user)
        .set({
          role: "admin",
          emailVerified: true,
        })
        .where(eq(user.id, response.user.id));

      console.log(`✅ Default admin user created successfully!`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Role: admin`);
    } else {
      throw new Error("Failed to create user via Better Auth API");
    }
  } catch (error: any) {
    console.error("❌ Error creating default admin user:", error.message || error);
    // Don't throw - allow the app to start even if admin creation fails
  }
}

// Run the script
createDefaultAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

