import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const APP_TEXT_SRC = join(ROOT, 'components/ui/AppText.tsx');

function getAllTsx(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory() && entry !== 'node_modules') {
      results.push(...getAllTsx(full));
    } else if (entry.endsWith('.tsx') && full !== APP_TEXT_SRC) {
      results.push(full);
    }
  }
  return results;
}

function relativeAppTextImport(filePath) {
  const fileDir = dirname(filePath);
  const appTextPath = join(ROOT, 'components/ui/AppText');
  let rel = relative(fileDir, appTextPath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

const files = [
  ...getAllTsx(join(ROOT, 'app')),
  ...getAllTsx(join(ROOT, 'components')),
];

let changed = 0;

for (const file of files) {
  let src = readFileSync(file, 'utf8');
  const original = src;

  // Skip if no Text usage at all
  if (!/<Text[\s>]/.test(src) && !/<\/Text>/.test(src)) continue;

  // 1. Remove Text from react-native imports
  // Handle: import { ..., Text, ... } from 'react-native'
  src = src.replace(
    /^(import\s*\{)([^}]*)\}\s*from\s*['"]react-native['"]/gm,
    (match, prefix, imports) => {
      const parts = imports.split(',').map(s => s.trim()).filter(Boolean);
      const filtered = parts.filter(p => p !== 'Text');
      if (filtered.length === parts.length) return match; // Text wasn't there
      if (filtered.length === 0) return `// react-native import removed (Text only)`;
      return `${prefix} ${filtered.join(', ')} } from 'react-native'`;
    }
  );

  // Remove any leftover empty react-native comment lines
  src = src.replace(/^\/\/ react-native import removed \(Text only\)\n/gm, '');

  // 2. Add AppText import if not already present
  if (!src.includes("from '@/components/ui/AppText'") &&
      !src.includes("from '../../components/ui/AppText'") &&
      !src.includes('/components/ui/AppText')) {
    const importPath = relativeAppTextImport(file);
    const appTextImport = `import { AppText } from '${importPath}';\n`;
    // Insert after the last import line
    const lastImportIdx = [...src.matchAll(/^import\s+.+from\s+['"].+['"]\s*;?\s*$/gm)].pop();
    if (lastImportIdx) {
      const insertAt = lastImportIdx.index + lastImportIdx[0].length;
      src = src.slice(0, insertAt) + '\n' + appTextImport + src.slice(insertAt);
    } else {
      src = appTextImport + src;
    }
  }

  // 3. Replace <Text with <AppText and </Text> with </AppText>
  // But NOT things like <TextInput, <TextView, etc.
  src = src.replace(/<Text(\s|>)/g, '<AppText$1');
  src = src.replace(/<\/Text>/g, '</AppText>');

  if (src !== original) {
    writeFileSync(file, src, 'utf8');
    console.log('Updated:', relative(ROOT, file));
    changed++;
  }
}

console.log(`\nDone. Updated ${changed} files.`);
