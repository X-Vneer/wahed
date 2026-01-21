import "dotenv/config"
import { UserRole } from "../lib/generated/prisma/client"
import { PermissionKey } from "../lib/generated/prisma/enums"
import db from "../lib/db"
import bcrypt from "bcryptjs"

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
    { key: "WEBSITE_CREATE" as PermissionKey, name: "Create Website" },
    { key: "WEBSITE_UPDATE" as PermissionKey, name: "Update Website" },
    { key: "WEBSITE_DELETE" as PermissionKey, name: "Delete Website" },
    { key: "WEBSITE_VIEW" as PermissionKey, name: "View Website" },
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
  const staff3Password = await bcrypt.hash("staff789", saltRounds)
  const staff4Password = await bcrypt.hash("staff012", saltRounds)
  const staff5Password = await bcrypt.hash("staff345", saltRounds)
  const staff6Password = await bcrypt.hash("staff678", saltRounds)
  const staff7Password = await bcrypt.hash("staff901", saltRounds)

  // Create admin user
  const admin = await db.user.upsert({
    where: { email: "admin@wahed.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@wahed.com",
      password: adminPassword,
      phone: "+966501234567",
      roleName: "System Administrator",
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  console.log("✅ Created admin user:", admin.email)

  // Assign all permissions to admin
  for (const perm of permissions) {
    const permission = await db.permission.findUnique({
      where: { key: perm.key },
    })
    if (permission) {
      await db.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: admin.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: admin.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log("✅ Assigned all permissions to admin")

  // Create first staff user
  const staff1 = await db.user.upsert({
    where: { email: "staff1@wahed.com" },
    update: {},
    create: {
      name: "Staff Member One",
      email: "staff1@wahed.com",
      password: staff1Password,
      phone: "+966502345678",
      roleName: "Project Manager",
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 1:", staff1.email)

  // Assign permissions to staff1
  const staff1Permissions = [
    PermissionKey.PROJECT_VIEW,
    PermissionKey.PROJECT_CREATE,
    PermissionKey.PROJECT_UPDATE,
    PermissionKey.TASK_VIEW,
    PermissionKey.TASK_CREATE,
    PermissionKey.TASK_UPDATE,
    PermissionKey.TASK_ASSIGN,
    PermissionKey.FILE_UPLOAD,
    PermissionKey.REPORT_VIEW,
  ]
  for (const permKey of staff1Permissions) {
    const permission = await db.permission.findUnique({
      where: { key: permKey },
    })
    if (permission) {
      await db.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: staff1.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: staff1.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log("✅ Assigned permissions to staff user 1")

  // Create second staff user
  const staff2 = await db.user.upsert({
    where: { email: "staff2@wahed.com" },
    update: {},
    create: {
      name: "Staff Member Two",
      email: "staff2@wahed.com",
      password: staff2Password,
      phone: "+966503456789",
      roleName: "Developer",
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 2:", staff2.email)

  // Assign permissions to staff2
  const staff2Permissions = [
    PermissionKey.PROJECT_VIEW,
    PermissionKey.TASK_VIEW,
    PermissionKey.TASK_CREATE,
    PermissionKey.TASK_UPDATE,
    PermissionKey.TASK_COMPLETE,
    PermissionKey.FILE_UPLOAD,
  ]
  for (const permKey of staff2Permissions) {
    const permission = await db.permission.findUnique({
      where: { key: permKey },
    })
    if (permission) {
      await db.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: staff2.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: staff2.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log("✅ Assigned permissions to staff user 2")

  // Create third staff user
  const staff3 = await db.user.upsert({
    where: { email: "staff3@wahed.com" },
    update: {},
    create: {
      name: "Staff Member Three",
      email: "staff3@wahed.com",
      password: staff3Password,
      phone: "+966504567890",
      roleName: "Designer",
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 3:", staff3.email)

  // Assign permissions to staff3
  const staff3Permissions = [
    PermissionKey.PROJECT_VIEW,
    PermissionKey.TASK_VIEW,
    PermissionKey.TASK_CREATE,
    PermissionKey.TASK_UPDATE,
    PermissionKey.FILE_UPLOAD,
  ]
  for (const permKey of staff3Permissions) {
    const permission = await db.permission.findUnique({
      where: { key: permKey },
    })
    if (permission) {
      await db.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: staff3.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: staff3.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log("✅ Assigned permissions to staff user 3")

  // Create fourth staff user
  const staff4 = await db.user.upsert({
    where: { email: "staff4@wahed.com" },
    update: {},
    create: {
      name: "Staff Member Four",
      email: "staff4@wahed.com",
      password: staff4Password,
      phone: "+966505678901",
      roleName: "Content Manager",
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 4:", staff4.email)

  // Assign permissions to staff4
  const staff4Permissions = [
    PermissionKey.PROJECT_VIEW,
    PermissionKey.TASK_VIEW,
    "WEBSITE_VIEW" as PermissionKey,
    "WEBSITE_CREATE" as PermissionKey,
    "WEBSITE_UPDATE" as PermissionKey,
    "WEBSITE_DELETE" as PermissionKey,

    PermissionKey.FILE_UPLOAD,
  ]
  for (const permKey of staff4Permissions) {
    const permission = await db.permission.findUnique({
      where: { key: permKey },
    })
    if (permission) {
      await db.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: staff4.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: staff4.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log("✅ Assigned permissions to staff user 4")

  // Create fifth staff user
  const staff5 = await db.user.upsert({
    where: { email: "staff5@wahed.com" },
    update: {},
    create: {
      name: "Staff Member Five",
      email: "staff5@wahed.com",
      password: staff5Password,
      phone: "+966506789012",
      roleName: "Analyst",
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 5:", staff5.email)

  // Assign permissions to staff5
  const staff5Permissions = [
    PermissionKey.PROJECT_VIEW,
    PermissionKey.TASK_VIEW,
    PermissionKey.REPORT_VIEW,
    PermissionKey.REPORT_EXPORT,
  ]
  for (const permKey of staff5Permissions) {
    const permission = await db.permission.findUnique({
      where: { key: permKey },
    })
    if (permission) {
      await db.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: staff5.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: staff5.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log("✅ Assigned permissions to staff user 5")

  // Create sixth staff user
  const staff6 = await db.user.upsert({
    where: { email: "staff6@wahed.com" },
    update: {},
    create: {
      name: "Staff Member Six",
      email: "staff6@wahed.com",
      password: staff6Password,
      phone: "+966507890123",
      roleName: "Coordinator",
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 6:", staff6.email)

  // Assign permissions to staff6
  const staff6Permissions = [
    PermissionKey.PROJECT_VIEW,
    PermissionKey.TASK_VIEW,
    PermissionKey.TASK_CREATE,
    PermissionKey.TASK_UPDATE,
    PermissionKey.TASK_ASSIGN,
    PermissionKey.LIST_CREATE,
    PermissionKey.LIST_UPDATE,
    PermissionKey.LIST_DELETE,
  ]
  for (const permKey of staff6Permissions) {
    const permission = await db.permission.findUnique({
      where: { key: permKey },
    })
    if (permission) {
      await db.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: staff6.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: staff6.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log("✅ Assigned permissions to staff user 6")

  // Create seventh staff user
  const staff7 = await db.user.upsert({
    where: { email: "staff7@wahed.com" },
    update: {},
    create: {
      name: "Staff Member Seven",
      email: "staff7@wahed.com",
      password: staff7Password,
      phone: "+966508901234",
      roleName: "Viewer",
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  console.log("✅ Created staff user 7:", staff7.email)

  // Assign permissions to staff7 (read-only access)
  const staff7Permissions = [
    PermissionKey.PROJECT_VIEW,
    PermissionKey.TASK_VIEW,
  ]
  for (const permKey of staff7Permissions) {
    const permission = await db.permission.findUnique({
      where: { key: permKey },
    })
    if (permission) {
      await db.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: staff7.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: staff7.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log("✅ Assigned permissions to staff user 7")

  // Seed Saudi Arabia regions and cities
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
    }
  }

  console.log("✅ Seeded Saudi Arabia regions and cities")

  // Seed task statuses
  const taskStatuses = [
    {
      id: "task-status-pending",
      nameAr: "قيد الانتظار",
      nameEn: "Pending",
      color: "#F59E0B", // Amber/Orange
    },
    {
      id: "task-status-in-progress",
      nameAr: "قيد التنفيذ",
      nameEn: "In Progress",
      color: "#3B82F6", // Blue
    },
    {
      id: "task-status-completed",
      nameAr: "مكتمل",
      nameEn: "Completed",
      color: "#10B981", // Green
    },
    {
      id: "task-status-cancelled",
      nameAr: "ملغي",
      nameEn: "Cancelled",
      color: "#EF4444", // Red
    },
  ]

  for (const status of taskStatuses) {
    await db.taskStatus.upsert({
      where: { id: status.id },
      update: {
        nameAr: status.nameAr,
        nameEn: status.nameEn,
        color: status.color,
      },
      create: status,
    })
  }

  console.log("✅ Seeded task statuses")

  // Seed task categories
  const taskCategories = [
    {
      id: "task-category-development",
      nameAr: "تطوير",
      nameEn: "Development",
      isActive: true,
    },
    {
      id: "task-category-design",
      nameAr: "تصميم",
      nameEn: "Design",
      isActive: true,
    },
    {
      id: "task-category-testing",
      nameAr: "اختبار",
      nameEn: "Testing",
      isActive: true,
    },
    {
      id: "task-category-documentation",
      nameAr: "توثيق",
      nameEn: "Documentation",
      isActive: true,
    },
  ]

  for (const category of taskCategories) {
    await db.taskCategory.upsert({
      where: { id: category.id },
      update: {
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        isActive: category.isActive,
      },
      create: category,
    })
  }

  console.log("✅ Seeded task categories")

  // Seed project categories
  const projectCategories = [
    {
      id: "project-category-residential",
      nameAr: "سكني",
      nameEn: "Residential",
      isActive: true,
    },
    {
      id: "project-category-commercial",
      nameAr: "تجاري",
      nameEn: "Commercial",
      isActive: true,
    },
    {
      id: "project-category-industrial",
      nameAr: "صناعي",
      nameEn: "Industrial",
      isActive: true,
    },
    {
      id: "project-category-mixed-use",
      nameAr: "استخدام مختلط",
      nameEn: "Mixed Use",
      isActive: true,
    },
    {
      id: "project-category-infrastructure",
      nameAr: "بنية تحتية",
      nameEn: "Infrastructure",
      isActive: true,
    },
    {
      id: "project-category-hospitality",
      nameAr: "ضيافة",
      nameEn: "Hospitality",
      isActive: true,
    },
    {
      id: "project-category-educational",
      nameAr: "تعليمي",
      nameEn: "Educational",
      isActive: true,
    },
    {
      id: "project-category-healthcare",
      nameAr: "صحي",
      nameEn: "Healthcare",
      isActive: true,
    },
  ]

  for (const category of projectCategories) {
    await db.projectCategory.upsert({
      where: { id: category.id },
      update: {
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        isActive: category.isActive,
      },
      create: category,
    })
  }

  console.log("✅ Seeded project categories")

  console.log("\n📋 Seed Summary:")
  console.log("   Admin: admin@wahed.com / admin123")
  console.log("   Staff 1: staff1@wahed.com / staff123")
  console.log("   Staff 2: staff2@wahed.com / staff456")
  console.log("   Staff 3: staff3@wahed.com / staff789")
  console.log("   Staff 4: staff4@wahed.com / staff012")
  console.log("   Staff 5: staff5@wahed.com / staff345")
  console.log("   Staff 6: staff6@wahed.com / staff678")
  console.log("   Staff 7: staff7@wahed.com / staff901")
  console.log("   Regions: 13 Saudi regions with major cities")
  console.log("   Task Statuses: 4 default statuses")
  console.log("   Task Categories: 4 default categories")
  console.log("   Project Categories: 8 default categories")
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
