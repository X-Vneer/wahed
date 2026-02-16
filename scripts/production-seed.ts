import "dotenv/config"
import db from "../lib/db"

const saudiRegions = [
  {
    id: "region-riyadh",
    nameAr: "منطقة الرياض",
    nameEn: "Riyadh",
    cities: [
      { id: "city-riyadh", nameAr: "الرياض", nameEn: "Riyadh" },
      { id: "city-alkharj", nameAr: "الخرج", nameEn: "Al Kharj" },
      { id: "city-aldawadmi", nameAr: "الدوادمي", nameEn: "Al Dwadmi" },
      { id: "city-almajmaah", nameAr: "المجمعة", nameEn: "Al Majma'ah" },
      { id: "city-alsulayyil", nameAr: "السليل", nameEn: "As Sulayyil" },
      { id: "city-alaflaj", nameAr: "الأفلاج", nameEn: "Al Aflaj" },
      { id: "city-shaqra", nameAr: "شقراء", nameEn: "Shaqra" },
      {
        id: "city-alkharj-hota",
        nameAr: "حوطة بني تميم",
        nameEn: "Hawtat Bani Tamim",
      },
    ],
  },
  {
    id: "region-makkah",
    nameAr: "منطقة مكة المكرمة",
    nameEn: "Makkah",
    cities: [
      { id: "city-makkah", nameAr: "مكة المكرمة", nameEn: "Makkah" },
      { id: "city-jeddah", nameAr: "جدة", nameEn: "Jeddah" },
      { id: "city-taif", nameAr: "الطائف", nameEn: "Taif" },
      { id: "city-rabigh", nameAr: "رابغ", nameEn: "Rabigh" },
      { id: "city-lith", nameAr: "الليث", nameEn: "Al Lith" },
      { id: "city-qunfudhah", nameAr: "القنفذة", nameEn: "Al Qunfudhah" },
      { id: "city-khulais", nameAr: "خليص", nameEn: "Khulais" },
    ],
  },
  {
    id: "region-madinah",
    nameAr: "منطقة المدينة المنورة",
    nameEn: "Al Madinah",
    cities: [
      { id: "city-madinah", nameAr: "المدينة المنورة", nameEn: "Madinah" },
      { id: "city-yanbu", nameAr: "ينبع", nameEn: "Yanbu" },
      { id: "city-badr", nameAr: "بدر", nameEn: "Badr" },
      { id: "city-alula", nameAr: "العلا", nameEn: "AlUla" },
      { id: "city-mahdbadr", nameAr: "خيبر", nameEn: "Khaybar" },
    ],
  },
  {
    id: "region-qassim",
    nameAr: "منطقة القصيم",
    nameEn: "Al Qassim",
    cities: [
      { id: "city-buraidah", nameAr: "بريدة", nameEn: "Buraidah" },
      { id: "city-unaizah", nameAr: "عنيزة", nameEn: "Unaizah" },
      { id: "city-aldawadmi-qassim", nameAr: "الرس", nameEn: "Ar Rass" },
      { id: "city-albukayriyah", nameAr: "البكيرية", nameEn: "Al Bukayriyah" },
      { id: "city-almuthnib", nameAr: "المذنب", nameEn: "Al Mithnab" },
    ],
  },
  {
    id: "region-eastern",
    nameAr: "المنطقة الشرقية",
    nameEn: "Eastern Province",
    cities: [
      { id: "city-dammam", nameAr: "الدمام", nameEn: "Dammam" },
      { id: "city-khobar", nameAr: "الخبر", nameEn: "Al Khobar" },
      { id: "city-dhahran", nameAr: "الظهران", nameEn: "Dhahran" },
      { id: "city-qatif", nameAr: "القطيف", nameEn: "Qatif" },
      { id: "city-jubail", nameAr: "الجبيل", nameEn: "Jubail" },
      { id: "city-hofuf", nameAr: "الهفوف", nameEn: "Al Hofuf" },
      { id: "city-mubarraz", nameAr: "المبرز", nameEn: "Al Mubarraz" },
      { id: "city-khafji", nameAr: "الخفجي", nameEn: "Khafji" },
      { id: "city-ras-tanura", nameAr: "رأس تنورة", nameEn: "Ras Tanura" },
    ],
  },
  {
    id: "region-asir",
    nameAr: "منطقة عسير",
    nameEn: "Asir",
    cities: [
      { id: "city-abha", nameAr: "أبها", nameEn: "Abha" },
      {
        id: "city-khamis-mushait",
        nameAr: "خميس مشيط",
        nameEn: "Khamis Mushait",
      },
      { id: "city-mohayil", nameAr: "محايل عسير", nameEn: "Muhail Asir" },
      { id: "city-sarat-abadah", nameAr: "سراة عبيدة", nameEn: "Sarat Abidah" },
      { id: "city-bisha", nameAr: "بيشة", nameEn: "Bisha" },
    ],
  },
  {
    id: "region-tabuk",
    nameAr: "منطقة تبوك",
    nameEn: "Tabuk",
    cities: [
      { id: "city-tabuk", nameAr: "تبوك", nameEn: "Tabuk" },
      { id: "city-umalj", nameAr: "أملج", nameEn: "Umluj" },
      { id: "city-duba", nameAr: "ضباء", nameEn: "Duba" },
      { id: "city-haql", nameAr: "حقل", nameEn: "Haql" },
    ],
  },
  {
    id: "region-hail",
    nameAr: "منطقة حائل",
    nameEn: "Hail",
    cities: [
      { id: "city-hail", nameAr: "حائل", nameEn: "Hail" },
      { id: "city-baqaa", nameAr: "بقعاء", nameEn: "Baqaa" },
      { id: "city-alshnan", nameAr: "الشنان", nameEn: "Ash Shinan" },
    ],
  },
  {
    id: "region-northern-borders",
    nameAr: "منطقة الحدود الشمالية",
    nameEn: "Northern Borders",
    cities: [
      { id: "city-arar", nameAr: "عرعر", nameEn: "Arar" },
      { id: "city-rafha", nameAr: "رفحاء", nameEn: "Rafha" },
      { id: "city-turayf", nameAr: "طريف", nameEn: "Turaif" },
    ],
  },
  {
    id: "region-jazan",
    nameAr: "منطقة جازان",
    nameEn: "Jazan",
    cities: [
      { id: "city-jazan", nameAr: "جازان", nameEn: "Jazan" },
      { id: "city-sabya", nameAr: "صبيا", nameEn: "Sabya" },
      { id: "city-abu-arish", nameAr: "أبو عريش", nameEn: "Abu Arish" },
      { id: "city-samta", nameAr: "صامطة", nameEn: "Samtah" },
    ],
  },
  {
    id: "region-najran",
    nameAr: "منطقة نجران",
    nameEn: "Najran",
    cities: [
      { id: "city-najran", nameAr: "نجران", nameEn: "Najran" },
      { id: "city-sharurah", nameAr: "شرورة", nameEn: "Sharurah" },
      { id: "city-hubuna", nameAr: "حبونا", nameEn: "Hubuna" },
    ],
  },
  {
    id: "region-al-bahah",
    nameAr: "منطقة الباحة",
    nameEn: "Al Bahah",
    cities: [
      { id: "city-al-bahah", nameAr: "الباحة", nameEn: "Al Bahah" },
      { id: "city-baljurashi", nameAr: "بلجرشي", nameEn: "Baljurashi" },
      { id: "city-almandaq", nameAr: "المندق", nameEn: "Al Mandaq" },
    ],
  },
  {
    id: "region-al-jouf",
    nameAr: "منطقة الجوف",
    nameEn: "Al Jouf",
    cities: [
      { id: "city-skaka", nameAr: "سكاكا", nameEn: "Sakaka" },
      { id: "city-alqurayyat", nameAr: "القريات", nameEn: "Al Qurayyat" },
      {
        id: "city-dumat-aljandal",
        nameAr: "دومة الجندل",
        nameEn: "Dumat Al Jandal",
      },
    ],
  },
]

