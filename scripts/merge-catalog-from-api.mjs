import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { toAppPath } from "../src/utils/appRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_ID = "2108864523";
const PLACEHOLDER =
  "https://cdn.salla.sa/cdn-cgi/image/fit=scale-down,width=400,height=400,onerror=redirect,format=auto/RlDV/CtuhQhs1wqQazzRZ2O9mQd2dBeU6dh79ZLlUVsRM.png";

const CATEGORY_UPDATES = {
  "894140414": [
    "1655869090", "1359108006", "60280433", "1071149639", "806270790", "276579898",
    "81439927", "282729287", "1901040822", "1308683599", "1630790669", "1166648835",
    "1341741312", "507931762", "1775956787", "1103178862", "1493503193", "228387297",
    "137892222", "545716692", "974908960", "675282130", "1028347799", "907670004",
    "1416930191", "2092517820", "805132328", "493833655", "852924032", "2082055208",
    "286991082", "277205808", "2037788786", "1640068406", "330404503", "1525860874",
  ],
  "118595327": [
    "1143232232", "2051733752", "1665411037", "234977349", "545716692", "1823438746",
    "907670004", "554220204", "2092517820", "428134903", "301335325", "1698035441",
    "919502854", "950229863", "1191400056",
  ],
  "1358872056": [
    "926985640", "1979456634", "2012506740", "182797544", "907670004", "226771302",
    "305293112", "790412594", "1515405670", "1205180265", "1055791256", "1367803046",
    "1350549536", "1669713324", "796770371", "724979500", "449437927", "459221613",
    "358622690", "1576795155", "1985425751", "1309551907", "293316911", "1623814366",
  ],
  "584834297": [
    "1655869090", "218159350", "544546084", "314830519", "1002540934", "831537051",
    "246794755", "112901477", "826100189", "457752020", "1464127493", "1609417941",
    "1220886799", "1828354304", "1028347799", "186716860", "907670004", "1682908702",
    "1395692528", "1659263410", "710133182", "386002055", "1652454207", "2110734778",
    "462085558", "1901933166", "2108762587", "2143905749", "69389528", "1127895407",
    "601098970", "1335773220", "1656794904", "770463956",
  ],
  "1442637881": [
    "1655869090", "99529889", "574468366", "1665411037", "280486708", "1624056033",
    "1183708939", "924239237", "1237444874", "1694462642", "1157663729", "152325876",
    "1319790951", "15190622", "821330242", "1207537531", "1100614670", "1907702591",
    "2135863882", "1457182585", "2038668116", "214710874", "1141089119", "163038501",
    "2023090391", "1002000781", "1028347799", "2134151846",
  ],
  "1034732737": [
    "1655869090", "612211139", "619538099", "2033924273", "1308518077", "806270790",
    "1498599432", "304148769", "924239237", "1107912810", "1147295460", "74235184",
    "608882570", "1439077276", "195654926", "1036328759", "712956592", "1200516184",
    "2023766770", "1733688011", "1858459821", "919840975", "2126949774", "1922985841",
    "678759221", "364328189", "1225394627", "722394577", "1418166198", "1872033357",
    "1603823731", "410268848", "1963711392", "214710874", "1466587301", "1517170508",
    "1401442902", "174969110", "1842969867", "907670004", "729955902", "1956119028",
    "691806612", "2092517820", "1701488404", "2114054661", "820482448", "1126709696",
    "289981738", "4128690", "1619287644", "2037788786", "698445667", "1225581574",
    "1954385347", "1840582525", "1607979275", "1373512161", "612779486", "2038546715",
    "970514651", "100250870", "950229863", "1191400056",
  ],
  "1107874169": ["1655869090"],
  "1773281147": ["1655869090"],
  "1000291908": ["1655869090"],
  "898636097": [
    "1655869090", "1359108006", "276579898", "1083765454", "568799027",
  ],
  "589784652": ["1655869090", "1422218109", "1458694928"],
  "409614788": [
    "1655869090", "1937222150", "1083765454", "1718414208", "261635638", "774719099",
    "1232635646", "923754790", "919265488", "568799027", "140122907", "1873491281",
    "1077962490", "1025843908", "228387297", "731074127", "123805573", "1415105171",
    "152060751", "1319646233", "1272585624", "2130914390", "1358175455", "282007794",
    "1117164834", "1963711392", "1799830540", "751948653", "1068832713", "193235793",
    "1690022809", "163038501", "675282130", "609878537", "826135218", "1028347799",
    "1590609499", "607449102", "993021569", "1874239227", "1666502357", "907670004",
    "637141312", "670195570", "1475163376", "238998409", "1151268548", "2131047188",
    "1126709696", "286991082", "1059133293", "1627148037", "1167548395", "1234957599",
    "690927246", "700248084", "34255370", "483637778", "330404503", "950229863",
    "1191400056",
  ],
  "301631175": ["1655869090", "1170029007"],
};

const CACHE_DIR = path.join(__dirname, "catalog-cache");

async function fetchCategoryProducts(categoryId) {
  const products = [];
  let url = `https://api.salla.dev/store/v1/products?source=categories&filterable=1&source_value%5B0%5D=${categoryId}&page=1`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Store-Identifier": STORE_ID,
        "s-store-id": STORE_ID,
      },
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) throw new Error(`API ${categoryId}: ${res.status}`);
    const json = await res.json();
    products.push(...(json.data ?? []));
    url = json.cursor?.next ?? null;
  }

  return products;
}

