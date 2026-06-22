import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { toAppPath } from "../src/utils/appRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, "salla-homepage-source.html"), "utf8");
const main = html.slice(html.indexOf('<main id="main-content"'), html.indexOf("</main>"));
const header = html.slice(html.indexOf('<header class="store-header'), html.indexOf("</header>") + 9);
const footer = html.slice(html.indexOf('<footer class="store-footer'), html.indexOf("</footer>") + 9);
const FALLBACK_IMAGE =
  "https://cdn.salla.sa/cdn-cgi/image/fit=scale-down,width=400,height=400,onerror=redirect,format=auto/RlDV/CtuhQhs1wqQazzRZ2O9mQd2dBeU6dh79ZLlUVsRM.png";

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function stripTags(text) {
  return decodeHtml(text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function fixImage(url) {
  if (!url || url === "undefined") return FALLBACK_IMAGE;
  return url;
}

function parseProducts(block) {
  const products = [];
  const cardRegex =
    /<custom-salla-product-card[^>]*\bid="(\d+)"[\s\S]*?(?:<\/custom-salla-product-card>)/g;
  let match;
  while ((match = cardRegex.exec(block))) {
    const card = match[0];
    const id = match[1];
    const urlMatch = card.match(/s-product-card-content-title[\s\S]*?<a href="([^"]+)">([^<]+)<\/a>/);
    const imgMatch = card.match(/<img[^>]*src="([^"]+)"/);
    const priceMatch = card.match(/s-product-card-price">(\d+(?:\.\d+)?)/);
    const ratingMatch = card.match(/s-product-card-rating[\s\S]*?<span>(\d+(?:\.\d+)?)<\/span>/);
    const badgeMatch = card.match(/s-product-card-promotion-title">([^<]+)</);
    if (!urlMatch || !priceMatch) continue;
    products.push({
      id,
      name: decodeHtml(urlMatch[2]),
      url: urlMatch[1],
      image: fixImage(imgMatch?.[1]),
      price: Number(priceMatch[1]),
      rating: ratingMatch ? Number(ratingMatch[1]) : 5,
      badge: badgeMatch ? decodeHtml(badgeMatch[1]) : undefined,
    });
  }
  return products;
}

function findLiBlockEnd(html, liStart) {
  let depth = 0;
  for (let i = liStart; i < html.length; i++) {
    if (html.startsWith("<li", i)) depth++;
    else if (html.startsWith("</li>", i)) {
      depth--;
      if (depth === 0) return i + 5;
    }
  }
  return html.length;
}

function parseNavLinks() {
  const menuBlock = header.match(/<ul class="main-menu">([\s\S]*?)<\/ul>/)?.[1] ?? "";
  const links = [];
  const rootStartRegex = /<li class="root-level[\s\S]*?" id="([^"]*)">/g;
  let m;
  while ((m = rootStartRegex.exec(menuBlock))) {
    const liStart = m.index;
    const liEnd = findLiBlockEnd(menuBlock, liStart);
    const liBlock = menuBlock.slice(liStart, liEnd);
    const anchorMatch = liBlock.match(
      /<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/
    );
    if (!anchorMatch) continue;

    const item = {
      id: m[1],
      label: decodeHtml(anchorMatch[2]),
      href: anchorMatch[1],
      children: [],
    };

    const childRegex =
      /<li class="relative[\s\S]*?" id="([^"]*)">[\s\S]*?href="([^"]+)"[\s\S]*?<span>([^<]+)<\/span>/g;
    let child;
    while ((child = childRegex.exec(liBlock))) {
      item.children.push({
        id: child[1],
        label: decodeHtml(child[3]),
        href: child[2],
      });
    }
    links.push(item);
  }
  return links;
}

