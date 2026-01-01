import "dotenv/config"
import { UserRole } from "../lib/generated/prisma/client"
import { PermissionKey } from "../lib/generated/prisma/enums"
import db from "../lib/db"
import bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Starting seed...")

  // Create all permissions
  const permissions = [
    { key: PermissionKey.PROJECT_CREATE, name: "Create Project" },
    { key: PermissionKey.PROJECT_UPDATE, name: "Update Project" },
    { key: PermissionKey.PROJECT_DELETE, name: "Delete Project" },
    { key: PermissionKey.PROJECT_VIEW, name: "View Project" },
    { key: PermissionKey.PROJECT_ARCHIVE, name: "Archive Project" },
    { key: PermissionKey.PROJECT_UNARCHIVE, name: "Unarchive Project" },
    { key: PermissionKey.TASK_CREATE, name: "Create Task" },
    { key: PermissionKey.TASK_UPDATE, name: "Update Task" },
    { key: PermissionKey.TASK_DELETE, name: "Delete Task" },
    { key: PermissionKey.TASK_ASSIGN, name: "Assign Task" },
    { key: PermissionKey.TASK_VIEW, name: "View Task" },
    { key: PermissionKey.TASK_ARCHIVE, name: "Archive Task" },
    { key: PermissionKey.TASK_UNARCHIVE, name: "Unarchive Task" },
    { key: PermissionKey.TASK_COMPLETE, name: "Complete Task" },
    { key: PermissionKey.FILE_UPLOAD, name: "Upload File" },
    { key: PermissionKey.FILE_DELETE, name: "Delete File" },
    { key: PermissionKey.STAFF_MANAGEMENT, name: "Staff Management" },
    { key: PermissionKey.LIST_CREATE, name: "Create List" },
    { key: PermissionKey.LIST_UPDATE, name: "Update List" },
    { key: PermissionKey.LIST_DELETE, name: "Delete List" },
    { key: PermissionKey.WEBSITE_MANAGEMENT, name: "Website Management" },
    { key: PermissionKey.REPORT_VIEW, name: "View Report" },
    { key: PermissionKey.REPORT_EXPORT, name: "Export Report" },
  ]

  for (const perm of permissions) {
    await db.permission.upsert({
      where: { key: perm.key },
      update: { name: perm.name },
      create: perm,
    })
  }

  console.log("✅ Created/updated permissions")

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
