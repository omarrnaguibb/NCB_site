import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "src", "constants", "homepage.data.json"), "utf8")
);

const PRODUCT_NAMES = {
  "2134151846": "Apply for Freelance Cash Financing",
  "1715958792": "Freelance Certificate - Specialized Services",
  "655956466": "Apply for REEF Support",
  "930861569": "Freelance Certificate - Productive Families",
  "286991082": "Apply for Guided Transport Freelance Support",
  "37538707": "Inquiry about REEF Activities",
  "507931762": "Extract Electronic Mudd & Wages Certificate from GOSI",
  "1937222150": "Renew QIWA Business Subscription",
  "612211139": "Objection or Complaint in Sakani",
  "874458129": "Maternity Compensation Request for Female Employees",
  "1359108006": "Register on Man Hawluk Delivery Platform",
  "1655869090": "Change Password or Update Login Details",
  "218159350": "Objection to Citizen Account Eligibility or Support Amount",
  "544546084": "Remove Dependent from Social Security",
  "314830519": "Add Child Dependent (Under 18) to Social Security",
  "1002540934": "Inquiry about Financial Aid for People with Special Needs",
  "831537051": "Traffic Facilitation Card for People with Disabilities",
  "246794755": "Remove Dependent from Citizen Account",
  "112901477": "Reapply for Citizen Account",
  "2037788786": "Send Email",
  "1232635646": "Subscribe to Absher Business",
  "1665411037": "Education Financing from Social Development Bank",
  "1991266574": "Inquiry about Insurance Entitlements",
  "137892222": "Verify SANED Eligibility",
  "1744943981": "Inquiry about REEF Application Eligibility Status",
  "280486708": "Productive Families Financing from Social Development Bank",
  "907670004": "Extract Electronic Mudd & Wages Certificate",
};

const BADGE_MAP = {
  "لفترة محدودة!": "Limited time!",
  "جديد!!": "New!!",
  "الأكثر طلبًا": "Most requested",
  "جديد نعين": "New at Noeen",
};

const STRING_MAP = {
  "تخفيضات": "Offers",
  "الكل": "All",
  "الموظفين": "Employees",
  "الباحثين عن عمل": "Job Seekers",
  "الطلاب": "Students",
  "الاختبارات": "Tests",
  "التنمية الاجتماعية": "Social Development",
  "التمويلات": "Finances",
  "خدمات عامة": "General Services",
  "حجز المواعيد": "Appointment Booking",
  "العمل الحر": "Freelancing",
  "خدمات الأعمال": "Business Services",
  "الباقات": "Packages",
  "الأكثر طلبًا": "Most Requested",
  "جديد نعين": "New at Noeen",
  "خدمات التنمية الاجتماعية": "Social Development Services",
  "اكتشف خدمات أخرى": "Discover More Services",
  "عرض الكل": "View All",
  "آراء العملاء": "Customer Reviews",
  "تقديم الخدمة": "Service Delivery",
  "في اسرع وقت": "As fast as possible",
  "السرية والأمان": "Privacy & Security",
  "استمتع بتجربة آمنة وخصوصية تامة": "Enjoy a safe experience with full privacy",
  "الاسترداد والاستبدال للخدمات": "Refund & Exchange for Services",
  "تطبق الشروط والاحكام": "Terms and conditions apply",
  "اطلب الخدمة": "Order the Service",
  "اكمل الدفع": "Complete payment",
  "نتواصل معك": "We Contact You",
  "نرسل المتطلبات": "We send requirements",
  "نرفع الطلب": "We Submit the Request",
  "وتكون راضي عن خدمتنا": "And you stay satisfied with our service",
  "روابط مهمة": "Important Links",
  "تواصل معنا": "Contact Us",
  "مدونة نُعين": "Noeen Blog",
  "قصة نُعين": "Noeen Story",
  "التسويق بالعمولة | اربح معنا": "Affiliate Marketing | Earn With Us",
  "انضم إلى فريق نعين": "Join Noeen Team",
  "الاسئلة الشائعة": "FAQ",
  "سياسة الاسترداد والاستبدال": "Refund & Exchange Policy",
  "شروط وأحكام الاستخدام": "Terms of Use",
  "سياسة الخصوصية": "Privacy Policy",
  "تحذير من المنتحلين لنعين": "Warning About Noeen Impersonators",
  "الشكاوى والاقتراحات": "Complaints & Suggestions",
  "برنامج التسويق بالعمولة": "Affiliate Program",
  "منصة نعين للخدمات الالكترونية": "Noeen Platform for Electronic Services",
  "العربية": "Arabic",
  "حسابي": "My Account",
  "تسجيل الدخول": "Sign In",
  "السلة": "Cart",
  "القائمة الرئيسية": "Main Menu",
  "لا توجد نتائج": "No results found",
  "لا شيء هنا حتى الآن ، يرجى المحاولة مرة أخرى":
    "Nothing here yet, please try again",
};

const QUOTE_MAP = {
  "متعاونيين جدا": "Very cooperative",
  "كانت مع الاخت شوق ممتازه ومتعاونه يعطيها العافيه 🙏🏾❤️":
    "Shoug was excellent and helpful, may she be blessed 🙏🏾❤️",
  "رائعه وأعيد التجربة": "Great, I will repeat the experience",
  "شكرا من القلب للكل القائمين على العمل":
    "Thank you from the heart to everyone running this work",
};

