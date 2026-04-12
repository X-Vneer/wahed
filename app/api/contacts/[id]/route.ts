import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { hasPermission } from "@/utils/has-permission"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.WEBSITE.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await params

    const contact = await db.contactMessage.findUnique({
      where: { id },
    })

    if (!contact) {
      return NextResponse.json(
        { error: t("contacts.errors.not_found") },
        { status: 404 }
      )
    }

    // Mark as read when viewed
    if (!contact.isRead) {
      await db.contactMessage.update({
        where: { id },
        data: { isRead: true },
      })
    }

    return NextResponse.json({ ...contact, isRead: true })
  } catch (error) {
    console.error("Error fetching contact:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.WEBSITE.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await params

    const contact = await db.contactMessage.findUnique({
      where: { id },
    })

    if (!contact) {
      return NextResponse.json(
        { error: t("contacts.errors.not_found") },
        { status: 404 }
      )
    }

    await db.contactMessage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.WEBSITE.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await params
    const body = await request.json()

    const contact = await db.contactMessage.findUnique({
      where: { id },
    })

    if (!contact) {
      return NextResponse.json(
        { error: t("contacts.errors.not_found") },
        { status: 404 }
      )
    }

    const updated = await db.contactMessage.update({
      where: { id },
      data: { isRead: Boolean(body.isRead) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
