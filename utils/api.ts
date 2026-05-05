import { getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"
import type { z } from "zod"

import type { Permission } from "@/config"
import { Prisma } from "@/lib/generated/prisma/client"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import type { JWTPayload } from "@/lib/jwt"
import { transformZodError } from "@/utils/transform-errors"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"

export type Translator = Awaited<ReturnType<typeof getTranslations>>

export type DynamicRouteContext<
  T extends Record<string, string> = { id: string },
> = {
  params: Promise<T>
}

export async function initLocale(request: Request): Promise<{
  locale: "ar" | "en"
  t: Translator
}> {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  return { locale, t }
}

export async function requirePermission(
  permission: Permission
): Promise<NextResponse | null> {
  const check = await hasPermission(permission)
  if (!check.hasPermission) {
    return (
      check.error ?? NextResponse.json({ error: "Forbidden" }, { status: 403 })
    )
  }
  return null
}

type RequireAuthResult =
  | { payload: JWTPayload; error?: never }
  | { error: NextResponse; payload?: never }

export async function requireAuth(t: Translator): Promise<RequireAuthResult> {
  const payload = await getAccessTokenPayload()
  if (!payload || !payload.userId) {
    return {
      error: NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      ),
    }
  }
  return { payload }
}

type ValidateResult<T> =
  | { data: T; error?: never }
  | { error: NextResponse; data?: never }

export function validateRequest<S extends z.ZodTypeAny>(
  schema: S,
  body: unknown,
  t: Translator
): ValidateResult<z.infer<S>> {
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      error: NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(result.error),
        },
        { status: 400 }
      ),
    }
  }
  return { data: result.data }
}

export function convertToPrismaJsonValue(
  value: unknown
): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
  if (value === undefined || value === null) {
    return Prisma.JsonNull
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || Prisma.JsonNull
  }
  if (Array.isArray(value)) {
    return value
  }
  return value as Prisma.InputJsonValue
}

export function emptyToNull(s: string | undefined | null): string | null {
  if (s === undefined || s === null) return null
  const t = String(s).trim()
  return t.length ? t : null
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; perPage?: number } = {}
): {
  page: number
  perPage: number
  skip: number
  take: number
} {
  const defaultPage = defaults.page ?? 1
  const defaultPerPage = defaults.perPage ?? 20
  const rawPage = parseInt(searchParams.get("page") || String(defaultPage), 10)
  const rawPerPage = parseInt(
    searchParams.get("per_page") || String(defaultPerPage),
    10
  )
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : defaultPage
  const perPage =
    Number.isFinite(rawPerPage) && rawPerPage > 0 ? rawPerPage : defaultPerPage
  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
  }
}
