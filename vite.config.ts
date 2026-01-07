
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import ssrPlugin from 'vike/plugin';
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
    // vite-plugin-ssr enables Node-based SSG/SSR (no Puppeteer required)
    ssrPlugin({ prerender: true }),
    react(),
    githubPagesSpa({ verbose: true }),
    // (Removed) Previously used a Puppeteer-based prerender plugin here. We now rely on
    // vite-plugin-ssr for Node-based prerendering/SSG which avoids headless Chrome native deps.
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
