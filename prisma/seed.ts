import "dotenv/config"
import { UserRole } from "../lib/generated/prisma/client"
import {
  PermissionKey,
  ProjectStatus,
  EventColor,
  TaskPriority,
} from "../lib/generated/prisma/enums"
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

    { key: PermissionKey.STAFF_MANAGEMENT, name: "Staff Management" },
    { key: PermissionKey.STAFF_PAGE_MANAGEMENT, name: "Staff Page Management" },
    {
      key: PermissionKey.SYSTEM_SETTINGS_MANAGEMENT,
      name: "System Settings Management",
    },
    { key: PermissionKey.LIST_CREATE, name: "Create List" },
    { key: PermissionKey.LIST_UPDATE, name: "Update List" },
    { key: PermissionKey.LIST_DELETE, name: "Delete List" },
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

  // Seed task templates
  const taskTemplates = [
    {
      id: "task-template-site-survey",
      title: "Site Survey",
      description:
        "Standard template for conducting site surveys and documenting initial conditions",
      estimatedWorkingDays: 2,
      priority: TaskPriority.HIGH,
      defaultStatusId: "task-status-pending",
      categoryIds: ["task-category-development"],
      isActive: true,
      subItems: [
        {
          title: "Prepare survey checklist",
          description: "Review scope and prepare checklist",
          order: 0,
        },
        {
          title: "Visit site",
          description: "Conduct on-site visit and take photos",
          order: 1,
        },
        {
          title: "Document findings",
          description: "Compile report with findings and recommendations",
          order: 2,
        },
      ],
    },
    {
      id: "task-template-design-review",
      title: "Design Review",
      description: "Template for reviewing design documents and drawings",
      estimatedWorkingDays: 3,
      priority: TaskPriority.MEDIUM,
      defaultStatusId: "task-status-in-progress",
      categoryIds: ["task-category-design"],
      isActive: true,
      subItems: [
        {
          title: "Review drawings",
          description: "Check drawings against specifications",
          order: 0,
        },
        {
          title: "Check compliance",
          description: "Verify compliance with codes and standards",
          order: 1,
        },
        {
          title: "Sign off",
          description: "Approve or request revisions",
          order: 2,
        },
      ],
    },
    {
      id: "task-template-quality-inspection",
      title: "Quality Inspection",
      description: "Quality control inspection checklist for completed work",
      estimatedWorkingDays: 1,
      priority: TaskPriority.HIGH,
      defaultStatusId: "task-status-pending",
      categoryIds: ["task-category-testing"],
      isActive: true,
      subItems: [
        {
          title: "Pre-inspection preparation",
          description: "Gather specs and checklists",
          order: 0,
        },
        {
          title: "Conduct inspection",
          description: "Inspect work against quality criteria",
          order: 1,
        },
        {
          title: "Inspection report",
          description: "Document results and non-conformances",
          order: 2,
        },
      ],
    },
    {
      id: "task-template-documentation",
      title: "Documentation Package",
      description: "Compile and submit project documentation package",
      estimatedWorkingDays: 5,
      priority: TaskPriority.LOW,
      defaultStatusId: "task-status-pending",
      categoryIds: ["task-category-documentation"],
      isActive: true,
      subItems: [
        {
          title: "Gather documents",
          description: "Collect all required documents",
          order: 0,
        },
        {
          title: "Compile package",
          description: "Organize and index documentation",
          order: 1,
        },
        {
          title: "Submit for review",
          description: "Submit to authority or client",
          order: 2,
        },
      ],
    },
    {
      id: "task-template-handover",
      title: "Handover Checklist",
      description: "Project handover and closure checklist",
      estimatedWorkingDays: 3,
      priority: TaskPriority.MEDIUM,
      defaultStatusId: "task-status-completed",
      categoryIds: ["task-category-development", "task-category-documentation"],
      isActive: true,
      subItems: [
        {
          title: "Verify completion",
          description: "Confirm all work is complete",
          order: 0,
        },
        {
          title: "Collect signatures",
          description: "Obtain handover signatures",
          order: 1,
        },
        {
          title: "Archive records",
          description: "Archive project files and as-builts",
          order: 2,
        },
      ],
    },
  ]

  for (const template of taskTemplates) {
    const { categoryIds, subItems, ...templateFields } = template
    await db.taskTemplate.upsert({
      where: { id: template.id },
      update: {
        ...templateFields,
        categories: { set: categoryIds.map((id) => ({ id })) },
        subItems: {
          deleteMany: {},
          create: subItems.map((item) => ({
            title: item.title,
            description: item.description,
            order: item.order,
          })),
        },
      },
      create: {
        ...templateFields,
        categories: { connect: categoryIds.map((id) => ({ id })) },
        subItems: {
          create: subItems.map((item) => ({
            title: item.title,
            description: item.description,
            order: item.order,
          })),
        },
      },
    })
  }

  console.log("✅ Seeded 5 task templates")

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

  // Seed projects
  const riyadhCity = await db.city.findUnique({
    where: { id: "city-riyadh" },
  })

  const residentialCategory = await db.projectCategory.findUnique({
    where: { id: "project-category-residential" },
  })

  if (riyadhCity && residentialCategory) {
    const projects = [
      {
        id: "project-1",
        nameAr: "مشروع سكني النخيل",
        nameEn: "Al Nakheel Residential Project",
        image:
          "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
        descriptionAr:
          "مشروع سكني فاخر في قلب الرياض يضم وحدات سكنية عصرية مع مرافق متكاملة",
        descriptionEn:
          "Luxurious residential project in the heart of Riyadh featuring modern residential units with integrated facilities",
        area: 2500.5,
        numberOfFloors: 5,
        deedNumber: "DEED-2024-001",
        workDuration: 24,
        status: ProjectStatus.IN_PROGRESS,
        cityId: riyadhCity.id,
        categoryIds: [residentialCategory.id],
      },
      {
        id: "project-2",
        nameAr: "مشروع الواحة السكني",
        nameEn: "Al Waha Residential Project",
        image:
          "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI",
        descriptionAr:
          "مجمع سكني متكامل يوفر بيئة معيشية راقية مع مساحات خضراء واسعة",
        descriptionEn:
          "Integrated residential complex providing an upscale living environment with extensive green spaces",
        area: 3200.75,
        numberOfFloors: 7,
        deedNumber: "DEED-2024-002",
        workDuration: 30,
        status: ProjectStatus.PLANNING,
        cityId: riyadhCity.id,
        categoryIds: [residentialCategory.id],
      },
      {
        id: "project-3",
        nameAr: "مشروع الجنان السكني",
        nameEn: "Al Jannah Residential Project",
        image:
          "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
        descriptionAr:
          "مشروع سكني حديث يتميز بتصميم عصري ومرافق ترفيهية متقدمة",
        descriptionEn:
          "Modern residential project featuring contemporary design and advanced recreational facilities",
        area: 1800.25,
        numberOfFloors: 4,
        deedNumber: "DEED-2024-003",
        workDuration: 18,
        status: ProjectStatus.IN_PROGRESS,
        cityId: riyadhCity.id,
        categoryIds: [residentialCategory.id],
      },
    ]

    for (const projectData of projects) {
      const { categoryIds, ...projectFields } = projectData
      await db.project.upsert({
        where: { id: projectData.id },
        update: {
          ...projectFields,
          categories: {
            set: categoryIds.map((id) => ({ id })),
          },
        },
        create: {
          ...projectFields,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        },
      })
    }

    console.log("✅ Seeded 3 projects")

    // Seed 3 tasks per project
    const taskTitles = [
      { titleEn: "Initial site assessment", titleAr: "التقييم المبدئي للموقع" },
      {
        titleEn: "Design review and approval",
        titleAr: "مراجعة التصميم والموافقة",
      },
      { titleEn: "Progress documentation", titleAr: "توثيق التقدم" },
    ]
    const defaultStatusId = "task-status-pending"
    const devCategoryId = "task-category-development"

    for (const projectData of projects) {
      for (let i = 0; i < 3; i++) {
        const { titleEn, titleAr } = taskTitles[i]
        await db.task.upsert({
          where: { id: `task-${projectData.id}-${i + 1}` },
          update: {
            title: titleEn,
            description: `Seed task ${i + 1} for ${projectData.nameEn}`,
            statusId: defaultStatusId,
            estimatedWorkingDays: 3 + i,
            priority: i === 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
            order: i,
          },
          create: {
            id: `task-${projectData.id}-${i + 1}`,
            title: titleEn,
            description: `Seed task ${i + 1} for ${projectData.nameEn}`,
            statusId: defaultStatusId,
            projectId: projectData.id,
            createdById: admin.id,
            estimatedWorkingDays: 3 + i,
            priority: i === 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
            order: i,
            category: { connect: [{ id: devCategoryId }] },
          },
        })
      }
    }

    console.log("✅ Seeded 3 tasks per project (9 tasks total)")
  } else {
    console.log("⚠️  Could not seed projects: city or category not found")
  }

  // Seed public projects
  const jeddahCity = await db.city.findUnique({
    where: { id: "city-jeddah" },
  })
  const dammamCity = await db.city.findUnique({
    where: { id: "city-dammam" },
  })
  const commercialCategory = await db.projectCategory.findUnique({
    where: { id: "project-category-commercial" },
  })
  const hospitalityCategory = await db.projectCategory.findUnique({
    where: { id: "project-category-hospitality" },
  })

  const publicProjectCities = [
    riyadhCity,
    jeddahCity,
    dammamCity,
    riyadhCity,
  ]
  const publicProjectCategories = [
    residentialCategory,
    commercialCategory,
    hospitalityCategory,
    residentialCategory,
  ]

  if (publicProjectCities.every(Boolean) && publicProjectCategories.every(Boolean)) {
    const sampleImage =
      "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj"
    const sampleImage2 =
      "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI"

    const publicProjects = [
      {
        id: "public-project-1",
        titleAr: "أبراج الياسمين السكنية",
        titleEn: "Al Yasmin Residential Towers",
        slug: "al-yasmin-residential-towers",
        descriptionAr:
          "أبراج سكنية فاخرة في حي الياسمين بالرياض، تتميز بإطلالات بانورامية وتصميم عصري يجمع بين الفخامة والراحة. يضم المشروع شققاً بمساحات متنوعة ومرافق ترفيهية متكاملة تشمل مسابح ونوادي صحية.",
        descriptionEn:
          "Luxury residential towers in Al Yasmin district, Riyadh, featuring panoramic views and modern design combining elegance with comfort. The project includes apartments of various sizes and integrated recreational facilities including pools and health clubs.",
        shortDescriptionAr: "أبراج سكنية فاخرة بإطلالات بانورامية في حي الياسمين",
        shortDescriptionEn:
          "Luxury residential towers with panoramic views in Al Yasmin district",
        images: [sampleImage, sampleImage2, sampleImage, sampleImage2, sampleImage],
        isActive: true,
        status: ProjectStatus.IN_PROGRESS,
        cityId: publicProjectCities[0]!.id,
        categoryId: publicProjectCategories[0]!.id,
        area: 12500.0,
        deedNumber: "DEED-PUB-001",
        startingPrice: 850000,
        endingPrice: 2500000,
        locationAr: "حي الياسمين، شمال الرياض",
        locationEn: "Al Yasmin District, North Riyadh",
        googleMapsAddress: "https://maps.google.com/?q=24.8200,46.6300",
        badges: [
          { nameAr: "جديد", nameEn: "New", color: "#22c55e" },
          { nameAr: "تمويل متاح", nameEn: "Financing Available", color: "#3b82f6" },
        ],
        features: [
          {
            labelAr: "عدد الطوابق",
            labelEn: "Floors",
            valueAr: "١٥",
            valueEn: "15",
            icon: sampleImage,
          },
          {
            labelAr: "مواقف سيارات",
            labelEn: "Parking",
            valueAr: "٣ لكل وحدة",
            valueEn: "3 per unit",
            icon: sampleImage,
          },
        ],
      },
      {
        id: "public-project-2",
        titleAr: "مجمع البحر التجاري",
        titleEn: "Al Bahr Commercial Complex",
        slug: "al-bahr-commercial-complex",
        descriptionAr:
          "مجمع تجاري حديث على كورنيش جدة يضم مكاتب ومحلات تجارية ومطاعم راقية. يتميز بموقعه الاستراتيجي المطل على البحر الأحمر وتصميمه المستدام الذي يراعي البيئة.",
        descriptionEn:
          "A modern commercial complex on Jeddah's Corniche featuring offices, retail spaces, and upscale restaurants. Distinguished by its strategic seafront location and sustainable, environmentally conscious design.",
        shortDescriptionAr: "مجمع تجاري عصري على كورنيش جدة بإطلالة بحرية",
        shortDescriptionEn:
          "Modern commercial complex on Jeddah Corniche with sea views",
        images: [sampleImage2, sampleImage, sampleImage2, sampleImage, sampleImage2],
        isActive: true,
        status: ProjectStatus.PLANNING,
        cityId: publicProjectCities[1]!.id,
        categoryId: publicProjectCategories[1]!.id,
        area: 8700.0,
        deedNumber: "DEED-PUB-002",
        startingPrice: 1200000,
        endingPrice: 5000000,
        locationAr: "كورنيش جدة، جدة",
        locationEn: "Jeddah Corniche, Jeddah",
        googleMapsAddress: "https://maps.google.com/?q=21.5433,39.1728",
        badges: [
          { nameAr: "قريباً", nameEn: "Coming Soon", color: "#f59e0b" },
        ],
        features: [
          {
            labelAr: "المساحات التجارية",
            labelEn: "Retail Spaces",
            valueAr: "٤٥",
            valueEn: "45",
            icon: sampleImage,
          },
          {
            labelAr: "مكاتب",
            labelEn: "Offices",
            valueAr: "٦٠",
            valueEn: "60",
            icon: sampleImage,
          },
        ],
      },
      {
        id: "public-project-3",
        titleAr: "منتجع الخليج السياحي",
        titleEn: "Al Khaleej Tourism Resort",
        slug: "al-khaleej-tourism-resort",
        descriptionAr:
          "منتجع سياحي فاخر على ساحل الخليج العربي في الدمام، يقدم تجربة ضيافة استثنائية مع فندق خمس نجوم وفلل خاصة ومنطقة شاطئية متكاملة.",
        descriptionEn:
          "A luxury tourism resort on the Arabian Gulf coast in Dammam, offering an exceptional hospitality experience with a five-star hotel, private villas, and a fully integrated beachfront area.",
        shortDescriptionAr: "منتجع سياحي فاخر على ساحل الخليج في الدمام",
        shortDescriptionEn:
          "Luxury tourism resort on the Gulf coast in Dammam",
        images: [sampleImage, sampleImage, sampleImage2, sampleImage, sampleImage2],
        isActive: false,
        status: ProjectStatus.PLANNING,
        cityId: publicProjectCities[2]!.id,
        categoryId: publicProjectCategories[2]!.id,
        area: 35000.0,
        deedNumber: "DEED-PUB-003",
        startingPrice: 3000000,
        endingPrice: 12000000,
        locationAr: "الواجهة البحرية، الدمام",
        locationEn: "Waterfront, Dammam",
        googleMapsAddress: "https://maps.google.com/?q=26.4367,50.1040",
        badges: [
          { nameAr: "حصري", nameEn: "Exclusive", color: "#8b5cf6" },
          { nameAr: "استثمار مميز", nameEn: "Premium Investment", color: "#ec4899" },
        ],
        features: [
          {
            labelAr: "الغرف الفندقية",
            labelEn: "Hotel Rooms",
            valueAr: "٢٠٠",
            valueEn: "200",
            icon: sampleImage,
          },
          {
            labelAr: "فلل خاصة",
            labelEn: "Private Villas",
            valueAr: "٢٥",
            valueEn: "25",
            icon: sampleImage,
          },
          {
            labelAr: "مسبح",
            labelEn: "Swimming Pool",
            valueAr: "٤",
            valueEn: "4",
            icon: sampleImage,
          },
        ],
      },
      {
        id: "public-project-4",
        titleAr: "حدائق الرمال السكنية",
        titleEn: "Al Rimal Gardens Residences",
        slug: "al-rimal-gardens-residences",
        descriptionAr:
          "مجمع سكني عائلي في شرق الرياض محاط بحدائق واسعة ومساحات خضراء. يوفر بيئة آمنة ومريحة للعائلات مع مدارس ومراكز صحية ومرافق رياضية داخل المجمع.",
        descriptionEn:
          "A family residential compound in East Riyadh surrounded by expansive gardens and green spaces. Provides a safe and comfortable environment for families with schools, health centers, and sports facilities within the compound.",
        shortDescriptionAr: "مجمع سكني عائلي محاط بحدائق واسعة شرق الرياض",
        shortDescriptionEn:
          "Family residential compound with expansive gardens in East Riyadh",
        images: [sampleImage2, sampleImage2, sampleImage, sampleImage2, sampleImage],
        isActive: true,
        status: ProjectStatus.COMPLETED,
        cityId: publicProjectCities[3]!.id,
        categoryId: publicProjectCategories[3]!.id,
        area: 45000.0,
        deedNumber: "DEED-PUB-004",
        startingPrice: 600000,
        endingPrice: 1800000,
        locationAr: "حي الرمال، شرق الرياض",
        locationEn: "Al Rimal District, East Riyadh",
        googleMapsAddress: "https://maps.google.com/?q=24.7500,46.8100",
        badges: [
          { nameAr: "مكتمل", nameEn: "Completed", color: "#10b981" },
          { nameAr: "جاهز للسكن", nameEn: "Ready to Move In", color: "#06b6d4" },
        ],
        features: [
          {
            labelAr: "الوحدات السكنية",
            labelEn: "Residential Units",
            valueAr: "٣٥٠",
            valueEn: "350",
            icon: sampleImage,
          },
          {
            labelAr: "مساحات خضراء",
            labelEn: "Green Areas",
            valueAr: "٤٠٪",
            valueEn: "40%",
            icon: sampleImage,
          },
          {
            labelAr: "مدارس",
            labelEn: "Schools",
            valueAr: "٢",
            valueEn: "2",
            icon: sampleImage,
          },
        ],
      },
    ]

    for (const pp of publicProjects) {
      const { badges, features, categoryId, ...fields } = pp

      await db.publicProject.upsert({
        where: { id: pp.id },
        update: {
          ...fields,
          categories: { set: [{ id: categoryId }] },
          badge: {
            deleteMany: {},
            create: badges,
          },
          features: {
            deleteMany: {},
            create: features,
          },
        },
        create: {
          ...fields,
          categories: { connect: [{ id: categoryId }] },
          badge: { create: badges },
          features: { create: features },
        },
      })
    }

    console.log("✅ Seeded 4 public projects")
  } else {
    console.log("⚠️  Could not seed public projects: city or category not found")
  }

  // Seed banners
  const now = new Date()
  const banners = [
    {
      id: "banner-1",
      titleAr: "ترحيب بفريق العمل",
      titleEn: "Welcome to Our Team",
      descriptionAr: "نحن سعداء بانضمامك إلى فريقنا المتميز",
      descriptionEn: "We're excited to have you join our exceptional team",
      content: "ابدأ رحلتك معنا اليوم واكتشف الفرص المتاحة",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear() + 1, now.getMonth(), 31),
      isActive: true,
    },
    {
      id: "banner-2",
      titleAr: "مشاريع جديدة قادمة",
      titleEn: "New Projects Coming Soon",
      descriptionAr: "استعد لمشاريع مثيرة ومبتكرة قريباً",
      descriptionEn:
        "Get ready for exciting and innovative projects coming soon",
      content: "تابعنا للحصول على آخر التحديثات والإعلانات",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI",
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear() + 1, now.getMonth(), 31),
      isActive: true,
    },
    {
      id: "banner-3",
      titleAr: "تحديثات النظام",
      titleEn: "System Updates",
      descriptionAr: "اكتشف الميزات الجديدة والتحسينات في النظام",
      descriptionEn: "Discover new features and improvements in the system",
      content: "نعمل باستمرار على تحسين تجربتك معنا",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear() + 1, now.getMonth(), 31),
      isActive: true,
    },
    {
      id: "banner-4",
      titleAr: "فعاليات وورش عمل",
      titleEn: "Events & Workshops",
      descriptionAr: "انضم إلى فعالياتنا وورش العمل القادمة",
      descriptionEn: "Join our upcoming events and workshops",
      content: "احجز مكانك الآن واستفد من فرص التعلم والتطوير",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI",
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear() + 1, now.getMonth(), 31),
      isActive: true,
    },
  ]

  for (const banner of banners) {
    await db.banner.upsert({
      where: { id: banner.id },
      update: banner,
      create: banner,
    })
  }

  console.log("✅ Seeded 4 banners")

  // Seed useful websites
  const websites = [
    {
      id: "website-1",
      nameAr: "منصة أبشر",
      nameEn: "Absher Platform",
      url: "https://www.absher.sa",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
      isActive: true,
    },
    {
      id: "website-2",
      nameAr: "منصة ناجز",
      nameEn: "Najiz Platform",
      url: "https://najiz.sa",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI",
      isActive: true,
    },
    {
      id: "website-3",
      nameAr: "وزارة الشؤون البلدية والقروية",
      nameEn: "Ministry of Municipal and Rural Affairs",
      url: "https://www.momra.gov.sa",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
      isActive: true,
    },
    {
      id: "website-4",
      nameAr: "منصة معاملاتي",
      nameEn: "Muamalat Platform",
      url: "https://muamalat.sa",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI",
      isActive: true,
    },
    {
      id: "website-5",
      nameAr: "منصة سابر",
      nameEn: "SABER Platform",
      url: "https://saber.sa",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
      isActive: true,
    },
    {
      id: "website-6",
      nameAr: "Google Drive",
      nameEn: "Google Drive",
      url: "https://drive.google.com",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI",
      isActive: true,
    },
    {
      id: "website-7",
      nameAr: "Microsoft 365",
      nameEn: "Microsoft 365",
      url: "https://www.microsoft.com/microsoft-365",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
      isActive: true,
    },
    {
      id: "website-8",
      nameAr: "منصة إحكام",
      nameEn: "Ehkam Platform",
      url: "https://ehkam.sa",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI",
      isActive: true,
    },
    {
      id: "website-9",
      nameAr: "منصة قوى",
      nameEn: "Qiwa Platform",
      url: "https://qiwa.sa",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8BSS2x61H8Ax9EvPen0fcBDUtWNq7MF2X3QZj",
      isActive: true,
    },
    {
      id: "website-10",
      nameAr: "منصة بلدي",
      nameEn: "Balady Platform",
      url: "https://balady.gov.sa",
      image:
        "https://djqa8ir0x0.ufs.sh/f/INQfg0cC3Up8yb9Ur0XQuzJgmc1WL8sYPaBRD4VdKXnebMZI",
      isActive: true,
    },
  ]

  for (const website of websites) {
    await db.website.upsert({
      where: { id: website.id },
      update: website,
      create: website,
    })
  }

  console.log("✅ Seeded 10 useful websites")

  // Seed events for this month and next month
  const adminUser = await db.user.findUnique({
    where: { email: "admin@wahed.com" },
  })

  if (adminUser) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const nextMonth = currentMonth + 1

    // Helper function to create date
    const createDate = (
      year: number,
      month: number,
      day: number,
      hour = 9,
      minute = 0
    ) => {
      return new Date(year, month, day, hour, minute)
    }

    const events = [
      {
        title: "Team Meeting",
        description:
          "Weekly team sync meeting to discuss project progress and upcoming tasks",
        start: createDate(currentYear, currentMonth, 5, 10, 0),
        end: createDate(currentYear, currentMonth, 5, 11, 30),
        allDay: false,
        color: EventColor.SKY,
        location: "Conference Room A",
        createdById: adminUser.id,
      },
      {
        title: "Project Review",
        description: "Monthly project review session with stakeholders",
        start: createDate(currentYear, currentMonth, 10, 14, 0),
        end: createDate(currentYear, currentMonth, 10, 16, 0),
        allDay: false,
        color: EventColor.EMERALD,
        location: "Main Office",
        createdById: adminUser.id,
      },
      {
        title: "Training Workshop",
        description: "Technical training workshop on new system features",
        start: createDate(currentYear, currentMonth, 15, 9, 0),
        end: createDate(currentYear, currentMonth, 15, 17, 0),
        allDay: true,
        color: EventColor.VIOLET,
        location: "Training Center",
        createdById: adminUser.id,
      },
      {
        title: "Client Presentation",
        description: "Presenting quarterly results to key clients",
        start: createDate(currentYear, currentMonth, 18, 13, 0),
        end: createDate(currentYear, currentMonth, 18, 15, 0),
        allDay: false,
        color: EventColor.AMBER,
        location: "Client Meeting Room",
        createdById: adminUser.id,
      },
      {
        title: "Deadline: Project Phase 1",
        description: "Final deadline for Phase 1 deliverables",
        start: createDate(currentYear, currentMonth, 22, 0, 0),
        end: createDate(currentYear, currentMonth, 22, 23, 59),
        allDay: true,
        color: EventColor.ROSE,
        location: null,
        createdById: adminUser.id,
      },
      {
        title: "Monthly Planning Session",
        description: "Planning session for next month's activities and goals",
        start: createDate(currentYear, nextMonth, 2, 9, 0),
        end: createDate(currentYear, nextMonth, 2, 12, 0),
        allDay: false,
        color: EventColor.SKY,
        location: "Planning Room",
        createdById: adminUser.id,
      },
      {
        title: "Team Building Activity",
        description:
          "Outdoor team building activity to strengthen collaboration",
        start: createDate(currentYear, nextMonth, 8, 8, 0),
        end: createDate(currentYear, nextMonth, 8, 18, 0),
        allDay: true,
        color: EventColor.EMERALD,
        location: "Outdoor Venue",
        createdById: adminUser.id,
      },
      {
        title: "System Maintenance",
        description: "Scheduled system maintenance and updates",
        start: createDate(currentYear, nextMonth, 12, 2, 0),
        end: createDate(currentYear, nextMonth, 12, 6, 0),
        allDay: false,
        color: EventColor.ORANGE,
        location: null,
        createdById: adminUser.id,
      },
      {
        title: "Quarterly Review Meeting",
        description: "Quarterly business review with management team",
        start: createDate(currentYear, nextMonth, 18, 10, 0),
        end: createDate(currentYear, nextMonth, 18, 14, 0),
        allDay: false,
        color: EventColor.VIOLET,
        location: "Executive Boardroom",
        createdById: adminUser.id,
      },
      {
        title: "Holiday - National Day",
        description: "National Day celebration - Office closed",
        start: createDate(currentYear, nextMonth, 23, 0, 0),
        end: createDate(currentYear, nextMonth, 23, 23, 59),
        allDay: true,
        color: EventColor.AMBER,
        location: null,
        createdById: adminUser.id,
      },
    ]

    for (const event of events) {
      await db.event.create({
        data: event,
      })
    }

    console.log("✅ Seeded 10 events for this month and next month")
  } else {
    console.log("⚠️  Could not seed events: admin user not found")
  }

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
  console.log("   Task Templates: 5 task templates")
  console.log("   Project Categories: 8 default categories")
  console.log("   Projects: 3 sample projects")
  console.log("   Public Projects: 4 public website projects")
  console.log("   Banners: 4 sample banners")
  console.log("   Websites: 10 useful websites")
  console.log("   Events: 10 events for this month and next month")
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
