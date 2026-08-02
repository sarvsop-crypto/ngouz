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
  assert.equal(files.length, 26);
  for (const file of files) {
    const html = await source(file);
    assert.equal((html.match(/data-admin-navigation/g) || []).length, 1, file + ' must have one mount');
    assert.doesNotMatch(html, /sidebar__nav-link/, file + ' contains a stale copied navigation link');
    const navigation = html.indexOf('js/admin-navigation.js');
    const boot = html.indexOf('js/admin-boot.js');
    assert.ok(navigation >= 0 && navigation < boot, file + ' must load canonical navigation before auth boot');
  }
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
  assert.deepEqual(Array.from(navigation.allowedRoles('admin-commission')), ['super_admin', 'commission']);
  assert.deepEqual(Array.from(navigation.allowedRoles('admin-leader-signing')), ['super_admin', 'leader']);
  for (const file of (await readdir(root)).filter((name) => /^admin-.*\.html$/.test(name)
    && !['admin-login.html', 'admin-forgot-password-request.html'].includes(name))) {
    assert.ok(navigation.pageRoles[file.replace(/\.html$/, '')], file + ' is missing from the page permission matrix');
  }

  const items = navigation.definition.flatMap((section) => Array.from(section.items));
  const regionalRoutes = items.filter((item) => Array.from(item.roles).includes('regional_admin')).map((item) => item.route);
  for (const forbidden of ['admin-users', 'admin-password-reset-requests', 'admin-commission', 'admin-leader-signing']) {
    assert.ok(!regionalRoutes.includes(forbidden), forbidden + ' leaked into regional navigation');
  }
});

test('messaging UX opens people, separates groups, and removes generic thread creation', async () => {
  const html = await source('admin-messages.html');
  const js = await source('js/admin-messages.js');
  const appCss = await source('css/pacta-app.css');
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
  assert.doesNotMatch(js, /setTimeout\(function \(\) \{ wait/);
  assert.match(appCss, /\.btn\[hidden\]\s*\{\s*display:\s*none;\s*\}/);
});

test('mobile drawer has focus trapping, inert background, and focus restoration', async () => {
  const foundation = await source('js/pacta-foundation.js');
  assert.match(foundation, /main\.setAttribute\('inert', ''\)/);
  assert.match(foundation, /event\.key === 'Tab'/);
  assert.match(foundation, /mobileSidebarRestoreFocus\.focus\(\)/);
  assert.match(foundation, /NgoAdminNavigationReady/);
  assert.match(foundation, /closest\('\.mobile-nav-toggle'\)/);
  assert.match(foundation, /function mobileSidebarParts\(\)/);
  assert.doesNotMatch(foundation, /mobileSidebarWired/);
});
