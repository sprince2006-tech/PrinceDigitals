const Collection = require('../models/Collection');

const PRODUCTION_DOMAIN = 'https://princedigitals.vercel.app';

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Real-time dynamic XML Sitemap generator from published collections in MongoDB
 * GET /sitemap.xml
 */
const getSitemapXml = async (req, res, next) => {
  try {
    const collections = await Collection.find({ isPublished: true })
      .select('slug publishedAt updatedAt createdAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Homepage
    xml += '  <url>\n';
    xml += `    <loc>${PRODUCTION_DOMAIN}/</loc>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // Published Collections
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

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (err) {
    next(err);
  }
};

/**
 * Backend robots.txt response
 * GET /robots.txt
 */
const getRobotsTxt = (req, res) => {
  const content = `# Prince Digital Backend Service
User-agent: *
Disallow: /api/
Disallow: /health

Sitemap: ${PRODUCTION_DOMAIN}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400');
  return res.status(200).send(content);
};

module.exports = {
  getSitemapXml,
  getRobotsTxt,
};
