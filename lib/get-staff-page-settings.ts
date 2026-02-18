import db from "@/lib/db"

const DEFAULT_ATTENDANCE_LINK = "/attendance"
const DEFAULT_ACCOUNTING_LINK = "/accounting"

export type StaffPageSettings = {
  heroBackgroundImageUrl: string | null
  attendanceLink: string
  accountingLink: string
}

export async function getStaffPageSettings(): Promise<StaffPageSettings> {
  let settings = await db.staffPageSettings.findFirst({
    orderBy: { createdAt: "asc" },
  })

  if (!settings) {
    settings = await db.staffPageSettings.create({
      data: {
        attendanceLink: DEFAULT_ATTENDANCE_LINK,
        accountingLink: DEFAULT_ACCOUNTING_LINK,
      },
    })
  }

  return {
    heroBackgroundImageUrl: settings.heroBackgroundImageUrl,
    attendanceLink: settings.attendanceLink || DEFAULT_ATTENDANCE_LINK,
    accountingLink: settings.accountingLink || DEFAULT_ACCOUNTING_LINK,
  }
}
