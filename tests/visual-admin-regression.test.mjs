import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const apiRoot = process.env.NGO_API_ROOT
  ? pathToFileURL(resolve(process.env.NGO_API_ROOT) + '/')
  : new URL('../../api.ngo.uz/', root);

async function source(path) {
  const apiPrefix = '../../api.ngo.uz/';
  if (path.startsWith(apiPrefix)) return readFile(new URL(path.slice(apiPrefix.length), apiRoot), 'utf8');
  return readFile(new URL(path, root), 'utf8');
}

test('visual-admin owns its unauthenticated state and shared redirects stay root-relative', async () => {
  const admin = await source('js/visual-admin.js');
  const client = await source('js/api-client.js');
  const boot = await source('js/admin-boot.js');
  assert.match(admin, /NgoApi\.me\(\{ noRedirect: true \}\)/);
  assert.match(client, /var LOGIN_PAGE = '\/admin-login'/);
  assert.match(client, /var CABINET_LOGIN_PAGE = '\/cabinet\/cabinet-login'/);
  assert.match(client, /function me\(opts\)/);
  assert.match(client, /request\('GET', '\/me', undefined, opts\)/);
  assert.match(boot, /authOpts\.loginPage = authOpts\.loginPage \|\| '\/admin-login'/);
});

test('database deletes require an explicit confirmation state', async () => {
  const js = await source('js/visual-admin.js');
  assert.doesNotMatch(js, /setTimeout\(onDelete/);
  assert.match(js, /state\.confirmingDelete = !!confirmDelete/);
  assert.match(js, /databaseDeleteConfirmHtml/);
  assert.match(js, /if \(!state\.confirmingDelete\)/);
});

test('dynamic content triggers idempotent control reinjection', async () => {
  const admin = await source('js/visual-admin.js');
  const overrides = await source('js/visual-overrides.js');
  assert.match(admin, /function observeFrameMutations\(doc\)/);
  assert.match(admin, /typeof target\.nodeType !== 'number'/);
  assert.match(admin, /observer\.observe\(target, \{ childList: true, subtree: true \}\)/);
  assert.match(overrides, /function observeMutations\(\)/);
  assert.match(overrides, /observer\.observe\(target, \{ childList: true, subtree: true \}\)/);
  assert.match(overrides, /data-va-block-id', patch\.id/);
});

test('refresh never replaces an existing added node and strips its controls', async () => {
  const overrides = await source('js/visual-overrides.js');
  const addBranch = overrides.slice(overrides.indexOf("if (patch.action === 'add')"), overrides.indexOf("if (!el) return"));
  assert.match(addBranch, /if \(marker\) return/);
  assert.doesNotMatch(addBranch, /replaceChild/);
});

test('optional employee and leader fields cannot crash cleanNodeText', async () => {
  const admin = await source('js/visual-admin.js');
  const helper = admin.slice(admin.indexOf('function cleanNodeText'), admin.indexOf('function deleteConfirmHtml'));
  assert.match(helper, /!node \|\| typeof node\.cloneNode !== 'function'/);
  assert.match(helper, /return String\(node \|\| ''\)\.trim\(\)/);
});

test('observer and uncaught runtime errors carry source labels', async () => {
  const admin = await source('js/visual-admin.js');
  const overrides = await source('js/visual-overrides.js');
  assert.match(admin, /ngo:visual-admin:frame-observer/);
  assert.match(admin, /ngo:' \+ label \+ ':uncaught/);
  assert.match(overrides, /ngo:visual-overrides:observer/);
});

test('generic rows pass content validation and keep a reload-stable target', async () => {
  const admin = await source('js/visual-admin.js');
  const overrides = await source('js/visual-overrides.js');
  const validation = admin.slice(admin.indexOf("state.visualAction !== 'delete'"), admin.indexOf("var visualBtn"));
  assert.match(validation, /data\.col_1/);
  assert.match(overrides, /main \.doc-table/);
  assert.match(overrides, /main table tbody/);
});

test('database add buttons own their click before card controls can intercept it', async () => {
  const admin = await source('js/visual-admin.js');
  const helper = admin.slice(admin.indexOf('function injectAddButtons'), admin.indexOf('function currentDetailType'));
  assert.match(helper, /data-va-add-type/);
  assert.match(helper, /button\.addEventListener\('click'/);
  assert.match(helper, /stopImmediatePropagation/);
  assert.match(helper, /\}, true\)/);
  assert.doesNotMatch(helper, /wrap\.addEventListener\('click'/);
  assert.match(admin, /\.va-live-add\{position:relative;z-index:10001/);
  assert.match(admin, /\.va-live-editable>\.va-live-controls\{right:8px;top:8px\}/);
});

test('API-backed cards never receive duplicate generic block controls', async () => {
  const admin = await source('js/visual-admin.js');
  const helper = admin.slice(admin.indexOf('function injectStructuredItemControls'), admin.indexOf('function attachControls'));
  assert.match(helper, /node\.hasAttribute\('data-va-type'\) \|\| node\.hasAttribute\('data-va-id'\)/);
});

test('added patches keep stable identity through edit and use DELETE for removal', async () => {
  const admin = await source('js/visual-admin.js');
  const overrides = await source('js/visual-overrides.js');
  assert.match(admin, /var addedId = node && node\.getAttribute\('data-va-added-id'\)/);
  assert.match(admin, /patch\.id = addedId/);
  assert.match(admin, /node\.tagName === 'IMG'[\s\S]*?addedId[\s\S]*?patch\.action = 'add'/);
  assert.match(admin, /addedId \? deleteVisualPatch\(addedId\) : saveVisualPatch/);
  for (const action of ['simple_row', 'simple_block', 'top500_row', 'council_row', 'sustainability_row', 'certificate_row']) {
    const branch = admin.slice(admin.lastIndexOf("state.visualAction === 'edit-" + action + "'"));
    assert.match(branch.slice(0, 500), /patch\.action = addedId \? 'add' : 'html'/);
  }
  assert.match(overrides, /data-va-added-target-id/);
  assert.match(overrides, /data-va-added-position/);
});

test('visual-admin grant statuses match the API contract', async () => {
  const admin = await source('js/visual-admin.js');
  const content = await source('js/content.js');
  const api = await source('../../api.ngo.uz/controllers/AdminContentController.php');
  const grantSection = admin.slice(admin.indexOf('grants: {'), admin.indexOf('documents: {'));
  assert.match(grantSection, /\['open', 'Ochiq'\]/);
  assert.match(grantSection, /\['upcoming', 'Kutilmoqda'\]/);
  assert.match(grantSection, /\['closed', 'Yopilgan'\]/);
  assert.doesNotMatch(grantSection, /\['active'/);
  assert.match(api, /array\('open','closed','upcoming', null, ''\)/);
  const renderer = content.slice(content.indexOf('function grantStatus'), content.indexOf('/* ── Documents'));
  assert.match(renderer, /g\.status === 'open' \|\| g\.status === 'upcoming' \|\| g\.status === 'closed'/);
  assert.match(renderer, /status === 'upcoming'/);
  assert.match(renderer, /Kutilmoqda/);
});

test('document edit payload can round-trip body, status and archive state', async () => {
  const admin = await source('js/visual-admin.js');
  const api = await source('../../api.ngo.uz/controllers/AdminContentController.php');
  const documentSection = admin.slice(admin.indexOf('documents: {'), admin.indexOf('publications: {'));
  assert.match(documentSection, /select\('status'/);
  assert.match(documentSection, /checkbox\('is_archive'/);
  const listMethod = api.slice(api.indexOf('public function documentsList'), api.indexOf('public function documentsCreate'));
  for (const field of ['body', 'status', 'is_archive', 'cover_image']) {
    assert.match(listMethod, new RegExp('\\b' + field + '\\b'));
  }
});

test('content delete handlers reject stale or incorrect ids', async () => {
  const api = await source('../../api.ngo.uz/controllers/AdminContentController.php');
  for (const message of ['News not found', 'Event not found', 'Grant not found', 'Document not found']) {
    assert.match(api, new RegExp("if \\(!\\$deleted\\) Response::error\\('not_found', '" + message));
  }
});

test('visual patch DELETE returns 404 and preserves storage when id is absent', async () => {
  const moduleUrl = new URL('../functions/api/visual-content/[[path]].js', import.meta.url);
  const worker = await import(moduleUrl.href + '?case=delete-missing');
  let stored = JSON.stringify([{ id: 'add:kept', action: 'add' }]);
  let writes = 0;
  const env = {
    RL_KV: {
      async get() { return stored; },
      async put(_key, value) { writes += 1; stored = value; }
    }
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ user: { role: 'super_admin', email: 'test@example.invalid' } }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
  try {
    const request = new Request('https://example.test/api/visual-content?page=%2F&id=missing', {
      method: 'DELETE',
      headers: { authorization: 'Bearer test-token' }
    });
    const response = await worker.onRequestDelete({ request, env });
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error, 'not_found');
    assert.equal(writes, 0);
    assert.equal(JSON.parse(stored)[0].id, 'add:kept');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('visual patch DELETE removes exactly the requested add patch', async () => {
  const moduleUrl = new URL('../functions/api/visual-content/[[path]].js', import.meta.url);
  const worker = await import(moduleUrl.href + '?case=delete-success');
  let stored = JSON.stringify([
    { id: 'add:remove-me', action: 'add' },
    { id: 'add:keep-me', action: 'add' }
  ]);
  const env = {
    RL_KV: {
      async get() { return stored; },
      async put(_key, value) { stored = value; }
    }
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ user: { role: 'super_admin' } }), { status: 200 });
  try {
    const request = new Request('https://example.test/api/visual-content?page=%2F&id=add%3Aremove-me', {
      method: 'DELETE',
      headers: { authorization: 'Bearer test-token' }
    });
    const response = await worker.onRequestDelete({ request, env });
    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(stored).map((item) => item.id), ['add:keep-me']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
