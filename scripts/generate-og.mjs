#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import satori from 'satori';
import sharp from 'sharp';
import { jsx as _jsx } from 'react/jsx-runtime';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src', 'posts');
const OUT_DIR = path.join(ROOT, 'public', 'og');

async function ensureOutDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function listPostFiles() {
  const files = await fs.readdir(POSTS_DIR);
  return files.filter(f => f.endsWith('.md') && !f.includes('draft'));
}

/**
 * Clean, flat structure:
 * - Any element that has >1 direct child gets an explicit display.
 * - Children that are in arrays are given keys (third arg to _jsx).
 */
function createImageElement({ title, excerpt }) {
  return _jsx(
    'div',
    {
      style: {
        display: 'flex',                       // explicit: top-level has one child but keep it explicit
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg,#0ea5a0,#7c3aed)',
        color: 'white',
        padding: '64px',
        boxSizing: 'border-box',
        fontFamily:
          'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      },
      children: _jsx(
        'div',
        {
          style: {
            display: 'flex',                   // explicit because this div has multiple children
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
          },
          children: [
            _jsx(
              'div',
              {
                style: { fontSize: 20, opacity: 0.95, fontWeight: 600, marginBottom: 12 },
                children: 'ebadf.me',
              },
              'meta' // key
            ),

            _jsx(
              'div',
              {
                style: { fontSize: 56, lineHeight: 1.05, fontWeight: 800, marginBottom: 18 },
                children: title,
              },
              'title' // key
            ),

            _jsx(
              'div',
              {
                style: { fontSize: 24, opacity: 0.95 },
                children: excerpt,
              },
              'excerpt' // key
            ),
          ],
        },
        undefined
      ),
    },
    undefined
  );
}

async function generateForPost(file) {
  const absolute = path.join(POSTS_DIR, file);
  const raw = await fs.readFile(absolute, 'utf8');
  const { data } = matter(raw);
  const title = data.title || file.replace(/\.md$/, '');
  const excerpt = data.excerpt || data.description || '';

  const element = createImageElement({ title, excerpt });

  // ensure font is loaded (try to get both 400 and 700 weights)
  // NOTE: it's more robust to vendor a local .woff2 file in the repo and load it here.
  let fontBuffers = [];
  try {
    const googleCss = await fetch(
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap'
    ).then(r => r.text());

    // googleCss contains multiple url(...) occurrences; pick all unique font files
    const matches = Array.from(googleCss.matchAll(/url\((https:[^)]+)\)/g)).map(m => m[1]);
    for (const fontUrl of matches) {
      try {
        const r = await fetch(fontUrl);
        if (!r.ok) continue;
        const ab = await r.arrayBuffer();
        fontBuffers.push(Buffer.from(ab));
      } catch (e) {
        console.warn('Failed to fetch font file', fontUrl, e);
      }
    }
  } catch (e) {
    console.warn('Failed to fetch Google CSS or fonts', e);
  }

  // if you only have one buffer, register it as weight 400; prefer bundling fonts in repo.
  const fonts =
    fontBuffers.length > 0
      ? fontBuffers.map((buf, i) => {
          // attempt to map weights heuristically: 0->400, 1->700, 2->800, else 400
          const weight = i === 0 ? 400 : i === 1 ? 700 : i === 2 ? 800 : 400;
          return { name: 'Inter', data: buf, weight, style: 'normal' };
        })
      : [];

  if (fonts.length === 0) {
    console.warn(
      'No fonts loaded from Google. Satori needs at least one font; consider vendoring Inter .woff2 into your repo and loading it synchronously.'
    );
  }

  // render SVG using satori
  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts,
  });

  // convert to PNG via sharp
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  const slug = (data.slug || file.replace(/\.md$/, '')).trim();
  const outPath = path.join(OUT_DIR, `${slug}.png`);
  await fs.writeFile(outPath, pngBuffer);
  console.log(`Generated OG: ${outPath}`);
}

async function main() {
  await ensureOutDir();
  const posts = await listPostFiles();
  if (posts.length === 0) {
    console.log('No posts found to generate OG images for.');
    return;
  }
  for (const file of posts) {
    try {
      await generateForPost(file);
    } catch (err) {
      console.error(`Failed to generate OG for ${file}:`, err);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
