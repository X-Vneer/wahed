import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { SESSION_COOKIE_NAME } from "@/config"
import { verifyToken } from "@/lib/jwt"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { userSelect } from "@/prisma/users/select"

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
  imageUploader: f({
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
    .middleware(async ({ req: _req }) => {
      // This code runs on your server before upload
      const user = await auth()

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized")

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { user }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.user.userId)

      console.log("file url", file.ufsUrl)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.user.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