async function main() {
  let citiesCount = 0
  for (const region of saudiRegions) {
    const dbRegion = await db.region.upsert({
      where: { id: region.id },
      update: { nameAr: region.nameAr, nameEn: region.nameEn },
      create: {
        id: region.id,
        nameAr: region.nameAr,
        nameEn: region.nameEn,
      },
    })

    for (const city of region.cities) {
      await db.city.upsert({
        where: { id: city.id },
        update: {
          nameAr: city.nameAr,
          nameEn: city.nameEn,
          regionId: dbRegion.id,
        },
        create: {
          id: city.id,
          nameAr: city.nameAr,
          nameEn: city.nameEn,
          regionId: dbRegion.id,
        },
      })
      citiesCount++
    }
  }
  console.log(
    `✅ Seeded ${saudiRegions.length} regions and ${citiesCount} cities`
  )

  // Seed 4 fixed system task statuses (labels editable in AR/EN, cannot be deleted)
  const systemTaskStatuses = [
    {
      id: "task-status-pending",
      nameAr: "قيد الانتظار",
      nameEn: "Pending",
      color: "#F59E0B", // Amber/Orange
      isSystem: true,
    },
    {
      id: "task-status-in-progress",
      nameAr: "قيد التنفيذ",
      nameEn: "In Progress",
      color: "#3B82F6", // Blue
      isSystem: true,
    },
    {
      id: "task-status-completed",
      nameAr: "منتهي",
      nameEn: "Done",
      color: "#10B981", // Green
      isSystem: true,
    },
    {
      id: "task-status-cancelled",
      nameAr: "ملغي",
      nameEn: "Canceled",
      color: "#EF4444", // Red
      isSystem: true,
    },
  ]

  for (const status of systemTaskStatuses) {
    await db.taskStatus.upsert({
      where: { id: status.id },
      update: {
        nameAr: status.nameAr,
        nameEn: status.nameEn,
        color: status.color,
        isSystem: status.isSystem,
      },
      create: status,
    })
  }

  console.log("✅ Seeded task statuses")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
