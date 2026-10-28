
import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/posts";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { PostSource } from "@/lib/posts";
import NotFound from "./NotFound";
import { MarkdownContent } from "@/components/MarkdownContent";

interface PostProps {
  postSource?: PostSource;
}

const Post = ({ postSource = 'published' }: PostProps) => {
  const { slug } = useParams();
  const { theme } = useTheme();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', postSource, slug],
    queryFn: () => getPostBySlug(slug as string, postSource),
    retry: false,
  });

  React.useEffect(() => {
    if (!post?.content || !window.location.hash) {
      return;
    }

    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(id);

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start" });
      });
    }
  }, [post?.content, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <NotFound variant="post" returnTo={postSource === 'draft' ? '/draft/blogs' : '/blogs'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-24">
      <div className={`max-w-4xl mx-auto px-4 py-16 ${post?.content.includes("<SentenceNote") ? "article-with-margin-notes" : ""}`}>
        <RouterLink 
          to={postSource === 'draft' ? '/draft/blogs' : '/blogs'} 
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to posts</span>
        </RouterLink>
        
        <article className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {post?.metadata.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <time>{post?.metadata.date}</time>
              <span>•</span>
              <span>{post?.metadata.readingTime}</span>
            </div>
          </header>
          
          <MarkdownContent content={post?.content || ""} />

          {/* Feedback / contact blurb for each post */}
          <div className="max-w-4xl mx-auto px-4 mt-8">
            <div className="p-4 rounded-md bg-muted/30 dark:bg-muted/20 border border-border">
              <p className="text-sm text-foreground/90">
                Have any suggestions or concerns with this post? Send me an email at{' '}
                <a href="mailto:elijahahianyo@gmail.com" className="text-blue-600 dark:text-blue-400 underline">
                  elijahahianyo@gmail.com
                </a>
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default Post;
