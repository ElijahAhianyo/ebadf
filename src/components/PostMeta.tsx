import { useEffect } from 'react';

type PostMetaProps = {
  title?: string;
  description?: string;
  image?: string;
  slug?: string;
};

function setTag(selector: string, attr: string, value: string | null) {
  if (!value) return;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    // create a meta tag if it doesn't exist
    el = document.createElement('meta');
    if (selector.startsWith('meta[') && selector.includes('property')) {
      const prop = selector.match(/property=["']([^"']+)["']/)?.[1];
      if (prop) el.setAttribute('property', prop);
    } else if (selector.startsWith('meta[') && selector.includes('name')) {
      const name = selector.match(/name=["']([^"']+)["']/)?.[1];
      if (name) el.setAttribute('name', name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export const PostMeta = ({ title, description, image, slug }: PostMetaProps) => {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    // set basic description
    const desc = description || '';
    setTag('meta[name="description"]', 'content', desc);

    // Open Graph
    setTag('meta[property="og:title"]', 'content', title || '');
    setTag('meta[property="og:description"]', 'content', desc);
    setTag('meta[property="og:type"]', 'content', 'article');
    const url = slug ? `${window.location.origin}/blog/${slug}` : window.location.href;
    setTag('meta[property="og:url"]', 'content', url);
    if (image) setTag('meta[property="og:image"]', 'content', image);

    // Twitter
    setTag('meta[name="twitter:card"]', 'content', image ? 'summary_large_image' : 'summary');
    setTag('meta[name="twitter:title"]', 'content', title || '');
    setTag('meta[name="twitter:description"]', 'content', desc);
    if (image) setTag('meta[name="twitter:image"]', 'content', image);

    return () => {
      // restore title on unmount
      document.title = prevTitle;
      // Note: we intentionally leave meta tags in place when navigating between posts
      // because many crawlers will read the final state.
    };
  }, [title, description, image, slug]);

  return null;
};

export default PostMeta;