function parseHeroSlides() {
  const block = main.match(/s-block--photos-slider[\s\S]*?<\/section>/)?.[0] ?? "";
  const slides = [];
  const seen = new Set();
  const imgRegex = /href="([^"]*)"[\s\S]*?src="(https:\/\/cdn\.files\.salla\.network\/homepage[^"]+)"/g;
  let m;
  while ((m = imgRegex.exec(block))) {
    if (seen.has(m[2])) continue;
    seen.add(m[2]);
    slides.push({
      href: m[1] || undefined,
      image: m[2],
      alt: "منصة نعين",
    });
  }
  return slides;
}

function parseProductSections() {
  const sections = [];
  const sectionRegex =
    /<section id="([^"]+)" class="s-block s-block--best-offers container">([\s\S]*?)<\/section>/g;
  let m;
  while ((m = sectionRegex.exec(main))) {
    const block = m[2];
    const title = block.match(/block-title="([^"]+)"/)?.[1] ?? "";
    const viewAllHref = block.match(/display-all-url="([^"]*)"/)?.[1] ?? "";
    const viewAllLabel = block.match(/s-slider-block__display-all">([^<]+)</)?.[1] ?? "عرض الكل";
    const products = parseProducts(block);
    if (products.length === 0) continue;
    sections.push({
      id: m[1],
      title: decodeHtml(title),
      viewAllHref: viewAllHref || undefined,
      viewAllLabel: decodeHtml(viewAllLabel),
      products,
    });
  }
  return sections;
}

function parseBanners() {
  const banners = [];
  const bannerBlocks = [...main.matchAll(/s-block--fixed-banner[\s\S]*?<\/section>/g)];
  for (const blockMatch of bannerBlocks) {
    const block = blockMatch[0];
    const href = block.match(/<a href="([^"]*)"/)?.[1];
    const image = block.match(/src="(https:\/\/cdn\.files\.salla\.network[^"]+)"/)?.[1];
    if (!image) continue;
    banners.push({
      href: href || undefined,
      image,
      alt: "Banner",
    });
  }
  return banners;
}

function parseFeatures(kind) {
  const blocks = [...main.matchAll(/<section class="s-block s-block--features container">([\s\S]*?)<\/section>/g)];
  const index = kind === "trust" ? 0 : 1;
  const block = blocks[index]?.[1] ?? "";
  const items = [];
  const itemRegex =
    /feature-icon ([^"]+)"[\s\S]*?<h2>([^<]+)<\/h2>[\s\S]*?<p>([^<]+)<\/p>/g;
  let m;
  while ((m = itemRegex.exec(block))) {
    items.push({
      icon: m[1],
      title: decodeHtml(m[2]),
      description: decodeHtml(m[3]),
    });
  }
  return items;
}

function parseTestimonials() {
  const items = [];
  const block = main.match(/s-block--testimonials[\s\S]*?<\/section>/)?.[0] ?? main;
  const cards = [...block.matchAll(/<div class="border rounded p-5 h-full">([\s\S]*?)<\/div>\s*<\/div>/g)];
  for (const card of cards) {
    const chunk = card[1];
    const name = chunk.match(/<h4 class="font-bold pt-2">([^<]+)<\/h4>/)?.[1];
    const avatar = chunk.match(/<img src="([^"]+)"/)?.[1];
    const quote = chunk.match(/text-gray-600">([^<]*)<\/p>/)?.[1];
    const rating = Number(chunk.match(/value="(\d+)"/)?.[1] ?? 5);
    if (!name) continue;
    items.push({
      name: decodeHtml(name),
      avatar,
      quote: decodeHtml(quote ?? ""),
      rating,
    });
  }
  return items;
}

function parseFooter() {
  const aboutMatch = footer.match(/<p class="ql-align-right">([\s\S]*?)<\/p>/);
  const about = aboutMatch ? stripTags(aboutMatch[1]) : "";

  const socialLinks = [];
  const socialRegex =
    /<a href="([^"]+)"[^>]*title="(instagram|twitter|snapchat|tiktok)"[^>]*aria-label="([^"]+)"/g;
  let s;
  while ((s = socialRegex.exec(footer))) {
    socialLinks.push({ platform: s[2], href: s[1], label: s[3] });
  }

  const policyLinks = [];
  const policyFullRegex = /<a href="([^"]+)"[^>]*class="s-menu-footer-item">([^<]+)<\/a>/g;
  let p;
  while ((p = policyFullRegex.exec(footer))) {
    policyLinks.push({ label: decodeHtml(p[2]), href: p[1] });
  }

  const contacts = [];
  const contactRegex =
    /<a href="([^"]+)" class="s-contacts-item">[\s\S]*?<span class="unicode">([^<]+)<\/span>/g;
  let c;
  while ((c = contactRegex.exec(footer))) {
    contacts.push({ href: c[1], value: decodeHtml(c[2]) });
  }

  const payments = [];
  const paymentRegex = /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/g;
  const paymentBlock = footer.match(/s-payments-list">([\s\S]*?)<\/ul>/)?.[1] ?? "";
  while ((p = paymentRegex.exec(paymentBlock))) {
    payments.push({ image: p[1], alt: decodeHtml(p[2]) });
  }

  const copyrightMatch = footer.match(/<p class="text-gray-400[^"]*">([\s\S]*?)<\/p>/);
  const copyright = copyrightMatch ? stripTags(copyrightMatch[1]) : "";

  return {
    about,
    logo: footer.match(/footer-logo[\s\S]*?src="([^"]+)"/)?.[1] ?? FALLBACK_IMAGE,
    logoAlt:
      footer.match(/alt="([^"]+)" class="img-fluid max-w-\[270px\]/)?.[1] ??
      "منصة نعين للخدمات الالكترونية",
    importantLinksTitle: footer.match(/<h3 class="footer-title">([^<]+)<\/h3>/)?.[1] ?? "روابط مهمة",
    contactTitle: footer.match(/s-contacts-title">([^<]+)</)?.[1] ?? "تواصل معنا",
    socialLinks,
    policyLinks,
    contacts,
    payments,
    copyright,
  };
}

