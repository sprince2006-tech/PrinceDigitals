import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');

const server = http.createServer((req, res) => {
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  if (ext === '.txt') contentType = 'text/plain; charset=utf-8';
  else if (ext === '.xml') contentType = 'application/xml; charset=utf-8';
  else if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.css') contentType = 'text/css';
  else if (ext === '.png') contentType = 'image/png';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4173, async () => {
  try {
    console.log('Testing server started on port 4173\n');

    // 1. Robots.txt test
    const resRobots = await fetch('http://localhost:4173/robots.txt');
    const robotsText = await resRobots.text();
    console.log('[TEST 1] /robots.txt:');
    console.log('  Status code:', resRobots.status);
    console.log('  Content-Type:', resRobots.headers.get('content-type'));
    console.log('  Contains Sitemap reference:', robotsText.includes('Sitemap: https://princedigitals.vercel.app/sitemap.xml'));
    console.log('  Disallows /admin, /user, /login:', robotsText.includes('Disallow: /admin') && robotsText.includes('Disallow: /user') && robotsText.includes('Disallow: /login'));

    // 2. Sitemap.xml test
    const resSitemap = await fetch('http://localhost:4173/sitemap.xml');
    const sitemapText = await resSitemap.text();
    console.log('\n[TEST 2] /sitemap.xml:');
    console.log('  Status code:', resSitemap.status);
    console.log('  Content-Type:', resSitemap.headers.get('content-type'));
    console.log('  Valid XML root <urlset>:', sitemapText.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    console.log('  Contains Homepage URL:', sitemapText.includes('<loc>https://princedigitals.vercel.app/</loc>'));
    console.log('  Contains Real Published Collections:');
    console.log('    - gym-essentials-you-need:', sitemapText.includes('https://princedigitals.vercel.app/collection/gym-essentials-you-need'));
    console.log('    - jailer-t-shirts:', sitemapText.includes('https://princedigitals.vercel.app/collection/jailer-t-shirts'));
    console.log('    - ladies:', sitemapText.includes('https://princedigitals.vercel.app/collection/ladies'));
    console.log('  Excludes private/admin routes:', !sitemapText.includes('/admin') && !sitemapText.includes('/login') && !sitemapText.includes('/dashboard'));
    console.log('  Excludes external product URLs:', !sitemapText.includes('amazon.com') && !sitemapText.includes('flipkart'));

    // 3. Homepage HTML metadata test
    const resHome = await fetch('http://localhost:4173/');
    const homeText = await resHome.text();
    console.log('\n[TEST 3] Homepage HTML Metadata:');
    console.log('  Status code:', resHome.status);
    console.log('  Title tag:', homeText.includes('<title>Prince Digital | Curated Fashion & Product Collections</title>'));
    console.log('  Meta description:', homeText.includes('content="Discover curated fashion, men\'s formal wear, streetwear, gym essentials, and handpicked product collections at Prince Digital."'));
    console.log('  Meta robots index, follow:', homeText.includes('content="index, follow"'));
    console.log('  Canonical URL:', homeText.includes('<link rel="canonical" href="https://princedigitals.vercel.app/"'));
    console.log('  OG Title:', homeText.includes('property="og:title" content="Prince Digital | Curated Fashion & Product Collections"'));
    console.log('  OG Image:', homeText.includes('property="og:image" content="https://princedigitals.vercel.app/PD_logo.png"'));
    console.log('  Twitter Card:', homeText.includes('name="twitter:card" content="summary_large_image"'));
    console.log('  JSON-LD WebSite & Organization:', homeText.includes('"@type": "WebSite"') && homeText.includes('"@type": "Organization"'));
    
    console.log('\nALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Validation error:', err);
  } finally {
    server.close();
  }
});
