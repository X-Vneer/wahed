import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { SESSION_COOKIE_NAME } from "@/config"
import db from "@/lib/db"
import { verifyToken } from "@/lib/jwt"
import { cookies } from "next/headers"

const f = createUploadthing()

const auth = async () => {
  // Extract the access token from cookies
  const cookiesStore = await cookies()
  const token = cookiesStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return null
  }

  // Verify token and return payload
  const payload = await verifyToken(token)
  if (!payload || !payload.userId) {
    return null
  }

  return {
    userId: payload.userId,
  }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  projectImageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await auth()

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized")

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.user.userId,
        url: file.ufsUrl,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          customId: file.customId,
        },
      }
    }),
  projectAttachmentsUploader: f({
    pdf: { maxFileSize: "64MB", maxFileCount: 10 },
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "256MB", maxFileCount: 10 },
    audio: { maxFileSize: "8MB", maxFileCount: 10 },
    text: { maxFileSize: "32MB", maxFileCount: 10 },
    blob: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const user = await auth()
      if (!user) throw new UploadThingError("Unauthorized")
      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.user.userId,
        url: file.ufsUrl,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          customId: file.customId,
        },
      }
    }),
  userImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await auth()
      if (!user) throw new UploadThingError("Unauthorized")
      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.user.userId,
        url: file.ufsUrl,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          customId: file.customId,
        },
      }
    }),
  bannerImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await auth()
      if (!user) throw new UploadThingError("Unauthorized")
      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.user.userId,
        url: file.ufsUrl,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          customId: file.customId,
        },
      }
    }),
  publicFilesUploader: f({
    pdf: { maxFileSize: "64MB", maxFileCount: 10 },
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "256MB", maxFileCount: 10 },
    audio: { maxFileSize: "8MB", maxFileCount: 10 },
    text: { maxFileSize: "32MB", maxFileCount: 10 },
    blob: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const user = await auth()
      if (!user) throw new UploadThingError("Unauthorized")
      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Persist in SystemFile; ignore type check until Prisma is regenerated
      await db.systemFile.create({
        data: {
          fileUrl: file.ufsUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          additionalInfo: undefined,
        },
      })

      return {
        uploadedBy: metadata.user.userId,
        url: file.ufsUrl,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          customId: file.customId,
        },
      }
    }),
  taskAttachmentsUploader: f({
    pdf: { maxFileSize: "64MB", maxFileCount: 10 },
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    video: { maxFileSize: "256MB", maxFileCount: 10 },
    audio: { maxFileSize: "8MB", maxFileCount: 10 },
    text: { maxFileSize: "32MB", maxFileCount: 10 },
    blob: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const user = await auth()
      if (!user) throw new UploadThingError("Unauthorized")
      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.user.userId,
        url: file.ufsUrl,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          customId: file.customId,
        },
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
