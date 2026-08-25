import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('every authenticated admin page uses exactly one canonical navigation mount', async () => {
  const files = (await readdir(root)).filter((name) => /^admin-.*\.html$/.test(name)
    && !['admin-login.html', 'admin-forgot-password-request.html'].includes(name));
  assert.equal(files.length, 24);
  for (const file of files) {
    const html = await source(file);
    assert.equal((html.match(/data-admin-navigation/g) || []).length, 1, file + ' must have one mount');
    assert.doesNotMatch(html, /sidebar__nav-link/, file + ' contains a stale copied navigation link');
    const navigation = html.indexOf('js/admin-navigation.js');
    const boot = html.indexOf('js/admin-boot.js');
    assert.ok(navigation >= 0 && navigation < boot, file + ' must load canonical navigation before auth boot');
  }
});

test('retired grant-application and generic-document admin surfaces cannot return', async () => {
  const code = await source('js/admin-navigation.js');
  assert.doesNotMatch(code, /admin-grant-applications|admin-documents|grantApplications/);
  const files = await readdir(root);
  assert.ok(!files.includes('admin-grant-applications.html'));
  assert.ok(!files.includes('admin-documents.html'));
});

test('one role matrix protects menu visibility and direct page access', async () => {
  const code = await source('js/admin-navigation.js');
  const context = { window: {}, location: { pathname: '/admin-dashboard' }, console };
  vm.runInNewContext(code, context);
  const navigation = context.window.NgoAdminNavigation;
  assert.ok(navigation);
  assert.deepEqual(Array.from(navigation.allowedRoles('admin-users')), ['super_admin']);
  assert.deepEqual(Array.from(navigation.allowedRoles('admin-settings-system')), ['super_admin']);
  assert.deepEqual(Array.from(navigation.allowedRoles('admin-messages')), ['super_admin', 'regional_admin']);
  for (const page of ['admin-service-requests', 'admin-corruption-reports', 'admin-feedback']) {
    assert.deepEqual(Array.from(navigation.allowedRoles(page)), ['super_admin'], page + ' must match the production inbox API role contract');
  }
  assert.deepEqual(Array.from(navigation.allowedRoles('admin-commission')), ['commission']);
  assert.deepEqual(Array.from(navigation.allowedRoles('admin-leader-signing')), ['leader']);
  for (const file of (await readdir(root)).filter((name) => /^admin-.*\.html$/.test(name)
    && !['admin-login.html', 'admin-forgot-password-request.html'].includes(name))) {
    assert.ok(navigation.pageRoles[file.replace(/\.html$/, '')], file + ' is missing from the page permission matrix');
  }

  const discoverableRoutes = new Set(navigation.definition.flatMap((section) => Array.from(section.items)
    .flatMap((item) => [item.route, ...Array.from(item.aliases)])));
  for (const page of Object.keys(navigation.pageRoles)) {
    assert.ok(discoverableRoutes.has(page), page + ' is an orphaned direct-only admin route');
  }

  const items = navigation.definition.flatMap((section) => Array.from(section.items));
  const regionalRoutes = items.filter((item) => Array.from(item.roles).includes('regional_admin')).map((item) => item.route);
  for (const forbidden of ['admin-users', 'admin-password-reset-requests', 'admin-service-requests', 'admin-corruption-reports', 'admin-feedback', 'admin-commission', 'admin-leader-signing']) {
    assert.ok(!regionalRoutes.includes(forbidden), forbidden + ' leaked into regional navigation');
  }
});

test('dashboard never calls the superadmin contact inbox for a regional user', async () => {
  const html = await source('admin-dashboard.html');
  assert.match(html, /NgoAdminReady\.then\(function \(user\) \{/);
  assert.match(html, /if \(user\.role !== 'super_admin'\)/);
  assert.match(html, /return NgoApi\.get\('\/admin\/contact-messages\?limit=200&status=new'\)/);
  assert.match(html, /Bu bo\\'lim faqat bosh admin uchun/);
});

test('messaging UX opens people, separates groups, and removes generic thread creation', async () => {
  const html = await source('admin-messages.html');
  const js = await source('js/admin-messages.js');
  const appCss = await source('css/pacta-app.css');
  const collaborationCss = await source('css/pacta-collaboration.page.css');
  assert.match(html, /<body class="admin-messages-page">/);
  assert.match(html, /id="peoplePickerBtn"[^>]*>[\s\S]*?Odam topish/);
  assert.match(html, /id="groupCreateBtn"/);
  assert.match(html, /id="peopleSearch"/);
  assert.doesNotMatch(html, /Yangi suhbat|data-modal-open="threadEditor"|id="threadType"/);
  assert.doesNotMatch(html, /js\/pacta-app\.js/);
  assert.match(js, /function existingDirect\(userId\)/);
  assert.match(js, /created: false/);
  assert.match(js, /type: 'direct', recipient_user_id:/);
  assert.match(js, /Mavjud suhbat/);
  assert.match(js, /if \(state\.users\.length\) renderPeople\(\)/);
  assert.match(js, /var usersReady = NgoApi\.get\('\/admin\/messages\/users'\)\.then/);
  assert.match(js, /NgoAdminReady\.then\(init\)/);
  assert.match(html, /js\/admin-messages\.js\?v=20260825-alberuni/);
  assert.match(js, /function fileKind\(name\)/);
  for (const kind of ['pdf', 'document', 'spreadsheet', 'image', 'video', 'audio', 'file']) {
    assert.match(collaborationCss, new RegExp(`attachment--${kind}`));
  }
  for (const icon of ['file-pdf', 'file-doc', 'file-xls', 'image-square', 'video-camera', 'speaker-high']) {
    assert.match(js, new RegExp(icon));
  }
  assert.doesNotMatch(js, /setTimeout\(function \(\) \{ wait/);
  assert.match(appCss, /\.btn\[hidden\]\s*\{\s*display:\s*none;\s*\}/);
  assert.match(collaborationCss, /\.admin-messages-page \.main\s*\{[^}]*overflow:\s*hidden/);
  assert.match(collaborationCss, /\.messages-layout\s*\{[^}]*min-height:\s*0;[^}]*flex:\s*1/);
  assert.match(collaborationCss, /\.message-log\s*\{[^}]*min-height:\s*0;[^}]*overflow:\s*auto/);
  assert.doesNotMatch(collaborationCss, /height:\s*calc\(100svh/);
});

test('mobile drawer has focus trapping, inert background, and focus restoration', async () => {
  const foundation = await source('js/pacta-foundation.js');
  assert.match(foundation, /main\.setAttribute\('inert', ''\)/);
  assert.match(foundation, /event\.key === 'Tab'/);
  assert.match(foundation, /mobileSidebarRestoreFocus\.focus\(\)/);
  assert.match(foundation, /NgoAdminNavigationReady/);
  assert.match(foundation, /closest\('\.mobile-nav-toggle'\)/);
  assert.match(foundation, /function mobileSidebarParts\(\)/);
  assert.match(foundation, /var sidebarCollapseInitialized = false/);
  assert.match(foundation, /if \(sidebarCollapseInitialized\) return/);
  assert.doesNotMatch(foundation, /mobileSidebarWired/);
});
