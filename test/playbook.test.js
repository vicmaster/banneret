import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCanonical } from '../src/compile.js';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const WORD_CAP = 1950; // a rule that adds words merges or cuts something (playbook/evidence.md)

const read = (path) => readFile(join(ROOT, path), 'utf8');

test('pipeline.md stays under its word cap', async () => {
  const { body } = parseCanonical(await read('playbook/pipeline.md'), 'pipeline.md');
  const words = body.split(/\s+/).filter(Boolean).length;
  assert.ok(words <= WORD_CAP, `pipeline.md has ${words} words, cap is ${WORD_CAP}`);
});

test('every evidence entry is a rule anchored in its file, or marked watching', async () => {
  const evidence = await read('playbook/evidence.md');
  const entries = evidence.split(/^### /m).slice(1);
  assert.ok(entries.length > 0);

  for (const entry of entries) {
    const title = entry.split('\n')[0];
    if (/^Status: watching$/m.test(entry)) continue;

    const rule = entry.match(/^Rule: `(.+?)` · "(.+)"$/m);
    assert.ok(rule, `"${title}" needs a Rule line or Status: watching`);

    const [, file, anchor] = rule;
    assert.ok((await read(file)).includes(anchor), `"${title}": anchor not found in ${file}: ${anchor}`);
  }
});
