
import frontMatter from 'front-matter';

export type PostSource = 'published' | 'draft';

export class PostNotFoundError extends Error {
  constructor(slug: string, source: PostSource) {
    super(`Post with slug ${slug} not found in ${source} posts`);
    this.name = 'PostNotFoundError';
  }
}

interface PostMetadata {
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  slug: string;
  featured: boolean;  // Changed from optional to required with a default value
}

interface PostAttributes {
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  featured?: boolean;
}

function getSlugFromFilepath(filepath: string): string {
  return filepath.split('/').pop()?.replace(/\.md$/, '') ?? '';
}

function getPostFiles(source: PostSource) {
  const publishedPosts = import.meta.glob('../posts/*.md', { eager: true, query: '?raw', import: 'default' });
  const draftPosts = import.meta.glob('../posts/drafts/*.md', { eager: true, query: '?raw', import: 'default' });

  return source === 'draft' ? draftPosts : publishedPosts;
}

export function getAllPosts(source: PostSource = 'published'): PostMetadata[] {
  const posts = getPostFiles(source);
  
  const processedPosts = Object.entries(posts)
    .map(([filepath, content]) => {
      try {
        const { attributes } = frontMatter<PostAttributes>(content as string);
        const post: PostMetadata = {
          title: attributes.title,
          excerpt: attributes.excerpt,
          date: attributes.date,
          readingTime: attributes.readingTime,
          slug: getSlugFromFilepath(filepath),
          featured: attributes.featured ?? false, // Use nullish coalescing
        };
        return post;
      } catch (error) {
        return null;
      }
    })
    .filter((post): post is PostMetadata => post !== null)
    .sort((a, b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime());

  return processedPosts;
}

export async function getPostBySlug(slug: string, source: PostSource = 'published') {
  const posts = getPostFiles(source);
  const postContent = Object.entries(posts).find(([filepath]) =>
    getSlugFromFilepath(filepath) === slug
  )?.[1];

  if (!postContent) {
    throw new PostNotFoundError(slug, source);
  }

  const { attributes, body } = frontMatter<PostAttributes>(postContent as string);
  return {
    metadata: {
      title: attributes.title,
      excerpt: attributes.excerpt,
      date: attributes.date,
      readingTime: attributes.readingTime,
      slug,
      featured: attributes.featured ?? false,
    },
    content: body
  };
}
