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

export const WEBSITE_CONTENT_DEFAULTS: Record<
  WebsitePageSlug,
  LocalizedContent
> = {
  home: {
    ar: {
      heroSection: {
        title: "اكتشف مساحتك التي تستحقها، حيث يبدأ أسلوب حياتك الجديد",
        description:
          "ابدأ رحلتك نحو العقار المناسب من خلال خيارات متنوعة وتجربة بحث بسيطة وواضحة واكتشف رحلتك بأمان.",
        ctaLabel: "تعرف أكثر",
        backgroundImage: "",
      },
      briefSection: {
        content:
          "تسعى شركة وهد العقارية الاستثمارية إلى تقديم فرص استثمارية نوعية ترتكز على الجودة والتخطيط الذكي، بما يضمن تحقيق قيمة مستدامة وثقة طويلة الأمد. نطور مشاريع عقارية بمعايير احترافية تلبي تطلعات عملائنا وتواكب تطور السوق.",
        image: "",
      },
      aboutSection: {
        titlePartOne: "عن",
        titlePartTwo: "وهد العمرانية",
        description:
          "نسخر خبرتنا في إدارة وتطوير العقارات متعددة الفئات لنقدم لك عوائد استثمارية مثمرة وموثوقة. بخيارات استثمار عقاري ذكي، آمن، ومستدام.",
        ctaLabel: "تعرف أكثر",
        image: "",
      },
      statsSection: {
        isActive: false,
        firstValue: "20+",
        firstLabel: "إجمالي مساحة المشاريع",
        secondValue: "119K+",
        secondLabel: "متر مربع مبني",
        thirdValue: "10+",
        thirdLabel: "عام من الخبرة",
      },
      partnersSection: {
        isActive: false,
        eyebrowTitle: "بوابة التواصل",
        title: "تحالف الريادة",
        description:
          "تحالفات الريادة هي امتداد لرؤيتنا الطموحة. تجمع بين الخبرات الاستراتيجية والشراكات الموثوقة لتقديم قيمة مستدامة ومشاريع نوعية. تعزز مكانتنا وتدعم ثقة شركائنا وعملائنا دائماً.",
        logos: [],
      },
      contactSection: {
        eyebrowTitle: "بوابة التواصل",
        title: "بداية الحوار",
        description:
          "نؤمن بأن التواصل هو بداية بناء الثقة، ونسعد بالإجابة على استفساراتكم وتقديم الدعم اللازم، لنكون شركاءكم في تحقيق تطلعاتكم وتقديم تجربة ترتقي لتوقعاتكم دائماً.",
        ctaLabel: "اضغط هنا",
      },
    },
    en: {
      heroSection: {
        title:
          "Discover the space you deserve, where your new lifestyle begins",
        description:
          "Start your journey toward the right property with diverse options and a simple, clear search experience—and discover your path with confidence.",
        ctaLabel: "Learn more",
        backgroundImage: "",
      },
      briefSection: {
        content:
          "Wahad Real Estate Investment Company seeks to provide qualitative investment opportunities based on quality and smart planning, ensuring sustainable value and long-term trust. We develop real estate projects with professional standards that meet our clients’ aspirations and keep pace with market developments.",
        image: "",
      },
      aboutSection: {
        titlePartOne: "About",
        titlePartTwo: "Wahd Urban Development",
        description:
          "We leverage our expertise in managing and developing multi-class real estate to deliver fruitful, reliable investment returns. With smart, safe, and sustainable real estate investment options.",
        ctaLabel: "Learn more",
        image: "",
      },
      statsSection: {
        isActive: false,
        firstValue: "20+",
        firstLabel: "Total project area",
        secondValue: "119K+",
        secondLabel: "Built square meters",
        thirdValue: "10+",
        thirdLabel: "Years of experience",
      },
      partnersSection: {
        isActive: false,
        eyebrowTitle: "Communication Portal",
        title: "Leadership Alliance",
        description:
          "Leadership alliances extend our ambitious vision. They bring together strategic expertise and trusted partnerships to deliver sustainable value and high-quality projects. They strengthen our position and continually support the trust of our partners and clients.",
        logos: [],
      },
      contactSection: {
        eyebrowTitle: "Communication Portal",
        title: "Beginning of Dialogue",
        description:
          "We believe communication is the beginning of trust. We are pleased to answer your inquiries and provide the support you need, to be your partners in achieving your aspirations and delivering an experience that always meets your expectations.",
        ctaLabel: "Click here",
      },
    },
  },
  about: {
    ar: {
      heroSection: {
        backgroundImage: "",
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
        image: "",
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
        isActive: false,
        eyebrowTitle: "خلف القصة قيادة",
        title: "مجلس الإدارة",
        members: [],
      },
    },
    en: {
      heroSection: {
        backgroundImage: "",
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
        image: "",
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
        firstContent:
          "Commitment to the highest standards of quality and precision in every project.",
        secondTitle: "Innovation",
        secondContent:
          "Innovative design solutions that balance creativity and efficiency.",
        thirdTitle: "Sustainability",
        thirdContent:
          "Sustainable and balanced solutions that connect environment and development.",
      },
      boardSection: {
        isActive: false,
        eyebrowTitle: "Leadership Behind the Story",
        title: "Board of Directors",
        members: [],
      },
    },
  },
  contact: {
    ar: {
      heroSection: {
        eyebrowTitle: "خطوة الأولى",
        title: "تواصل معنا ودعنا نشكل ملامح مشروعك",
      },
      infoSection: {
        title: "لنبداً الحديث",
        content:
          "فريقنا جاهز لتقديم الإرشاد والدعم المهني والإجابة على استفساراتكم بكل شفافية.",
        channelsTitle: "وسائل التواصل",
        phone: "+96658241563",
        email: "info@wahdeinvestment.sa",
        linkedin: "https://www.linkedin.com/company/example",
        instagram: "https://www.instagram.com/example",
      },
    },
    en: {
      heroSection: {
        eyebrowTitle: "The first step",
        title: "Contact us and let us shape your project",
      },
      infoSection: {
        title: "Let's start the conversation",
        content:
          "Our team is ready to provide guidance, professional support, and clear answers to your questions.",
        channelsTitle: "Contact channels",
        phone: "+96658241563",
        email: "info@wahdeinvestment.sa",
        linkedin: "https://www.linkedin.com/company/example",
        instagram: "https://www.instagram.com/example",
      },
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
      heroSection: {
        backgroundImage: "",
        eyebrowTitle: "رؤية بناء مستدام",
        title:
          "نطوّر مشاريع متكاملة برؤية احترافية تنفَّذ بجودة عالية وقيمة مستدامة",
      },
      introSection: {
        content:
          "مشاريع وهد ليست مساحات إنشائية فقط، بل تجارب متكاملة تجمع بين الجودة والاستدامة وأسلوب الحياة العصري.",
      },
      cards: [],
    },
    en: {
      heroSection: {
        backgroundImage: "",
        eyebrowTitle: "A Vision for Sustainable Building",
        title:
          "We develop integrated projects with a professional vision, executed with high quality and sustainable value",
      },
      introSection: {
        content:
          "Wahed projects are not just construction spaces, but integrated experiences that combine quality, sustainability, and modern lifestyle.",
      },
      cards: [],
    },
  },
}

export const WEBSITE_PAGE_SLUGS = Object.keys(
  WEBSITE_CONTENT_DEFAULTS
) as WebsitePageSlug[]
