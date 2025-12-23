import "dotenv/config" // ✅ CRITICAL: Load environment variables
import db from "../lib/db"

async function testDatabase() {
  console.log("🔍 Testing Prisma Postgres connection...\n")

  try {
    // Test 1: Check connection
    await db.$connect()
    console.log("✅ Connected to database!")

    // Test 2: Simple query to verify connection works
    console.log("\n📝 Testing database query...")
    const result = await db.$queryRaw`SELECT 1 as test`
    console.log("✅ Database query successful:", result)

    console.log("\n🎉 All tests passed! Your database is working perfectly.\n")
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

testDatabase()
