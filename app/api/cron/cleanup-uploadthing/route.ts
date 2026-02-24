import db from "@/lib/db"
import { UTApi } from "uploadthing/server"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Extracts the UploadThing file key from a UFS URL.
 * Supports: https://*.ufs.sh/f/<key>, https://utfs.io/f/<key>
 */
function getFileKeyFromUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl)
    const match = url.pathname.match(/\/f\/(.+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/**
 * POST /api/cron/cleanup-uploadthing
 *
 * Deletes from UploadThing any files that are not referenced in the database
 * (SystemFile, ProjectAttachment, TaskAttachment). Call this from a cron job.
 *
 * Secured by CRON_SECRET: send header "Authorization: Bearer <CRON_SECRET>"
 * or "x-cron-secret: <CRON_SECRET>".
 */
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null
  const headerSecret = request.headers.get("x-cron-secret")

  const provided =
    bearerToken === cronSecret || headerSecret === cronSecret
  if (!provided) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [systemUrls, projectUrls, taskUrls] = await Promise.all([
      db.systemFile.findMany({ select: { fileUrl: true } }),
      db.projectAttachment.findMany({ select: { fileUrl: true } }),
      db.taskAttachment.findMany({ select: { fileUrl: true } }),
    ])

    const allUrls = [
      ...systemUrls.map((r) => r.fileUrl),
      ...projectUrls.map((r) => r.fileUrl),
      ...taskUrls.map((r) => r.fileUrl),
    ]

    const inUseKeys = new Set<string>()
    for (const url of allUrls) {
      const key = getFileKeyFromUrl(url)
      if (key) inUseKeys.add(key)
    }

    const utapi = new UTApi()
    const keysToDelete: string[] = []
    const limit = 500
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const result = await utapi.listFiles({ limit, offset })
      const list = result?.files ?? []

      for (const file of list) {
        const key = file.key
        if (key && !inUseKeys.has(key)) {
          keysToDelete.push(key)
        }
      }

      hasMore = result?.hasMore ?? list.length === limit
      offset += limit
    }

    if (keysToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: "No unused files to delete",
      })
    }

    // Delete in batches (e.g. 50 at a time) to avoid huge request
    const batchSize = 50
    let deleted = 0
    for (let i = 0; i < keysToDelete.length; i += batchSize) {
      const batch = keysToDelete.slice(i, i + batchSize)
      await utapi.deleteFiles(batch)
      deleted += batch.length
    }

    return NextResponse.json({
      success: true,
      deleted,
      message: `Deleted ${deleted} unused file(s) from UploadThing`,
    })
  } catch (error) {
    console.error("UploadThing cleanup error:", error)
    return NextResponse.json(
      {
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