function loadCachedCategoryProducts(categoryId) {
  const filePath = path.join(CACHE_DIR, `${categoryId}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing cache file: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function apiProductToCatalog(p) {
  const image = p.original_image || p.image?.url || PLACEHOLDER;
  const id = String(p.id);
  let price = p.is_dynamic_pricing ? null : p.price;
  if (id === "907670004") price = null;

  const entry = {
    id,
    name: p.name,
    url: toAppPath(p.url),
    image: image || PLACEHOLDER,
    price,
  };

  if (p.promotion_title) entry.badge = p.promotion_title;
  if (p.rating?.stars) entry.rating = p.rating.stars;
  if (p.is_out_of_stock) entry.status = "out";

  return entry;
}

function parseExistingCatalog(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const mapMatch = src.match(/export const CATEGORY_PRODUCTS_MAP = (\{[\s\S]*?\n\});\n/);
  const productsMatch = src.match(/export const CATALOG_PRODUCTS_BY_ID = (\{[\s\S]*?\n\});\n\nexport const CATALOG_WITH_TESTIMONIALS/);
  if (!mapMatch || !productsMatch) throw new Error(`Could not parse ${filePath}`);

  // eslint-disable-next-line no-eval
  const CATEGORY_PRODUCTS_MAP = eval(`(${mapMatch[1]})`);
  // eslint-disable-next-line no-eval
  const CATALOG_PRODUCTS_BY_ID = eval(`(${productsMatch[1]})`);
  const testimonialsMatch = src.match(/export const CATALOG_WITH_TESTIMONIALS = (new Set\([^)]+\));/);
  // eslint-disable-next-line no-eval
  const CATALOG_WITH_TESTIMONIALS = eval(`(${testimonialsMatch[1]})`);

  return { CATEGORY_PRODUCTS_MAP, CATALOG_PRODUCTS_BY_ID, CATALOG_WITH_TESTIMONIALS };
}

function formatProductEntry(id, p) {
  const lines = [`  "${id}": {`, `    id: "${p.id}",`, `    name: ${JSON.stringify(p.name)},`, `    url: ${JSON.stringify(p.url)},`];
  if (p.image === PLACEHOLDER) {
    lines.push(`    image: PLACEHOLDER,`);
  } else {
    lines.push(`    image: ${JSON.stringify(p.image)},`);
  }
  if (p.price === null) {
    lines.push(`    price: null,`);
  } else {
    lines.push(`    price: ${p.price},`);
  }
  if (p.badge) lines.push(`    badge: ${JSON.stringify(p.badge)},`);
  if (p.rating) lines.push(`    rating: ${p.rating},`);
  if (p.status === "out") lines.push(`    status: "out",`);
  lines.push(`  },`);
  return lines.join("\n");
}

function formatMap(map) {
  const entries = Object.entries(map).map(([key, ids]) => {
    const idLines = ids.map((id) => `    "${id}",`).join("\n");
    return `  ${JSON.stringify(key)}: [\n${idLines}\n  ],`;
  });
  return `export const CATEGORY_PRODUCTS_MAP = {\n${entries.join("\n")}\n};`;
}

function writeCatalogFile(filePath, map, productsById, testimonials) {
  const sortedIds = Object.keys(productsById).sort((a, b) => Number(a) - Number(b));
  const productBlocks = sortedIds.map((id) => formatProductEntry(id, productsById[id])).join("\n");
  const testimonialList = [...testimonials].map((id) => JSON.stringify(id)).join(", ");

  const content = `const PLACEHOLDER =
  "${PLACEHOLDER}";

${formatMap(map)}

export const CATALOG_PRODUCTS_BY_ID = {
${productBlocks}
};

export const CATALOG_WITH_TESTIMONIALS = new Set([${testimonialList}]);
`;

  fs.writeFileSync(filePath, content, "utf8");
}

async function main() {
  const offline = process.argv.includes("--offline");
  const arPath = path.join(__dirname, "../src/constants/catalogProducts.ar.js");
  const enPath = path.join(__dirname, "../src/constants/catalogProducts.en.js");

  const existing = parseExistingCatalog(arPath);
  const { CATEGORY_PRODUCTS_MAP, CATALOG_PRODUCTS_BY_ID, CATALOG_WITH_TESTIMONIALS } = existing;

  const apiProducts = new Map();
  for (const categoryId of Object.keys(CATEGORY_UPDATES)) {
    console.log(`${offline ? "Loading" : "Fetching"} category ${categoryId}...`);
    const list = offline
      ? loadCachedCategoryProducts(categoryId)
      : await fetchCategoryProducts(categoryId);
    if (!offline) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(path.join(CACHE_DIR, `${categoryId}.json`), JSON.stringify(list));
    }
    for (const p of list) apiProducts.set(String(p.id), apiProductToCatalog(p));
    console.log(`  ${list.length} products`);
  }

  for (const [categoryId, ids] of Object.entries(CATEGORY_UPDATES)) {
    CATEGORY_PRODUCTS_MAP[categoryId] = ids;
  }

  for (const [id, product] of apiProducts) {
    CATALOG_PRODUCTS_BY_ID[id] = product;
  }

  writeCatalogFile(arPath, CATEGORY_PRODUCTS_MAP, CATALOG_PRODUCTS_BY_ID, CATALOG_WITH_TESTIMONIALS);
  writeCatalogFile(enPath, CATEGORY_PRODUCTS_MAP, CATALOG_PRODUCTS_BY_ID, CATALOG_WITH_TESTIMONIALS);

  console.log(`Updated catalog with ${apiProducts.size} API products, ${Object.keys(CATALOG_PRODUCTS_BY_ID).length} total entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
