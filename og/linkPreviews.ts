import fs from "node:fs";
import path from "node:path";
import frontMatter from "front-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { Plugin } from "vite";

/*
 * Link previews for apps like WhatsApp, Telegram, Slack and X.
 *
 * Those apps read <meta> tags from the raw HTML and never run our JavaScript,
 * so the SPA's index.html alone would give every link the same bland preview.
 * After the build, this plugin writes one HTML file per post (for example
 * dist/blog/<slug>.html, which GitHub Pages serves at /blog/<slug>) with that
 * post's title, excerpt and a generated 1200x630 image. Each file is a copy of
 * index.html, so the app still boots normally for readers.
 */

const SITE_URL = "https://ebadf.me";
const SITE_NAME = "EBADF";
const AUTHOR = "Elijah Ahianyo";
const SITE_DESCRIPTION =
  "Elijah Ahianyo's corner of the internet. Writing about Rust, systems programming and the software I build.";

const ROOT = path.resolve(__dirname, "..");
const FONTS_DIR = path.join(__dirname, "fonts");

interface Page {
  /** Path of the page on the site, e.g. "/blog/my-post". */
  urlPath: string;
  /** Where the HTML goes inside dist, e.g. "blog/my-post.html". */
  htmlFile: string;
  /** Where the image goes inside dist, e.g. "og/blog/my-post.png". */
  imageFile: string;
  title: string;
  description: string;
  type: "website" | "article";
  /** Small label above the title on the image, e.g. "Blog". */
  label: string;
  date?: string;
  readingTime?: string;
}

interface Attributes {
  title?: string;
  excerpt?: string;
  date?: string;
  readingTime?: string;
}

const readMarkdown = (dir: string) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => ({
          slug: f.replace(/\.md$/, ""),
          attributes: frontMatter<Attributes>(fs.readFileSync(path.join(dir, f), "utf8")).attributes,
        }))
    : [];

// Drafts live in src/posts/drafts and are left out on purpose.
const blogPages = (): Page[] =>
  readMarkdown(path.join(ROOT, "src/posts")).map(({ slug, attributes }) => ({
    urlPath: `/blog/${slug}`,
    htmlFile: `blog/${slug}.html`,
    imageFile: `og/blog/${slug}.png`,
    title: attributes.title ?? slug,
    description: attributes.excerpt ?? SITE_DESCRIPTION,
    type: "article",
    label: "Blog",
    date: attributes.date,
    readingTime: attributes.readingTime,
  }));

// War story titles come from the slug (episode-001 -> Episode #001), as in src/lib/warStories.ts.
const warStoryPages = (): Page[] =>
  readMarkdown(path.join(ROOT, "src/war-stories")).flatMap(({ slug, attributes }) => {
    const match = slug.match(/^episode-(\d+)$/);
    if (!match) return [];
    const title = `Episode #${match[1].padStart(3, "0")}`;
    return [
      {
        urlPath: `/war-stories/${slug}`,
        htmlFile: `war-stories/${slug}.html`,
        imageFile: `og/war-stories/${slug}.png`,
        title,
        description: attributes.excerpt ?? SITE_DESCRIPTION,
        type: "article" as const,
        label: "War Stories",
        date: attributes.date,
        readingTime: attributes.readingTime,
      },
    ];
  });

const sectionPages = (): Page[] => [
  {
    urlPath: "/blogs",
    htmlFile: "blogs.html",
    imageFile: SITE_IMAGE,
    title: `Blog | ${SITE_NAME}`,
    description: "Posts on Rust, systems programming and the things I build.",
    type: "website",
    label: "Blog",
  },
  {
    urlPath: "/war-stories",
    htmlFile: "war-stories.html",
    imageFile: SITE_IMAGE,
    title: `War Stories | ${SITE_NAME}`,
    description: "Short notes from real debugging sessions, production lessons and design tradeoffs.",
    type: "website",
    label: "War Stories",
  },
];

const SITE_IMAGE = "og/site.png";

// The shared image used by the home and section pages.
const siteCard: Page = {
  urlPath: "/",
  htmlFile: "",
  imageFile: SITE_IMAGE,
  title: "Hey, I'm Elijah Ahianyo",
  description: "Writing about Rust, systems programming and the software I build.",
  type: "website",
  label: "",
};

