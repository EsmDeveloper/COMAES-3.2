/**
 * fixEncoding.js
 * 
 * Fixes double-encoded UTF-8 files.
 * 
 * Root cause: files were originally UTF-8, but at some point the UTF-8 bytes
 * were interpreted as Windows-1252 (cp1252) and then re-saved as UTF-8.
 * This causes emojis and accented chars to appear as garbled sequences like:
 *   ðŸ§ª  instead of  🧪
 *   configuração  instead of  configuração
 * 
 * Fix: reverse the Windows-1252 → Unicode mapping to recover the original bytes.
 * 
 * Usage: node scripts/fixEncoding.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Windows-1252 special range 0x80–0x9F → Unicode codepoints
const WIN1252_MAP = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
  0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019,
  0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153,
  0x9E: 0x017E, 0x9F: 0x0178,
};

// Reverse: Unicode codepoint → original byte
const REVERSE_MAP = {};
for (const [byte, cp] of Object.entries(WIN1252_MAP)) {
  REVERSE_MAP[cp] = parseInt(byte);
}

/**
 * Detects if a string contains double-encoded UTF-8 characters.
 * Heuristic: presence of sequences like ðŸ (U+00F0 + U+0178) which are
 * the double-encoded form of 4-byte emoji sequences starting with 0xF0.
 */
function isDoubleEncoded(str) {
  // ð = U+00F0 followed by Ÿ = U+0178 is a strong indicator
  return str.includes('\u00F0\u0178') ||
         str.includes('\u00C3\u00A7') || // ç double-encoded
         str.includes('\u00C3\u00A3') || // ã double-encoded
         str.includes('\u00C3\u00A9');   // é double-encoded
}

/**
 * Reverses the Windows-1252 → UTF-8 double-encoding.
 * Each character's codepoint is mapped back to the original byte value.
 */
function fixDoubleEncoding(str) {
  const chars = [...str]; // spread handles surrogate pairs
  const bytes = [];

  for (const ch of chars) {
    const cp = ch.codePointAt(0);

    if (cp < 0x80) {
      // ASCII — unchanged
      bytes.push(cp);
    } else if (REVERSE_MAP[cp] !== undefined) {
      // Windows-1252 special range character → original byte
      bytes.push(REVERSE_MAP[cp]);
    } else if (cp <= 0xFF) {
      // Latin-1 supplement — codepoint == byte value
      bytes.push(cp);
    } else {
      // Character outside Latin-1 range — was NOT a single byte originally.
      // This shouldn't happen in a correctly double-encoded file, but handle
      // gracefully by re-encoding as UTF-8.
      const encoded = Buffer.from(ch, 'utf8');
      for (const b of encoded) bytes.push(b);
    }
  }

  return Buffer.from(bytes).toString('utf8');
}

// Files/dirs to skip
const SKIP_DIRS  = new Set(['node_modules', '.git', 'uploads', 'dist', 'build', 'scripts']);
const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.json', '.sql', '.md', '.env']);

function processDir(dir, stats = { fixed: 0, skipped: 0, errors: 0 }) {
  let entries;
  try { entries = readdirSync(dir); } catch { return stats; }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;

    const fullPath = join(dir, entry);
    let stat;
    try { stat = statSync(fullPath); } catch { continue; }

    if (stat.isDirectory()) {
      processDir(fullPath, stats);
      continue;
    }

    if (!EXTENSIONS.has(extname(entry).toLowerCase())) continue;

    try {
      const buf = readFileSync(fullPath);

      // Strip UTF-8 BOM if present
      const hasBOM = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
      const content = hasBOM ? buf.slice(3).toString('utf8') : buf.toString('utf8');

      if (!isDoubleEncoded(content)) {
        stats.skipped++;
        continue;
      }

      const fixed = fixDoubleEncoding(content);

      // Write back WITHOUT BOM, as clean UTF-8
      writeFileSync(fullPath, fixed, 'utf8');
      console.log(`  ✅ Fixed: ${fullPath.replace(ROOT, '.')}`);
      stats.fixed++;
    } catch (err) {
      console.error(`  ❌ Error processing ${fullPath}: ${err.message}`);
      stats.errors++;
    }
  }

  return stats;
}

console.log('\n🔧 Fixing double-encoded UTF-8 files in BackEnd...\n');
const stats = processDir(ROOT);
console.log(`\n✅ Done — Fixed: ${stats.fixed} | Skipped: ${stats.skipped} | Errors: ${stats.errors}\n`);
