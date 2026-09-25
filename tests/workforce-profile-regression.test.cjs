const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('all employee page inline scripts parse, including the edit form', () => {
  for (const file of ['person-profile.html', 'edit-person.html', 'manage-people.html']) {
    for (const match of read(file).matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      assert.doesNotThrow(() => new vm.Script(match[1]), file);
    }
  }
});

test('person profile supplies the shell required to reveal Academy pages', () => {
  const html = read('person-profile.html');
  assert.match(html, /class="shell"><aside class="side"><\/aside><main class="main">/);
  assert.match(html, /Loading profile…<\/div><\/div><\/main><\/div>/);
});

test('shared navigation can load scripts with hyphenated data markers', () => {
  const source = read('portal-navigation.js');
  const match = source.match(/const addScript=([\s\S]*?);\n  const loadArchivedGuard/);
  assert.ok(match);
  const appended = [];
  const document = {
    querySelector: () => null,
    createElement: () => ({dataset: new Proxy({}, {set(_, key) {
      if (/-[a-z]/.test(key)) throw new SyntaxError('Invalid DOMStringMap key');
      return true;
    }}), setAttribute(key, value) { this[key] = value; }}),
    body: {appendChild: script => appended.push(script)}
  };
  const addScript = vm.runInNewContext('(' + match[1] + ')', {document});
  addScript('archived-selector-guard.js', 'rrta-archive-guard');
  assert.equal(appended[0]['data-rrta-archive-guard'], '1');
});
