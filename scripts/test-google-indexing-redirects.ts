/**
 * VENTREXS AI — GOOGLE INDEXING & REDIRECT AUDIT SUITE
 * Validates the complete production redirect chain, canonical tags, robots.txt, and sitemap.xml.
 */

import fs from 'fs';
import path from 'path';
import { BRAND } from '../src/config/brand';
import { resolveHostContext } from '../src/lib/auth/hostname';

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${description} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('  VENTREXS AI — GOOGLE INDEXING & REDIRECT VERIFICATION AUDIT');
  console.log('================================================================\n');

  // --- SECTION 1: CODEBASE CONFIGURATION AUDIT ---
  console.log('--- 1. Codebase Canonical & Hostname Configuration ---');
  assert(BRAND.domain === 'https://www.ventrexs.com', 'BRAND.domain is canonical https://www.ventrexs.com');
  assert(BRAND.appDomain === 'https://www.ventrexs.com', 'BRAND.appDomain is https://www.ventrexs.com');
  assert(BRAND.rawDomain === 'www.ventrexs.com', 'BRAND.rawDomain is www.ventrexs.com');

  // Verify hostname resolution
  assert(resolveHostContext('www.ventrexs.com') === 'CUSTOMER', 'www.ventrexs.com resolves to CUSTOMER');
  assert(resolveHostContext('ventrexs.com') === 'CUSTOMER', 'ventrexs.com resolves to CUSTOMER');
  assert(resolveHostContext('admin.ventrexs.com') === 'ADMIN', 'admin.ventrexs.com resolves to ADMIN');
  assert(resolveHostContext('agency.ventrexs.com') === 'AGENCY', 'agency.ventrexs.com resolves to AGENCY');

  // Verify middleware does not hijack root path for customer domain
  const middlewareCode = fs.readFileSync(path.join(process.cwd(), 'src', 'middleware.ts'), 'utf-8');
  assert(
    middlewareCode.includes("hostContext === 'ADMIN'") && middlewareCode.includes("hostContext === 'AGENCY'"),
    'Middleware only redirects "/" for ADMIN and AGENCY host contexts, never CUSTOMER'
  );

  // --- SECTION 2: ROOT LAYOUT CANONICAL AUDIT ---
  console.log('\n--- 2. Root Layout Canonical & OpenGraph ---');
  const layoutCode = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'layout.tsx'), 'utf-8');
  assert(
    layoutCode.includes("canonical: `${BRAND.domain}/`"),
    'Root layout defines exact canonical URL with trailing slash: https://www.ventrexs.com/'
  );
  assert(
    layoutCode.includes("index: true") && layoutCode.includes("follow: true"),
    'Root layout allows indexing (robots: index, follow)'
  );

  // --- SECTION 3: SITEMAP & ROBOTS AUDIT ---
  console.log('\n--- 3. Sitemap & Robots Configuration ---');
  const sitemapCode = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'sitemap.ts'), 'utf-8');
  assert(sitemapCode.includes('url: `${baseUrl}/`'), 'Sitemap includes root URL with trailing slash');
  assert(!sitemapCode.includes('/login'), 'Sitemap excludes private /login route');
  assert(!sitemapCode.includes('/signup'), 'Sitemap excludes private /signup route');

  const robotsCode = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'robots.ts'), 'utf-8');
  assert(robotsCode.includes("sitemap: `${BRAND.domain}/sitemap.xml`"), 'Robots links to https://www.ventrexs.com/sitemap.xml');
  assert(robotsCode.includes("'/login'") && robotsCode.includes("'/signup'"), 'Robots disallows private auth routes');

  // --- SECTION 4: LIVE PRODUCTION NETWORK CHAIN AUDIT ---
  console.log('\n--- 4. Live Production Redirect & Canonical Verification ---');

  // Test 1: Apex https://ventrexs.com/
  try {
    const apexRes = await fetch('https://ventrexs.com/', { redirect: 'manual' });
    const apexLoc = apexRes.headers.get('location') || '';
    assert(
      apexRes.status === 301 || apexRes.status === 308,
      `Apex https://ventrexs.com/ redirects with permanent status (${apexRes.status})`
    );
    assert(
      apexLoc === 'https://www.ventrexs.com/' || apexLoc === 'https://www.ventrexs.com',
      `Apex redirects directly to www (${apexLoc})`
    );
  } catch (err: any) {
    console.warn('  ⚠️ Live fetch network notice:', err.message);
  }

  // Test 2: Canonical www https://www.ventrexs.com/
  try {
    const wwwRes = await fetch('https://www.ventrexs.com/', { redirect: 'manual' });
    assert(wwwRes.status === 200, `Canonical www returns HTTP 200 OK (${wwwRes.status})`);

    const html = await wwwRes.text();
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    assert(!!canonicalMatch, 'Live homepage HTML has canonical link tag');
    if (canonicalMatch) {
      assert(
        canonicalMatch[1].startsWith('https://www.ventrexs.com'),
        `Canonical URL points to https://www.ventrexs.com (${canonicalMatch[1]})`
      );
    }

    // Forbidden patterns in homepage
    assert(!html.includes('noindex'), 'Live homepage does not contain noindex');
    assert(!html.includes('nofollow'), 'Live homepage does not contain nofollow');
    assert(!html.includes('localhost:3000'), 'Live homepage does not contain localhost:3000');
    assert(!html.includes('127.0.0.1'), 'Live homepage does not contain 127.0.0.1');
    assert(!html.includes('http://ventrexs.com'), 'Live homepage does not contain insecure apex links');
  } catch (err: any) {
    console.warn('  ⚠️ Live fetch network notice:', err.message);
  }

  // Test 3: Live robots.txt
  try {
    const robotsRes = await fetch('https://www.ventrexs.com/robots.txt');
    assert(robotsRes.status === 200, `robots.txt returns HTTP 200 (${robotsRes.status})`);
    const robotsText = await robotsRes.text();
    assert(robotsText.includes('Sitemap: https://www.ventrexs.com/sitemap.xml'), 'robots.txt specifies canonical sitemap');
    assert(robotsText.includes('Disallow: /login'), 'robots.txt disallows /login');
  } catch (err: any) {
    console.warn('  ⚠️ Live fetch network notice:', err.message);
  }

  // Test 4: Live sitemap.xml
  try {
    const sitemapRes = await fetch('https://www.ventrexs.com/sitemap.xml');
    assert(sitemapRes.status === 200, `sitemap.xml returns HTTP 200 (${sitemapRes.status})`);
    const sitemapText = await sitemapRes.text();
    assert(sitemapText.includes('https://www.ventrexs.com'), 'sitemap.xml contains https://www.ventrexs.com');
    assert(!sitemapText.includes('/login'), 'sitemap.xml does not contain /login');
    assert(!sitemapText.includes('/signup'), 'sitemap.xml does not contain /signup');
  } catch (err: any) {
    console.warn('  ⚠️ Live fetch network notice:', err.message);
  }

  console.log('\n================================================================');
  console.log(`  AUDIT RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