function t(text) {
  if (!text) return text;
  return STRING_MAP[text] ?? text;
}

function translateProduct(p) {
  return {
    ...p,
    name: PRODUCT_NAMES[p.id] ?? p.name,
    badge: p.badge ? BADGE_MAP[p.badge] ?? p.badge : undefined,
  };
}

function translateNav(links) {
  return links.map((link) => ({
    ...link,
    label: t(link.label),
    children: link.children?.map((c) => ({ ...c, label: t(c.label) })) ?? [],
  }));
}

const enData = {
  STORE: {
    ...data.STORE,
    name: t(data.STORE.name),
  },
  HEADER_UI: {
    locale: { language: "English", currencyIcon: "sicon-sar" },
    searchLabel: "Search",
    login: { heading: "My Account", action: "Sign In" },
    cart: { label: "Cart" },
    menuTitle: "Main Menu",
    viewAll: "View All",
    searchModal: {
      title: "No results found",
      description: "Nothing here yet, please try again",
    },
    testimonialsTitle: "Customer Reviews",
  },
  NAV_LINKS: translateNav(data.NAV_LINKS),
  HERO_SLIDES: data.HERO_SLIDES.map((s) => ({ ...s, alt: "Noeen Platform" })),
  PRODUCT_SECTIONS: data.PRODUCT_SECTIONS.map((s) => ({
    ...s,
    title: t(s.title),
    viewAllLabel: t(s.viewAllLabel),
    products: s.products.map(translateProduct),
  })),
  PROMO_BANNERS: data.PROMO_BANNERS,
  TESTIMONIALS: data.TESTIMONIALS.map((item) => ({
    ...item,
    quote: QUOTE_MAP[item.quote] ?? item.quote,
  })),
  TRUST_FEATURES: data.TRUST_FEATURES.map((f) => ({
    ...f,
    title: t(f.title),
    description: t(f.description),
  })),
  PROCESS_STEPS: data.PROCESS_STEPS.map((f) => ({
    ...f,
    title: t(f.title),
    description: t(f.description),
  })),
  FOOTER: {
    ...data.FOOTER,
    about:
      "Noeen® is the first Saudi platform specialized in data entry and electronic services. We offer 500+ services with experience since 2011. C.R: 1010637616 Unified No: 7017271490 #Noeen_Achievers",
    logoAlt: t(data.FOOTER.logoAlt),
    importantLinksTitle: t(data.FOOTER.importantLinksTitle),
    contactTitle: t(data.FOOTER.contactTitle),
    policyLinks: data.FOOTER.policyLinks.map((l) => ({ ...l, label: t(l.label) })),
    copyright: "All rights reserved | 2026 Noeen Platform for Electronic Services",
  },
  HOME_SECTIONS: data.HOME_SECTIONS.map((section) => {
    if (section.type === "hero") {
      return { ...section, slides: section.slides.map((s) => ({ ...s, alt: "Noeen Platform" })) };
    }
    if (section.type === "products") {
      return {
        ...section,
        title: t(section.title),
        viewAllLabel: t(section.viewAllLabel),
        products: section.products.map(translateProduct),
      };
    }
    if (section.type === "testimonials") {
      return {
        ...section,
        title: t(section.title),
        viewAllLabel: t(section.viewAllLabel),
        items: section.items.map((item) => ({
          ...item,
          quote: QUOTE_MAP[item.quote] ?? item.quote,
        })),
      };
    }
    if (section.type === "trust-features" || section.type === "process-steps") {
      return {
        ...section,
        items: section.items.map((f) => ({
          ...f,
          title: t(f.title),
          description: t(f.description),
        })),
      };
    }
    return section;
  }),
  ALL_PRODUCTS: data.ALL_PRODUCTS.map(translateProduct),
};

const enLocale = {
  cart: enData.HEADER_UI.cart,
  login: enData.HEADER_UI.login,
  menuTitle: enData.HEADER_UI.menuTitle,
  searchLabel: enData.HEADER_UI.searchLabel,
  viewAll: enData.HEADER_UI.viewAll,
  searchModal: enData.HEADER_UI.searchModal,
  locale: enData.HEADER_UI.locale,
  addToCart: "Add to cart",
  currency: "SAR",
  checkout: "Checkout",
  emptyCart: "Your cart is empty",
  goToCheckout: "Go to cart",
  continueShopping: "Continue shopping",
  remove: "Remove",
  total: "Total",
  orderSuccess: "Your order was received successfully",
  backHome: "Back to home",
  language: "Language",
  english: "English",
  arabic: "Arabic",
};

function serializeModule(exports) {
  return `// Auto-generated by scripts/generate-homepage-en.mjs — do not edit manually
// Re-run: node scripts/generate-homepage-en.mjs

${Object.entries(exports)
  .map(([key, value]) => `export const ${key} = ${JSON.stringify(value, null, 2)};`)
  .join("\n\n")}
`;
}

fs.writeFileSync(
  path.join(__dirname, "..", "src", "constants", "homepage.en.js"),
  serializeModule(enData)
);
fs.writeFileSync(
  path.join(__dirname, "..", "src", "locales", "en.json"),
  JSON.stringify(enLocale, null, 2)
);

console.log("Generated homepage.en.js and locales/en.json");