function applyAppPaths(value, key) {
  if (typeof value === "string" && ["href", "url", "viewAllHref"].includes(key)) {
    return toAppPath(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => applyAppPaths(item, key));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        applyAppPaths(entryValue, entryKey),
      ])
    );
  }
  return value;
}

function parseStore() {
  const logo = header.match(/navbar-brand[\s\S]*?src="([^"]+)"/)?.[1] ?? FALLBACK_IMAGE;
  const name =
    header.match(/<h1 class="sr-only">([^<]+)<\/h1>/)?.[1] ?? "منصة نعين للخدمات الالكترونية";
  return {
    name: decodeHtml(name),
    logo,
    favicon: "https://cdn.salla.sa/RlDV/WmocG1vS9Zu4s16Q7RN4S4MZB7gXDi6teG4TZ42l.png",
  };
}

function parseHeaderUi() {
  return {
    locale: { language: "العربية", currencyIcon: "sicon-sar" },
    searchLabel: "Search",
    login: { heading: "حسابي", action: "تسجيل الدخول" },
    cart: { label: "السلة" },
    menuTitle: "القائمة الرئيسية",
    viewAll: "عرض الكل",
    searchModal: {
      title: "لا توجد نتائج",
      description: "لا شيء هنا حتى الآن ، يرجى المحاولة مرة أخرى",
    },
    testimonialsTitle: "آراء العملاء",
  };
}

function buildHomeSections() {
  const sections = [];
  const mainParts = main.split(/(?=<section)/);
  let bannerIndex = 0;
  const banners = parseBanners();
  let featuresIndex = 0;

  for (const part of mainParts) {
    if (part.includes("s-block--photos-slider")) {
      sections.push({ type: "hero", slides: parseHeroSlides() });
    } else if (part.includes("s-block--best-offers")) {
      const id = part.match(/id="([^"]+)"/)?.[1];
      const productSection = parseProductSections().find((s) => s.id === id);
      if (productSection) sections.push({ type: "products", ...productSection });
    } else if (part.includes("s-block--fixed-banner")) {
      if (banners[bannerIndex]) {
        sections.push({ type: "banner", ...banners[bannerIndex] });
        bannerIndex += 1;
      }
    } else if (part.includes("s-block--testimonials")) {
      sections.push({
        type: "testimonials",
        title: "آراء العملاء",
        viewAllHref: "/testimonials",
        viewAllLabel: "عرض الكل",
        items: parseTestimonials(),
      });
    } else if (part.includes("s-block--features")) {
      const features = parseFeatures(featuresIndex === 0 ? "trust" : "process");
      const isTrust = features.some(
        (f) => f.title.includes("السرية") || f.title.includes("تقديم")
      );
      sections.push({
        type: isTrust ? "trust-features" : "process-steps",
        items: features,
      });
      featuresIndex += 1;
    }
  }
  return sections;
}

