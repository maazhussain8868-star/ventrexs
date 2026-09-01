/**
 * VENTREXS AI — LIVE PRODUCTION SMOKE TEST
 * Executes live HTTP requests against https://www.ventrexs.com
 */

const BASE_URL = 'https://www.ventrexs.com';

async function fetchUrl(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'Ventrexs-Production-Smoke-Agent/1.0',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text, url: res.url };
}

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

async function runLiveSmokeTests() {
  console.log('================================================================');
  console.log(`  VENTREXS AI — LIVE PRODUCTION SMOKE TEST: ${BASE_URL}`);
  console.log('================================================================\n');

  // 1. Live Root Reachability & Security Headers
  console.log('--- 1. Live Root Reachability & Security Headers ---');
  const root = await fetchUrl('/');
  assert(root.status === 200, 'Root URL returns HTTP 200 OK');
  
  const csp = root.headers.get('content-security-policy') || '';
  assert(csp.includes('googleadservices.com'), 'CSP permits Google Ads (googleadservices.com)');
  assert(csp.includes('checkout.razorpay.com'), 'CSP permits Razorpay checkout');
  assert(csp.includes('api.razorpay.com'), 'CSP permits Razorpay API connect-src');
  assert(csp.includes('googletagmanager.com'), 'CSP permits Google Tag Manager');
  assert(root.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is DENY');
  assert(Boolean(root.headers.get('strict-transport-security')), 'HSTS header is active');

  // 2. Canonical Tag & Schema.org on Homepage
  console.log('\n--- 2. Canonical & Schema.org ---');
  assert(root.body.includes('https://www.ventrexs.com'), 'Homepage references https://www.ventrexs.com');
  assert(root.body.includes('canonical'), 'Canonical link tag present');
  assert(root.body.includes('SoftwareApplication') || root.body.includes('AggregateOffer'), 'Schema.org JSON-LD configured');

  // 3. Live robots.txt Verification
  console.log('\n--- 3. Live robots.txt ---');
  const robots = await fetchUrl('/robots.txt');
  assert(robots.status === 200, 'robots.txt returns HTTP 200 OK');
  assert(robots.body.includes('Disallow: /login'), 'robots.txt disallows /login');
  assert(robots.body.includes('Disallow: /signup'), 'robots.txt disallows /signup');
  assert(robots.body.includes('Disallow: /dashboard'), 'robots.txt disallows /dashboard');
  assert(robots.body.includes('Disallow: /billing'), 'robots.txt disallows /billing');
  assert(robots.body.includes('Disallow: /admin'), 'robots.txt disallows /admin');
  assert(robots.body.includes('Disallow: /agency'), 'robots.txt disallows /agency');
  assert(robots.body.includes('Disallow: /api'), 'robots.txt disallows /api');
  assert(robots.body.includes('Sitemap: https://www.ventrexs.com/sitemap.xml'), 'robots.txt links to canonical sitemap.xml');

  // 4. Live sitemap.xml Verification
  console.log('\n--- 4. Live sitemap.xml ---');
  const sitemap = await fetchUrl('/sitemap.xml');
  assert(sitemap.status === 200, 'sitemap.xml returns HTTP 200 OK');
  assert(sitemap.body.includes('<loc>https://www.ventrexs.com</loc>'), 'sitemap.xml lists root url');
  assert(sitemap.body.includes('<loc>https://www.ventrexs.com/pricing</loc>'), 'sitemap.xml lists /pricing');
  assert(sitemap.body.includes('<loc>https://www.ventrexs.com/features</loc>'), 'sitemap.xml lists /features');
  assert(!sitemap.body.includes('<loc>https://www.ventrexs.com/login</loc>'), 'sitemap.xml excludes private /login');
  assert(!sitemap.body.includes('<loc>https://www.ventrexs.com/signup</loc>'), 'sitemap.xml excludes private /signup');

  // 5. Private Route Noindex Meta Tags Live
  console.log('\n--- 5. Private Route Noindex Meta Tags ---');
  const login = await fetchUrl('/login');
  assert(login.status === 200, '/login returns HTTP 200 OK');
  assert(login.body.includes('noindex, nofollow'), '/login contains noindex, nofollow metadata');

  const signup = await fetchUrl('/signup');
  assert(signup.status === 200, '/signup returns HTTP 200 OK');

  const forgotPassword = await fetchUrl('/forgot-password');
  assert(forgotPassword.status === 200, '/forgot-password returns HTTP 200 OK');

  const resetPassword = await fetchUrl('/reset-password');
  assert(resetPassword.status === 200, '/reset-password returns HTTP 200 OK');

  // 6. Public Marketing Routes
  console.log('\n--- 6. Public Marketing Routes ---');
  const pricing = await fetchUrl('/pricing');
  assert(pricing.status === 200, '/pricing returns HTTP 200 OK');
  assert(pricing.body.includes('Starter') || pricing.body.includes('Professional'), '/pricing renders plan options');

  const features = await fetchUrl('/features');
  assert(features.status === 200, '/features returns HTTP 200 OK');

  const about = await fetchUrl('/about');
  assert(about.status === 200, '/about returns HTTP 200 OK');

  const contact = await fetchUrl('/contact');
  assert(contact.status === 200, '/contact returns HTTP 200 OK');

  const demo = await fetchUrl('/demo');
  assert(demo.status === 200, '/demo returns HTTP 200 OK');

  // 7. Auth Callback Route (Must never redirect to localhost)
  console.log('\n--- 7. Auth Callback Route ---');
  const callback = await fetchUrl('/auth/callback?code=fake_test_token', { redirect: 'manual' });
  const locationHeader = callback.headers.get('location') || '';
  assert(!locationHeader.includes('localhost'), 'Callback location never redirects to localhost');
  assert(!locationHeader.includes('127.0.0.1'), 'Callback location never redirects to 127.0.0.1');

  // 8. Summary
  console.log('\n================================================================');
  console.log(`  LIVE PRODUCTION SMOKE TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveSmokeTests().catch((err) => {
  console.error('Fatal live smoke test error:', err);
  process.exit(1);
});
