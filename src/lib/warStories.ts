import frontMatter from "front-matter";

export const PINNED_WAR_STORY_LIMIT = 3;
export const HOME_WAR_STORY_LIMIT = 3;

export class WarStoryNotFoundError extends Error {
  constructor(slug: string) {
    super(`War story with slug ${slug} not found`);
    this.name = "WarStoryNotFoundError";
  }
}

export interface WarStoryMetadata {
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  slug: string;
  episodeNumber: number;
  categories: string[];
  pinned: boolean;
}

interface WarStoryAttributes {
  excerpt: string;
  date: string;
  readingTime: string;
  categories?: string[];
  pinned?: boolean;
}

function getSlugFromFilepath(filepath: string): string {
  return filepath.split("/").pop()?.replace(/\.md$/, "") ?? "";
}

function formatEpisodeTitle(episodeNumber: number): string {
  return `Episode #${String(episodeNumber).padStart(3, "0")}`;
}

function getEpisodeNumberFromSlug(slug: string): number | null {
  const match = slug.match(/^episode-(\d+)$/);

  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function getWarStoryFiles() {
  return import.meta.glob("../war-stories/*.md", { eager: true, query: "?raw", import: "default" });
}

function byNewestDate(a: WarStoryMetadata, b: WarStoryMetadata) {
  return (new Date(b.date)).getTime() - (new Date(a.date)).getTime();
}

function processWarStory(filepath: string, content: string): WarStoryMetadata | null {
  try {
    const { attributes } = frontMatter<WarStoryAttributes>(content);
    const slug = getSlugFromFilepath(filepath);
    const episodeNumber = getEpisodeNumberFromSlug(slug);

    if (episodeNumber === null) {
      return null;
    }

    return {
      title: formatEpisodeTitle(episodeNumber),
      excerpt: attributes.excerpt,
      date: attributes.date,
      readingTime: attributes.readingTime,
      slug,
      episodeNumber,
      categories: attributes.categories ?? [],
      pinned: attributes.pinned ?? false,
    };
  } catch (error) {
    return null;
  }
}

export function getAllWarStories(): WarStoryMetadata[] {
  return Object.entries(getWarStoryFiles())
    .map(([filepath, content]) => processWarStory(filepath, content as string))
    .filter((story): story is WarStoryMetadata => story !== null)
    .sort(byNewestDate);
}

export function getPinnedWarStories(limit = PINNED_WAR_STORY_LIMIT): WarStoryMetadata[] {
  return getAllWarStories()
    .filter((story) => story.pinned)
    .sort((a, b) => a.episodeNumber - b.episodeNumber)
    .slice(0, limit);
}

export function getHomeWarStories(limit = HOME_WAR_STORY_LIMIT): WarStoryMetadata[] {
  const pinnedStories = getPinnedWarStories();
  const pinnedSlugs = new Set(pinnedStories.map((story) => story.slug));
  const latestStories = getAllWarStories()
    .filter((story) => !pinnedSlugs.has(story.slug))
    .slice(0, Math.max(limit - pinnedStories.length, 0));

  return [...pinnedStories, ...latestStories];
}

export async function getWarStoryBySlug(slug: string) {
  const storyContent = Object.entries(getWarStoryFiles()).find(([filepath]) =>
    getSlugFromFilepath(filepath) === slug
  )?.[1];
  const episodeNumber = getEpisodeNumberFromSlug(slug);

  if (!storyContent || episodeNumber === null) {
    throw new WarStoryNotFoundError(slug);
  }

  const { attributes, body } = frontMatter<WarStoryAttributes>(storyContent as string);

  return {
    metadata: {
      title: formatEpisodeTitle(episodeNumber),
      excerpt: attributes.excerpt,
      date: attributes.date,
      readingTime: attributes.readingTime,
      slug,
      episodeNumber,
      categories: attributes.categories ?? [],
      pinned: attributes.pinned ?? false,
    },
    content: body,
  };
}
