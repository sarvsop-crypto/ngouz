import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFile(join(root, path), 'utf8');

test('all staff-facing pages consume the canonical staff directory', async () => {
  const pages = ['our-team.html', 'hududiy-bolinmalar.html', 'vacancies.html', 'leadership.html', 'structure.html'];
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /js\/staff-directory\.js\?v=20260803stafflifecycle/);
  }
  assert.doesNotMatch(await read('our-team.html'), /const teamData/);
  assert.doesNotMatch(await read('hududiy-bolinmalar.html'), /const teamData/);
  assert.doesNotMatch(await read('vacancies.html'), /Navoiy viloyati hududiy bo'linmasi faoliyatini/);
  assert.doesNotMatch(await read('leadership.html'), /Ishanxodjayev Kamoliddin Nuritdinovich/);
  assert.doesNotMatch(await read('structure.html'), /class="struct-stat__num">44</);
});

test('directory derives vacancy cards, filters, counters and stable identities from API state', async () => {
  const source = await read('js/staff-directory.js');
  assert.match(source, /\/v1\/public\/staff-positions/);
  assert.match(source, /item\.is_vacant \? ' vacancy'/);
  assert.match(source, /data-staff-position-id/);
  assert.match(source, /id="position-/);
  assert.match(source, /mode === 'vacancies'.*item\.is_vacant/s);
  assert.match(source, /regional_occupied/);
  assert.match(source, /clientRequest|staff_directory_http_|fetch\(API/);
});

test('visual admin uses canonical atomic staff actions instead of positional HTML patches', async () => {
  const source = await read('js/visual-admin.js');
  assert.match(source, /data-staff-action="fill"/);
  assert.match(source, /data-staff-action="vacate"/);
  assert.match(source, /\/admin\/staff\/positions\/.*\/fill/);
  assert.match(source, /\/admin\/staff\/positions\/.*\/vacate/);
  assert.match(source, /client_request_id = state\.staffRequestId/);
  assert.match(source, /expected_version = item\.version/);
  assert.match(source, /data-staff-preview/);
  assert.match(source, /\/history/);
  assert.match(source, /target\.hasAttribute\('data-staff-directory'\)/);
});
