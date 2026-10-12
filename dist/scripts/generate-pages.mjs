import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

const dist = new URL('../', import.meta.url);
const template = readFileSync(new URL('../templates/base.html', import.meta.url), 'utf8');
const appScript = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const pages = [
  ['/', 'CareTech | CCTV, Fire Safety & Networking Solutions', 'CareTech supplies and installs CCTV surveillance, access control, fire safety, networking and connected security solutions. Explore our brands and work.'],
  ['/surveillance/', 'CCTV Surveillance & Access Control | CareTech', 'Explore CareTech CCTV surveillance, access control, intrusion alarms, networking and video intercom solutions for homes and businesses.'],
  ['/fire-safety/', 'Fire Alarm & Fire Protection Systems | CareTech', 'Explore CareTech fire alarms, hydrants, extinguishing systems, sprinklers and emergency evacuation solutions for your property.'],
  ['/cloud-solutions/', 'Connected Security & Cloud Solutions | CareTech', 'Explore connected surveillance and security options for remote viewing, alerts and access across your locations with CareTech.'],
  ['/about-us/', 'About CareTech | Security & Fire Safety Solutions', 'Learn about CareTech, the technology brands we supply, organizations we work with and our approach to safer spaces.'],
  ['/contact/', 'Contact CareTech | CCTV, Fire Safety & Networking', 'Visit CareTech at 101 Bus Stand, Manawar, Dhar, Madhya Pradesh 454446. Contact us for CCTV, fire safety, networking and security solutions.']
];

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function siteOrigin() {
  const candidate = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!candidate) return '';
  try {
    const url = new URL(candidate.startsWith('http') ? candidate : 'https://' + candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Unsupported protocol');
    return url.origin;
  } catch {
    throw new Error('SITE_URL or VERCEL_PROJECT_PRODUCTION_URL must be a valid website URL');
  }
}

const origin = siteOrigin();
const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CareTech',
  description: 'Security, networking and fire protection solutions.',
  email: 'caretechforit@gmail.com',
  telephone: '+91-92447-86801',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '101 Bus Stand',
    addressLocality: 'Manawar',
    addressRegion: 'Madhya Pradesh',
    postalCode: '454446',
    addressCountry: 'IN'
  },
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', telephone: '+91-92447-86801', email: 'caretechforit@gmail.com' }]
};
const schema = JSON.stringify(organization).replaceAll('<', '\\u003c');

for (const [path, title, description] of pages) {
  const app = { innerHTML: '' };
  const document = {
    querySelectorAll: () => [],
    querySelector: () => ({ addEventListener() {} }),
    getElementById: id => id === 'app' ? app : id === 'year' ? { textContent: '' } : null
  };
  runInNewContext(appScript, { document, location: { pathname: path }, window: {} }, { timeout: 1000 });
  if (!app.innerHTML.includes('<h1>')) throw new Error('Missing page content for ' + path);

  const absolute = origin ? origin + path : '';
  const meta = [
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="CareTech">',
    '<meta property="og:title" content="' + escapeHtml(title) + '">',
    '<meta property="og:description" content="' + escapeHtml(description) + '">',
    '<meta name="twitter:card" content="summary">'
  ];
  if (absolute) {
    meta.push('<link rel="canonical" href="' + escapeHtml(absolute) + '">');
    meta.push('<meta property="og:url" content="' + escapeHtml(absolute) + '">');
    meta.push('<meta property="og:image" content="' + escapeHtml(origin + '/assets/caretech-logo.png') + '">');
  }
  if (path === '/') {
    meta.push('<script type="application/ld+json">' + schema + '</script>');
  }
  const replacements = {
    '{{TITLE}}': escapeHtml(title),
    '{{DESCRIPTION}}': escapeHtml(description),
    '{{HEAD_EXTRA}}': meta.join('\n  '),
    '{{CONTENT}}': app.innerHTML,
    '{{YEAR}}': String(new Date().getFullYear())
  };
  let html = template;
  for (const [placeholder, value] of Object.entries(replacements)) html = html.replace(placeholder, value);
  if (/{{[A-Z_]+}}/.test(html)) throw new Error('Unreplaced template value for ' + path);
  const directory = join(new URL('.', dist).pathname, path);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, 'index.html'), html);
  console.log('Generated ' + path);
}

const robots = ['User-agent: *', 'Allow: /'];
if (origin) robots.push('Sitemap: ' + origin + '/sitemap.xml');
writeFileSync(new URL('../robots.txt', import.meta.url), robots.join('\n') + '\n');
if (origin) {
  const urls = pages.map(([path]) => '<url><loc>' + escapeHtml(origin + path) + '</loc></url>').join('');
  writeFileSync(new URL('../sitemap.xml', import.meta.url), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>\n');
}
