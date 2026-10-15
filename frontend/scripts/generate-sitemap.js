import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_DOMAIN = 'https://princedigitals.vercel.app';
const API_BASE =
  process.env.VITE_API_URL ||
  process.env.VITE_API_BASE_URL ||
  'https://prince-digital-api.onrender.com/api/v1';

// Clean trailing slashes
const normalizedApi = API_BASE.replace(/\/+$/, '');
const collectionsApiEndpoint = normalizedApi.endsWith('/collections')
  ? normalizedApi
  : `${normalizedApi}/collections`;

const OUTPUT_PATH = path.resolve(__dirname, '../public/sitemap.xml');

// Known published collections fallback (prevents build failure if backend is cold/offline)
const FALLBACK_COLLECTIONS = [
  {
    slug: 'gym-essentials-you-need',
    publishedAt: '2026-10-14T18:42:44.980Z',
  },
  {
    slug: 'jailer-t-shirts',
    publishedAt: '2026-10-14T05:55:15.627Z',
  },
  {
    slug: 'ladies',
    publishedAt: '2026-10-14T04:58:42.306Z',
  },
];

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchPublishedCollections() {
  try {
    console.log(`[SEO Sitemap] Fetching published collections from ${collectionsApiEndpoint}...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(collectionsApiEndpoint, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    console.log(`[SEO Sitemap] Successfully retrieved ${list.length} collections from live API.`);
    return list;
  } catch (err) {
    console.warn(`[SEO Sitemap Warning] Could not reach live backend: ${err.message}`);
    console.warn('[SEO Sitemap Warning] Using known published collections fallback snapshot.');
    return FALLBACK_COLLECTIONS;
  }
}

function buildSitemapXml(collections) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 1. Homepage
  xml += '  <!-- Homepage -->\n';
  xml += '  <url>\n';
  xml += `    <loc>${PRODUCTION_DOMAIN}/</loc>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';

  // 2. Published Collection Pages (real, active, publicly indexable routes only)
  xml += '  <!-- Published Collections -->\n';
  const seenSlugs = new Set();

  for (const col of collections) {
    if (!col || !col.slug) continue;
    const cleanSlug = String(col.slug).trim().toLowerCase();
    if (seenSlugs.has(cleanSlug)) continue;
    seenSlugs.add(cleanSlug);

    const dateVal = col.updatedAt || col.publishedAt || col.createdAt;
    let validDate = null;
    if (dateVal) {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        validDate = d.toISOString();
      }
    }

    xml += '  <url>\n';
    xml += `    <loc>${PRODUCTION_DOMAIN}/collection/${escapeXml(cleanSlug)}</loc>\n`;
    if (validDate) {
      xml += `    <lastmod>${validDate}</lastmod>\n`;
    }
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  return xml;
}

async function run() {
  try {
    const collections = await fetchPublishedCollections();
    const sitemapXml = buildSitemapXml(collections);

    // Ensure public directory exists
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, sitemapXml, 'utf-8');
    console.log(`[SEO Sitemap] sitemap.xml successfully written to: ${OUTPUT_PATH}`);
  } catch (err) {
    console.error('[SEO Sitemap Error] Fatal error generating sitemap:', err);
    process.exit(1);
  }
}

run();
