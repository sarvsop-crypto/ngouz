import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const authenticated = (await readdir(root)).filter((name) => /^admin-.*\.html$/.test(name)
  && !['admin-login.html', 'admin-forgot-password-request.html'].includes(name));

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('every authenticated route consumes the one canonical Al-Beruni admin shell', async () => {
  assert.equal(authenticated.length, 26);
  for (const file of authenticated) {
    const html = await source(file);
    for (const asset of [
      'css/pacta-tokens.css',
      'css/pacta-icons.css',
      'css/pacta-sidebar.css',
      'css/pacta-topbar.css',
      'css/pacta-app.css',
      'css/pacta-foundation.css'
    ]) {
      assert.equal((html.match(new RegExp(asset.replaceAll('.', '\\.'), 'g')) || []).length, 1,
        `${file} must load ${asset} exactly once`);
    }
    assert.match(html, /IBM\+Plex\+Sans/);
    assert.doesNotMatch(html, /Montserrat|unpkg\.com\/@phosphor-icons|pacta-admin-premium|pacta-modal\.css/);
  }
});

test('every local authenticated asset reference resolves to a real file', async () => {
  for (const file of authenticated.concat(['admin-login.html', 'admin-forgot-password-request.html'])) {
    const html = await source(file);
    for (const match of html.matchAll(/(?:href|src)="((?:css|js|img)\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
      await access(new URL(match[1], root));
    }
  }
});

test('obsolete shell layers and forbidden CSS declarations cannot return', async () => {
  for (const file of [
    'pacta-admin-premium.css',
    'pacta-modal.css',
    'pacta-approvals.page.css',
    'pacta-documents.page.css',
    'pacta-help-support.page.css',
    'pacta-settings-account.page.css'
  ]) await assert.rejects(access(new URL(`css/${file}`, root)), `${file} must stay removed`);
  const cssFiles = (await readdir(new URL('css/', root))).filter((name) => /^pacta-.*\.css$/.test(name));
  for (const file of cssFiles) assert.doesNotMatch(await source(`css/${file}`), /!important/, file);
  for (const file of authenticated) assert.doesNotMatch(await source(file), /!important/, file);
  for (const file of ['js/pacta-app.js', 'js/pacta-foundation.js', 'js/admin-navigation.js']) {
    const js = await source(file);
    assert.doesNotMatch(js, /!important|createElement\(['"]style['"]\)/,
      `${file} must not inject a replacement design layer at runtime`);
  }
});

test('changed shared assets use one release cache key on every authenticated page', async () => {
  for (const file of authenticated) {
    const html = await source(file);
    for (const asset of ['js/admin-navigation.js', 'js/pacta-foundation.js', 'js/admin-modal.js']) {
      const pattern = new RegExp(`${asset.replaceAll('.', '\\.')}\\?v=20260825-alberuni`, 'g');
      assert.equal((html.match(pattern) || []).length, 1, `${file} must cache-bust ${asset}`);
    }
    if (html.includes('js/pacta-app.js')) assert.match(html, /js\/pacta-app\.js\?v=20260825-alberuni/);
  }
});

test('one canonical modal manager owns every authenticated dialog', async () => {
  const app = await source('js/pacta-app.js');
  const modal = await source('js/admin-modal.js');
  assert.doesNotMatch(app, /function (?:openModal|closeModal|lockModalFocus|getFocusableElements)\b|var activeModal\b/);
  assert.match(modal, /window\.AdminModal = \{ open: open, close: close, decorate: decorateTriggers \}/);
  assert.match(modal, /closest\('\[data-modal-open\]'\)/);
  assert.match(modal, /closest\('\[data-modal-close\]'\)/);
  assert.match(modal, /adminmodal:opened/);
  assert.match(modal, /adminmodal:closed/);
  for (const file of authenticated) {
    const html = await source(file);
    assert.equal((html.match(/<script[^>]+src="js\/admin-modal\.js/g) || []).length, 1,
      `${file} must load one modal manager`);
    const modalIndex = html.indexOf('js/admin-modal.js');
    const appIndex = html.indexOf('js/pacta-app.js');
    assert.ok(appIndex === -1 || modalIndex < appIndex, `${file} must load modal ownership before shared app interactions`);
    assert.doesNotMatch(html, /function\s+(?:openModal|closeModal)\b/,
      `${file} must not recreate modal ownership`);
    assert.doesNotMatch(html, /classList\.(?:add|remove)\(['"]is-open['"]\)|body\.style\.overflow\s*=/,
      `${file} must not mutate canonical modal state directly`);
  }
});

test('content-management screens share one page component source', async () => {
  for (const file of ['admin-news.html', 'admin-events.html', 'admin-grants.html']) {
    const html = await source(file);
    assert.match(html, /css\/pacta-cms\.page\.css\?v=20260825-alberuni/);
    assert.match(html, /<body class="admin-cms-page">/);
    assert.doesNotMatch(html, /<style[\s>]/, `${file} must not carry a copied CMS component layer`);
  }
});

test('only canonical shared files define the authenticated shell geometry', async () => {
  const pageCss = (await readdir(new URL('css/', root))).filter((name) => /^pacta-.*\.page\.css$/.test(name));
  const forbidden = /^\s*\.(?:layout|main|main__header|main__title|main__btns|main__profile|main__profile-avatar|main__profile-name|main__profile-role|breadcrumbs|cards|card|card__head|card__icon|card__body|card__label|card__value|table-section|table-section__head|table-section__title|table-section__search|table)\s*\{/m;
  for (const file of pageCss) {
    if (file === 'pacta-auth.page.css') continue;
    assert.doesNotMatch(await source(`css/${file}`), forbidden, file);
  }
  const inlineForbidden = /^\s*\.(?:layout|main|sidebar|topbar|main__header|main__btns|table|btn|modal-overlay|modal__input|modal__select|modal__textarea)\s*\{/m;
  for (const file of authenticated) {
    const html = await source(file);
    for (const style of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      assert.doesNotMatch(style[1], inlineForbidden,
        `${file} must not redefine a canonical component inside the page`);
    }
  }
});

test('all admin icon classes resolve to local first-party SVG assets', async () => {
  const iconCss = await source('css/pacta-icons.css');
  const names = new Set();
  for (const file of authenticated.concat(['admin-login.html', 'admin-forgot-password-request.html'])) {
    for (const match of (await source(file)).matchAll(/ph-([a-z0-9-]+)/g)) names.add(match[1]);
  }
  for (const file of (await readdir(new URL('js/', root))).filter((name) => name.endsWith('.js'))) {
    const js = await source(`js/${file}`);
    for (const match of js.matchAll(/ph-([a-z0-9-]+)/g)) names.add(match[1]);
    if (file === 'admin-navigation.js') {
      for (const match of js.matchAll(/item\([^,]+,[^,]+,\s*'([a-z0-9-]+)'/g)) names.add(match[1]);
    }
  }
  for (const name of names) {
    assert.match(iconCss, new RegExp(`\\.ph-${name.replaceAll('-', '\\-')} \\{`), `missing icon rule ${name}`);
    await access(new URL(`img/admin-icons/${name}.svg`, root));
  }
});

test('public pages do not import authenticated admin shell assets', async () => {
  const publicHtml = (await readdir(root)).filter((name) => name.endsWith('.html') && !name.startsWith('admin-'));
  for (const file of publicHtml) {
    const html = await source(file);
    assert.doesNotMatch(html, /pacta-(?:icons|sidebar|topbar|app|foundation)\.css/, file);
  }
});

test('commission and leader workspaces are role-isolated in source and direct access', async () => {
  const nav = await source('js/admin-navigation.js');
  const commission = await source('admin-commission.html');
  const leader = await source('admin-leader-signing.html');
  assert.match(nav, /var COMMISSION = \['commission'\]/);
  assert.match(nav, /var LEADER = \['leader'\]/);
  assert.doesNotMatch(commission, /allowedRoles:\s*\[[^\]]*super_admin/);
  assert.doesNotMatch(leader, /allowedRoles:\s*\[[^\]]*super_admin/);
});

test('commission boot cannot bind removed shell controls before loading its queue', async () => {
  const commission = await source('admin-commission.html');
  assert.doesNotMatch(commission, /commissionRefreshLogo/);
  assert.match(commission, /document\.getElementById\('refreshCommission'\)\.addEventListener/);
  assert.match(commission, /load\(\);/);
});

test('task markup and renderer keep one matching attachment contract', async () => {
  const html = await source('admin-tasks.html');
  const js = await source('js/admin-tasks.js');
  for (const id of ['taskFiles', 'taskSelectedFiles', 'taskDiscussionFiles', 'taskDiscussionSelectedFiles']) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id} must exist exactly once`);
    assert.match(js, new RegExp(`['"]${id}['"]`), `${id} must be consumed by the renderer`);
  }
  assert.match(js, /NgoApi\.upload\('\/admin\/collaboration\/upload'/);
  assert.match(js, /client_task_id/);
  assert.match(js, /client_message_id/);
  assert.match(js, /attachment_paths/);
  assert.doesNotMatch(js, /NgoApi\.randomId/);
  assert.doesNotMatch(js, /\/admin\/tasks\/labels/);
  for (const obsoleteId of ['taskAssignees', 'taskWatchers', 'taskLabels', 'taskPriority', 'taskProgress']) {
    assert.doesNotMatch(html, new RegExp(`id="${obsoleteId}"`), `${obsoleteId} must not return`);
    assert.doesNotMatch(js, new RegExp(`['"]${obsoleteId}['"]`), `${obsoleteId} must not be queried`);
  }
});
