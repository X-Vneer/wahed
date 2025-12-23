import "dotenv/config"
import { UserRole } from "../lib/generated/prisma/client"
import db from "../lib/db"
import bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Starting seed...")

  // Hash passwords
  const saltRounds = 10
  const adminPassword = await bcrypt.hash("admin123", saltRounds)
  const staff1Password = await bcrypt.hash("staff123", saltRounds)
  const staff2Password = await bcrypt.hash("staff456", saltRounds)

  // Create admin user
  const admin = await db.user.upsert({
    where: { email: "admin@wahed.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@wahed.com",
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  console.log("✅ Created admin user:", admin.email)

  // Create first staff user
  const staff1 = await db.user.upsert({
    where: { email: "staff1@wahed.com" },
    update: {},
    create: {
      name: "Staff Member One",
      email: "staff1@wahed.com",
      password: staff1Password,
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 1:", staff1.email)

  // Create second staff user
  const staff2 = await db.user.upsert({
    where: { email: "staff2@wahed.com" },
    update: {},
    create: {
      name: "Staff Member Two",
      email: "staff2@wahed.com",
      password: staff2Password,
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 2:", staff2.email)

  console.log("\n📋 Seed Summary:")
  console.log("   Admin: admin@wahed.com / admin123")
  console.log("   Staff 1: staff1@wahed.com / staff123")
  console.log("   Staff 2: staff2@wahed.com / staff456")
  console.log("\n✨ Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
