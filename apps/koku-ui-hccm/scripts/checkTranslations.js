#!/usr/bin/env node
// checkTranslations.js — fail when a select/plural branch present in
// src/locales/messages.ts is missing from the compiled locales/data.json.
//
// Background (ros-ocp-backend#652): runtime resolves messages from data.json,
// not messages.ts. A wholly-missing message ID safely falls back to
// defaultMessage — but a missing BRANCH inside a compiled select/plural
// silently renders the `other` fallback (blank for the #637 hosted-cluster
// header). Unused/extra catalog keys are tolerated: only absent branches fail.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const dir = __dirname;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-translations-'));
try {
  execFileSync(
    'npx',
    ['formatjs', 'extract', 'src/locales/*.ts', '--out-file', path.join(tmp, 'messages.json')],
    { cwd: path.join(dir, '..'), stdio: 'pipe' }
  );
  const extracted = JSON.parse(fs.readFileSync(path.join(tmp, 'messages.json'), 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(path.join(dir, '..', 'locales', 'data.json'), 'utf8'));
  const entries = catalog.en || catalog;

  const failures = [];
  for (const [id, msg] of Object.entries(extracted)) {
    const source = msg.defaultMessage || msg.message || '';
    const branches = branchKeys(source);
    if (branches === null) {
      continue; // plain message: defaultMessage fallback covers absence
    }
    const compiled = entries[id];
    if (!compiled) {
      continue; // wholly-missing messages fall back safely; not this gate's concern
    }
    const compiledBranches = compiledBranchKeys(compiled);
    for (const b of branches) {
      if (!compiledBranches.has(b)) {
        failures.push(`${id}: branch '${b}' missing from locales/data.json`);
      }
    }
  }
  if (failures.length > 0) {
    console.error('Stale compiled translations in locales/data.json:');
    failures.forEach(f => console.error(`  ${f}`));
    console.error('Run `npm run translations` in this workspace and commit the result.');
    process.exit(1);
  }
  console.log('OK: all select/plural branches covered by locales/data.json');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// branchKeys returns the set of select/plural branch names in an ICU
// message, or null when the message has no branch construct. Only
// top-level option names are collected (nested braces are skipped).
function branchKeys(message) {
  const m = message.match(/\{\s*\w+\s*,\s*(select|plural|selectordinal)\s*,/);
  if (!m) {
    return null;
  }
  const keys = new Set();
  let pos = m.index + m[0].length;
  let depth = 0;
  const nameRe = /[A-Za-z0-9_=]+/y;
  while (pos < message.length) {
    const ch = message[pos];
    if (ch === '{') {
      depth += 1;
      pos += 1;
      continue;
    }
    if (ch === '}') {
      depth -= 1;
      pos += 1;
      if (depth < 0) {
        break; // end of the select/plural construct
      }
      continue;
    }
    if (depth === 0 && /[A-Za-z0-9_=]/.test(ch)) {
      nameRe.lastIndex = pos;
      const nm = nameRe.exec(message);
      if (nm) {
        keys.add(nm[0]);
        pos += nm[0].length;
        continue;
      }
    }
    pos += 1;
  }
  return keys;
}

// compiledBranchKeys reads branch names from a formatjs-compiled AST node.
function compiledBranchKeys(node) {
  const out = new Set();
  const visit = n => {
    if (Array.isArray(n)) {
      n.forEach(visit);
    } else if (n && typeof n === 'object') {
      if (n.options && typeof n.options === 'object') {
        Object.keys(n.options).forEach(k => out.add(k));
      }
      Object.values(n).forEach(visit);
    }
  };
  visit(node);
  return out;
}