const homePage: Page = {
  urlPath: "/",
  htmlFile: "index.html",
  imageFile: SITE_IMAGE,
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  type: "website",
  label: "",
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const formatDate = (date?: string) => {
  if (!date) return undefined;
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
};

const metaTags = (page: Page) => {
  const url = `${SITE_URL}${page.urlPath}`;
  const image = `${SITE_URL}/${page.imageFile}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="author" content="${AUTHOR}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${page.type}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${title}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ];
  if (page.type === "article") {
    tags.push(`<meta property="article:author" content="${AUTHOR}" />`);
    if (page.date) tags.push(`<meta property="article:published_time" content="${escapeHtml(page.date)}" />`);
  }
  return tags.map((t) => `  ${t}`).join("\n");
};

const START = "<!-- link-preview:start -->";
const END = "<!-- link-preview:end -->";

const withMeta = (html: string, page: Page) => {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start === -1 || end === -1) {
    throw new Error(`index.html is missing the ${START} ... ${END} block`);
  }
  return `${html.slice(0, start)}${START}\n${metaTags(page)}\n  ${html.slice(end)}`;
};

// Satori takes React-style element objects. This keeps the plugin free of JSX.
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string | undefined)[]): Node => ({
  type,
  props: { style, children: children.filter((c) => c !== undefined) },
});

const card = (page: Page, avatar: string): Node => {
  const meta = [formatDate(page.date), page.readingTime].filter(Boolean).join("  ·  ");
  const titleSize = page.title.length > 60 ? 60 : page.title.length > 35 ? 70 : 80;

  return h(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "72px 80px",
      background: "#0a0a0a",
      backgroundImage: "radial-gradient(circle at 85% 0%, #1e1b4b 0%, #0a0a0a 55%)",
      color: "#f5f5f5",
      fontFamily: "Onest",
    },
    h(
      "div",
      { display: "flex", alignItems: "center", fontSize: 28, color: "#a3a3a3", letterSpacing: "0.04em" },
      h("div", { display: "flex", fontWeight: 700, color: "#f5f5f5" }, SITE_NAME),
      page.label ? h("div", { display: "flex", margin: "0 16px", color: "#525252" }, "/") : undefined,
      page.label ? h("div", { display: "flex" }, page.label) : undefined,
    ),
    h(
      "div",
      { display: "flex", flexDirection: "column" },
      h(
        "div",
        { display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" },
        page.title,
      ),
      h(
        "div",
        { display: "flex", marginTop: 28, fontSize: 32, lineHeight: 1.4, color: "#a3a3a3", maxHeight: 136, overflow: "hidden" },
        page.description,
      ),
    ),
    h(
      "div",
      { display: "flex", alignItems: "center", fontSize: 28, color: "#d4d4d4" },
      {
        type: "img",
        props: { src: avatar, width: 64, height: 64, style: { borderRadius: 32, marginRight: 20 } },
      },
      h("div", { display: "flex", fontWeight: 600 }, page === siteCard ? "ebadf.me" : AUTHOR),
      meta ? h("div", { display: "flex", marginLeft: 20, color: "#737373" }, meta) : undefined,
    ),
  );
};

const renderImage = async (page: Page, avatar: string, fonts: Parameters<typeof satori>[1]["fonts"]) => {
  const svg = await satori(card(page, avatar) as never, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
};

export function linkPreviews(): Plugin {
  let outDir = "dist";

  return {
    name: "link-previews",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const font = (file: string) => fs.readFileSync(path.join(FONTS_DIR, file));
      const fonts = [
        { name: "Onest", data: font("Onest-Regular.ttf"), weight: 400 as const, style: "normal" as const },
        { name: "Onest", data: font("Onest-SemiBold.ttf"), weight: 600 as const, style: "normal" as const },
        { name: "Onest", data: font("Onest-Bold.ttf"), weight: 700 as const, style: "normal" as const },
      ];
      const avatar = `data:image/jpeg;base64,${fs.readFileSync(path.join(ROOT, "public/profile.jpeg")).toString("base64")}`;

      const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const pages = [homePage, ...sectionPages(), ...blogPages(), ...warStoryPages()];
      const images = new Set<string>();

      for (const page of pages) {
        const htmlPath = path.join(outDir, page.htmlFile);
        fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
        fs.writeFileSync(htmlPath, withMeta(template, page));

        if (!images.has(page.imageFile)) {
          images.add(page.imageFile);
          const imagePath = path.join(outDir, page.imageFile);
          fs.mkdirSync(path.dirname(imagePath), { recursive: true });
          fs.writeFileSync(imagePath, await renderImage(page.imageFile === SITE_IMAGE ? siteCard : page, avatar, fonts));
        }
      }

      console.log(`link-previews: wrote ${pages.length} pages and ${images.size} images`);
    },
  };
}