const data = applyAppPaths(
  {
    STORE: parseStore(),
    HEADER_UI: parseHeaderUi(),
    NAV_LINKS: parseNavLinks(),
    HERO_SLIDES: parseHeroSlides(),
    PRODUCT_SECTIONS: parseProductSections(),
    PROMO_BANNERS: parseBanners(),
    TESTIMONIALS: parseTestimonials(),
    TRUST_FEATURES: parseFeatures("trust"),
    PROCESS_STEPS: parseFeatures("process"),
    FOOTER: parseFooter(),
    HOME_SECTIONS: buildHomeSections(),
  },
  null
);

const allProducts = data.PRODUCT_SECTIONS.flatMap((s) => s.products);
const uniqueProducts = [...new Map(allProducts.map((p) => [p.id, p])).values()];

const report = {
  navLinks: data.NAV_LINKS.length,
  heroSlides: data.HERO_SLIDES.length,
  productSections: data.PRODUCT_SECTIONS.map((s) => ({ title: s.title, count: s.products.length })),
  banners: data.PROMO_BANNERS.length,
  testimonials: data.TESTIMONIALS.length,
  trustFeatures: data.TRUST_FEATURES.length,
  processSteps: data.PROCESS_STEPS.length,
  footerPolicies: data.FOOTER.policyLinks.length,
  footerContacts: data.FOOTER.contacts.length,
  footerPayments: data.FOOTER.payments.length,
  uniqueProducts: uniqueProducts.length,
  homeSections: data.HOME_SECTIONS.map((s) => s.type),
};

console.log("Extraction report:", JSON.stringify(report, null, 2));

function serializeModule(exports) {
  return `// Auto-generated by scripts/extract-salla-homepage.mjs — do not edit manually
// Re-run: node scripts/extract-salla-homepage.mjs

${Object.entries(exports)
  .map(([key, value]) => `export const ${key} = ${JSON.stringify(value, null, 2)};`)
  .join("\n\n")}
`;
}

const arPath = path.join(__dirname, "..", "src", "constants", "homepage.ar.js");
const jsonPath = path.join(__dirname, "..", "src", "constants", "homepage.data.json");

fs.writeFileSync(
  arPath,
  serializeModule({
    ...data,
    ALL_PRODUCTS: uniqueProducts,
  })
);
fs.writeFileSync(jsonPath, JSON.stringify({ ...data, ALL_PRODUCTS: uniqueProducts }, null, 2));

const arLocale = {
  cart: data.HEADER_UI.cart,
  login: data.HEADER_UI.login,
  menuTitle: data.HEADER_UI.menuTitle,
  searchLabel: data.HEADER_UI.searchLabel,
  viewAll: data.HEADER_UI.viewAll,
  searchModal: data.HEADER_UI.searchModal,
  locale: data.HEADER_UI.locale,
  addToCart: "إضافة للسلة",
  currency: "ريال",
  checkout: "إتمام الطلب",
  emptyCart: "السلة فارغة",
  goToCheckout: "الذهاب للسلة",
  continueShopping: "متابعة التسوق",
  remove: "حذف",
  total: "الإجمالي",
  orderSuccess: "تم استلام طلبك بنجاح",
  backHome: "العودة للرئيسية",
  language: "اللغة",
  english: "English",
  arabic: "العربية",
};

fs.mkdirSync(path.join(__dirname, "..", "src", "locales"), { recursive: true });
fs.writeFileSync(
  path.join(__dirname, "..", "src", "locales", "ar.json"),
  JSON.stringify(arLocale, null, 2)
);

console.log("Wrote", arPath);
console.log("Wrote", jsonPath);
