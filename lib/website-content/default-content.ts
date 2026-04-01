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
        heroSection: {
          backgroundImage:
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80",
          eyebrowTitle: "قصة ثقة ورؤية",
          title: "استثمار ناجح يبدأ برؤية واضحة ويكتمل بقيمة مستدامة",
          description: "",
        },
        storySection: {
          eyebrowTitle: "صياغة الأثر",
          title: "قصتنا",
          content:
            "انطلقت شركة وهد برؤية استثمارية طموحة لتطوير مشاريع عقارية نوعية، واليوم تمثل كياناً متكاملاً يقود إنشاء المشاريع الاستثمارية وبناء المجمعات السكنية وفق أعلى معايير الجودة والاستدامة لتصنع قيمة عقارية راسخة تدوم للأجيال.",
        },
        visionMissionSection: {
          image:
            "https://images.unsplash.com/photo-1581092919535-7146ff1a5902?auto=format&fit=crop&w=1200&q=80",
          visionTitle: "رؤيتنا",
          visionContent:
            "أن نكون رواداً في قطاع البناء والتطوير العقاري عبر تقديم مشاريع مبتكرة ومستدامة تساهم في تحسين بيئة العمل والمعيشة، مع التميز في تقديم منتجات ترتكز على الجودة والنزاهة والالتزام تجاه عملائنا والمجتمع.",
          missionTitle: "رسالتنا",
          missionContent:
            "نسعى في شركة وهد لتحويل المشاريع العمرانية إلى تجارب متكاملة تجمع بين الإبداع والجودة والاستدامة، ونلتزم بتقديم مشاريع ترتقي لأعلى المعايير وتصنع قيمة دائمة لعملائنا والمجتمع.",
        },
        valuesSection: {
          eyebrowTitle: "أواصر البقاء",
          title: "قيمنا",
          firstTitle: "الجودة",
          firstContent: "الالتزام بأعلى معايير الجودة والدقة في كل مشروع.",
          secondTitle: "الابتكار",
          secondContent: "حلول تصميمية مبتكرة تجمع بين الإبداع والكفاءة.",
          thirdTitle: "الإستدامة",
          thirdContent: "حلول مستدامة متوازنة تجمع بين البيئة والتنمية.",
        },
        boardSection: {
          eyebrowTitle: "خلف القصة قيادة",
          title: "مجلس الإدارة",
          members: [],
        },
      },
      en: {
        heroSection: {
          backgroundImage:
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80",
          eyebrowTitle: "A Story of Trust and Vision",
          title:
            "Successful investment starts with clear vision and grows through lasting value",
          description: "",
        },
        storySection: {
          eyebrowTitle: "Shaping Impact",
          title: "Our Story",
          content:
            "Wahed started with an ambitious investment vision to develop high-quality real estate projects. Today, it stands as an integrated entity leading investment developments and residential communities with top standards of quality and sustainability, creating lasting real estate value for generations.",
        },
        visionMissionSection: {
          image:
            "https://images.unsplash.com/photo-1581092919535-7146ff1a5902?auto=format&fit=crop&w=1200&q=80",
          visionTitle: "Our Vision",
          visionContent:
            "To lead the construction and real estate development sector by delivering innovative, sustainable projects that improve living and working environments, while upholding quality, integrity, and commitment toward our clients and community.",
          missionTitle: "Our Mission",
          missionContent:
            "At Wahed, we transform urban projects into integrated experiences that combine creativity, quality, and sustainability, while delivering projects that meet the highest standards and create enduring value for our clients and society.",
        },
        valuesSection: {
          eyebrowTitle: "Bonds of Continuity",
          title: "Our Values",
          firstTitle: "Quality",
          firstContent: "Commitment to the highest standards of quality and precision in every project.",
          secondTitle: "Innovation",
          secondContent: "Innovative design solutions that balance creativity and efficiency.",
          thirdTitle: "Sustainability",
          thirdContent: "Sustainable and balanced solutions that connect environment and development.",
        },
        boardSection: {
          eyebrowTitle: "Leadership Behind the Story",
          title: "Board of Directors",
          members: [],
        },
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
