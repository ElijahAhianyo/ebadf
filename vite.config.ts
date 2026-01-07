
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { githubPagesSpa } from "@sctg/vite-plugin-github-pages-spa";
import fs from 'fs';
import frontMatter from 'front-matter';
import { createRequire } from 'module';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  base: '/', 
  plugins: [
    react(),
    githubPagesSpa({ verbose: true }),
    // prerender plugin: only enabled in production builds; load via createRequire to avoid importing CommonJS in ESM dev mode
    mode !== 'development' && (() => {
      try {
        const require = createRequire(import.meta.url);
        const prerender = require('vite-plugin-prerender');

        return prerender({
          // required by the underlying prerenderer: point to the generated output directory
          staticDir: path.resolve(__dirname, 'dist'),
          routes: (() => {
            try {
              const postsDir = path.resolve(__dirname, 'src', 'posts');
              const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
              return files.map(f => {
                const content = fs.readFileSync(path.join(postsDir, f), 'utf8');
                const { attributes } = frontMatter(content) as any;
                const slug = (attributes && attributes.slug) ? attributes.slug : f.replace(/\.md$/, '');
                return `/blog/${slug}`;
              });
            } catch (e) { return []; }
          })(),
          postProcessHtml: ({ route, html }: { route: string; html: string }) => {
            try {
              const slug = route.replace(/^\//, '').replace(/^blog\//, '');
              const postsDir = path.resolve(__dirname, 'src', 'posts');
              const file = fs.readdirSync(postsDir).find((f: string) => f.includes(slug));
              if (!file) return html;
              const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
              const { attributes } = frontMatter(content) as any;
              const title = attributes?.title || '';
              const desc = attributes?.excerpt || '';
              const image = attributes?.image ? attributes.image : `/og/${attributes?.slug || slug}.png`;
              const metas = [`<meta property="og:title" content="${title}" />`,
                             `<meta property="og:description" content="${desc}" />`,
                             `<meta property="og:type" content="article" />`,
                             `<meta property="og:image" content="${image}" />`,
                             `<meta name="twitter:card" content="summary_large_image" />`].join('\n');
              return html.replace(/<head>([\s\S]*?)</, (m: any) => `<head>\n${metas}\n<`);
            } catch (e) {
              return html;
            }
          }
        });
      } catch (err: any) {
        // if require/import fails, fail gracefully and skip prerendering
        console.warn('vite-plugin-prerender not available:', err && err.message ? err.message : err);
        return null;
      }
    })(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
