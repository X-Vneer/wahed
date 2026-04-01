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
        briefSection: {
          content:
            "نسعى كشركة واعد العقارية الاستثمارية إلى تقديم فرص استثمارية نوعية ترتكز على الجودة والتخطيط الذكي بما يضمن قيمة مستدامة وثقة طويلة الأمد. نطور مشاريع عقارية بمعايير احترافية تلبي تطلعات عملائنا وتواكب تطور السوق.",
          image:
            "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
        },
        aboutSection: {
          titlePartOne: "عن",
          titlePartTwo: "واعد أوربان",
          description:
            "نستخدم خبرتنا في إدارة وتطوير العقارات متعددة الفئات لتقديم عوائد موثوقة ومجزية عبر استثمارات عقارية ذكية وآمنة ومستدامة.",
          ctaLabel: "اعرف المزيد",
          image:
            "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
        },
        partnersSection: {
          eyebrowTitle: "بوابة التواصل",
          title: "تحالف الريادة",
          description:
            "تحالفاتنا الرائدة هي امتداد لرؤيتنا الطموحة، تجمع بين الخبرات الاستراتيجية والشراكات الموثوقة.",
          logos: [],
        },
        contactSection: {
          eyebrowTitle: "بوابة التواصل",
          title: "بداية الحوار",
          description:
            "نؤمن بأن التواصل هو بداية الثقة، ونسعد بالإجابة على استفساراتكم وتقديم الدعم اللازم لنكون شركاءكم في تحقيق تطلعاتكم.",
          ctaLabel: "اضغط هنا",
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
        briefSection: {
          content:
            "At Waed Real Estate Investment, we provide high-quality opportunities built on smart planning, long-term trust, and sustainable value. We develop real estate projects with professional standards aligned with client expectations and market evolution.",
          image:
            "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
        },
        aboutSection: {
          titlePartOne: "About",
          titlePartTwo: "Wahed Urban",
          description:
            "We use our expertise in managing and developing multi-category real estate to deliver reliable, rewarding returns through smart, secure, and sustainable property investments.",
          ctaLabel: "Learn More",
          image:
            "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
        },
        partnersSection: {
          eyebrowTitle: "Communication Gateway",
          title: "Leadership Alliance",
          description:
            "Our alliances extend our ambitious vision by combining strategic expertise with trusted partnerships.",
          logos: [],
        },
        contactSection: {
          eyebrowTitle: "Communication Gateway",
          title: "Start the Conversation",
          description:
            "We believe communication is the start of trust, and we are here to answer your questions and support your next move.",
          ctaLabel: "Click Here",
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
