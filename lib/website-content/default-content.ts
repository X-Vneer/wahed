import { LOCALES } from "@/config"

export type WebsiteLocale = (typeof LOCALES)[number]
export type WebsitePageSlug =
  | "home"
  | "about"
  | "contact"
  | "settings"
  | "theme"
  | "projects"

type LocalizedContent = Record<WebsiteLocale, Record<string, unknown>>

export const WEBSITE_CONTENT_DEFAULTS: Record<WebsitePageSlug, LocalizedContent> =
  {
    home: {
      ar: {
        heroSection: {
          title: "حلول هندسية متكاملة",
          description: "نبني مستقبل المشاريع بخبرة عالية وجودة تنفيذ موثوقة.",
          ctaLabel: "ابدأ مشروعك الآن",
          backgroundImage:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80",
        },
      },
      en: {
        heroSection: {
          title: "Integrated Engineering Solutions",
          description:
            "We build the future of projects with trusted quality and deep expertise.",
          ctaLabel: "Start Your Project",
          backgroundImage:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80",
        },
      },
    },
    about: {
      ar: {
        heading: "من نحن",
        summary: "شركة متخصصة في إدارة وتنفيذ المشاريع الإنشائية.",
      },
      en: {
        heading: "Who We Are",
        summary:
          "A company specialized in construction project management and delivery.",
      },
    },
    contact: {
      ar: {
        email: "info@example.com",
        phone: "+966500000000",
        linkedin: "https://www.linkedin.com/company/example",
        instagram: "https://www.instagram.com/example",
      },
      en: {
        email: "info@example.com",
        phone: "+966500000000",
        linkedin: "https://www.linkedin.com/company/example",
        instagram: "https://www.instagram.com/example",
      },
    },
    settings: {
      ar: {
        siteName: "نظام الإدارة الداخلي",
        tagline: "إدارة فعالة للمشاريع والفرق",
        metaTitle: "لوحة تحكم النظام الداخلي",
      },
      en: {
        siteName: "Internal System",
        tagline: "Efficient management for projects and teams",
        metaTitle: "Internal System Dashboard",
      },
    },
    theme: {
      ar: {
        primaryColor: "#0f172a",
        accentColor: "#2563eb",
        fontStyle: "sans",
      },
      en: {
        primaryColor: "#0f172a",
        accentColor: "#2563eb",
        fontStyle: "sans",
      },
    },
    projects: {
      ar: {
        cards: [
          {
            title: "مشروع تطوير المقر الرئيسي",
            status: "قيد التنفيذ",
            description: "تحديث شامل للبنية التحتية والتصميم الداخلي.",
          },
          {
            title: "مشروع مجمع المكاتب الذكي",
            status: "تخطيط",
            description: "تصميم وتنفيذ مجمع أعمال بمعايير استدامة عالية.",
          },
        ],
      },
      en: {
        cards: [
          {
            title: "HQ Revamp Project",
            status: "In Progress",
            description:
              "Comprehensive upgrade for infrastructure and interior design.",
          },
          {
            title: "Smart Office Complex",
            status: "Planning",
            description:
              "Design and delivery of a business complex with high sustainability standards.",
          },
        ],
      },
    },
  }

export const WEBSITE_PAGE_SLUGS = Object.keys(
  WEBSITE_CONTENT_DEFAULTS
) as WebsitePageSlug[]
