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

    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, ADMIN_EMAIL))
      .limit(1);

    if (existingUser && !FORCE_RECREATE) {
      console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
      
      if (existingUser.role !== "admin") {
        await db
          .update(user)
          .set({ role: "admin" })
          .where(eq(user.id, existingUser.id));
        console.log("Updated existing user to admin role.");
      }
      return;
    }

    if (existingUser && FORCE_RECREATE) {
      console.log("Deleting existing admin user to recreate with correct password...");
      await db.delete(account).where(eq(account.userId, existingUser.id));
      await db.delete(user).where(eq(user.id, existingUser.id));
    }

    console.log(`Creating default admin user: ${ADMIN_EMAIL}`);

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
  }
}

createDefaultAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

