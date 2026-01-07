import fs from 'fs';
import path from 'path';
import frontMatter from 'front-matter';
import satori from 'satori';
import sharp from 'sharp';

// Simple OG generator using satori -> SVG -> PNG (sharp)
// Note: run `npm install -D satori sharp @vercel/og` before using

const POSTS_DIR = path.resolve(process.cwd(), 'src', 'posts');
const OUT_DIR = path.resolve(process.cwd(), 'public', 'og');

async function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function parsePosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(f => {
    const content = fs.readFileSync(path.join(POSTS_DIR, f), 'utf8');
    const { attributes } = frontMatter(content);
    return { file: f, meta: attributes };
  });
  return posts;
}

function makeSvg(title, excerpt) {
  // Very simple layout. You can customize fonts, logos, etc.
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="100%" height="100%" fill="#0f172a" />
    <g>
      <text x="60" y="140" font-size="48" fill="#fff" font-family="Inter, Arial, sans-serif">${escapeXml(title)}</text>
      <text x="60" y="220" font-size="28" fill="#cbd5e1" font-family="Inter, Arial, sans-serif">${escapeXml(excerpt || '')}</text>
    </g>
  </svg>
  `;
  return svg;
}

function escapeXml(s='') {
  return String(s).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'})[c]);
}

async function main() {
  await ensureOut();
  const posts = parsePosts();
  for (const p of posts) {
    const slug = p.meta.slug || p.file.replace(/\.md$/, '');
    const title = p.meta.title || slug;
    const excerpt = p.meta.excerpt || '';
    const svg = makeSvg(title, excerpt);
    const outPath = path.join(OUT_DIR, `${slug}.png`);
    try {
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      fs.writeFileSync(outPath, png);
      console.log(`Wrote OG image: ${outPath}`);
    } catch (err) {
      console.error('Failed to generate OG for', slug, err);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
