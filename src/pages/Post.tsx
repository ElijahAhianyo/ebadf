import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/posts";
import { ArrowLeft } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { Note } from "@/components/Note";
import { MarkdownAccordion } from "@/components/MarkdownAccordion";
import { useTheme } from "@/contexts/ThemeContext";
import { CodeBlock } from "@/components/CodeBlock";
import { Helmet } from "react-helmet-async";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const Post: React.FC = () => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const { theme } = useTheme(); // keep if you plan to use later

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", routeSlug],
    queryFn: () => getPostBySlug(routeSlug as string),
  });

  // SITE URL must be set in env (VITE_SITE_URL). Strip trailing slash.
  const siteUrlRaw = (import.meta.env.VITE_SITE_URL as string) || "https://ebadf.me/";
  const siteUrl = siteUrlRaw.replace(/\/$/, "");

  // Prefer explicit post.metadata.slug, then route param, then slugified title.
  const computedSlug =
    post?.metadata?.slug ||
    routeSlug ||
    (post?.metadata?.title ? slugify(post.metadata.title) : "post");

  // OG image filename (use default.png when we don't have a computedSlug)
  const ogFile = computedSlug ? `${computedSlug}.png` : "default.png";
  const ogPath = `/og/${encodeURIComponent(ogFile)}`;
  const ogAbsolute = siteUrl ? `${siteUrl}${ogPath}` : ogPath;

  const title = post?.metadata?.title || (isLoading ? "Loading… — Elijah Ahianyo" : "Elijah Ahianyo");
  const description =
    post?.metadata?.excerpt ||
    "Elijah Ahianyo — software engineer.";

  const canonical = siteUrl ? `${siteUrl}/blog/${encodeURIComponent(computedSlug)}` : `/blog/${computedSlug}`;

  // Compose Helmet once and include it in every render path
  const helmet = (
    <Helmet>
      <title>{`${title} — Elijah Ahianyo`}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogAbsolute} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <link rel="canonical" href={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogAbsolute} />

      {/* Article metadata if available */}
      {post?.metadata?.date && (
        <meta property="article:published_time" content={new Date(post.metadata.date).toISOString()} />
      )}
      {/* Optionally add theme-color or other page-level meta */}
    </Helmet>
  );

  if (isLoading) {
    return (
      <>
        {helmet}
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
      </>
    );
  }

  if (error) {
    return (
      <>
        {helmet}
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-24">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <p className="text-destructive">Error loading post</p>
          </div>
        </div>
      </>
    );
  }

  const options = {
    overrides: {
      div: {
        component: ({ className, children, ...props }: any) => {
          if (className?.includes('note')) {
            const variant = className.includes('warning') ? 'warning' :
                          className.includes('tip') ? 'tip' : 'info';
            const title = className.includes('title=') ?
                         className.match(/title=([^ ]+)/)?.[1] : 'Note';
            return (
              <Note variant={variant} title={title}>
                {children}
              </Note>
            );
          }
          return <div className={className} {...props}>{children}</div>;
        }
      },
      summary: {
        component: ({ children }: any) => <span data-accordion-summary="true">{children}</span>,
      },
      details: {
        component: ({ children, ...props }: any) => {
          const childArray = React.Children.toArray(children);
          let title = props.title || "Notes";
          let content = childArray;
          
          const summaryIndex = childArray.findIndex((child: any) => 
            child?.props?.['data-accordion-summary'] === 'true'
          );
          
          if (summaryIndex !== -1) {
            const summaryElement = childArray[summaryIndex] as any;
            title = summaryElement.props.children;
            content = childArray.filter((_, index) => index !== summaryIndex);
          }

          return <MarkdownAccordion title={title}>{content}</MarkdownAccordion>;
        },
      },
      table: {
        component: ({ children, ...props }: any) => (
          <div className="my-8 overflow-x-auto rounded-lg border border-border shadow-sm">
            <table className="min-w-full divide-y divide-border" {...props}>
              {children}
            </table>
          </div>
        ),
      },
      thead: { component: ({ children, ...props }: any) => <thead className="bg-muted/70" {...props}>{children}</thead> },
      tbody: { component: ({ children, ...props }: any) => <tbody className="divide-y divide-border bg-background" {...props}>{children}</tbody> },
      tr: { component: ({ children, ...props }: any) => <tr className="hover:bg-muted/40 transition-colors duration-150" {...props}>{children}</tr> },
      th: { component: ({ children, ...props }: any) => <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-b-2 border-border" {...props}>{children}</th> },
      td: { component: ({ children, ...props }: any) => <td className="px-6 py-4 text-sm text-foreground/90" {...props}>{children}</td> },
      a: {
        component: ({ href, children, ...props }: any) => (
          <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline transition-colors link" target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        ),
      },
      code: {
        component: ({ className, children, ...props }: any) => {
          const content =
            typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";

          if (content.includes("\n")) {
            return <CodeBlock className={className}>{content}</CodeBlock>;
          }

          const langMatch = (className || "").match(/\b(?:lang|language)-([A-Za-z0-9_-]+)\b/i);
          if (langMatch) {
            return <CodeBlock className={className}>{content}</CodeBlock>;
          }

          return (
            <code className={`inline-code ${props.className || ""}`.trim()} {...props}>
              {content}
            </code>
          );
        },
      },
      blockquote: {
        component: ({ children, className }: any) => (
          <blockquote className={`border-l-1 pl-4 py-2 my-4 bg-muted/50 border-primary rounded-lg ${className || ""}`}>
            {children}
          </blockquote>
        ),
      },
    },
  };

  return (
    <>
      {helmet}
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link to="/blogs" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to posts</span>
          </Link>

          <article className="space-y-8">
            <header className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">{post?.metadata.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <time>{post?.metadata.date}</time>
                <span>•</span>
                <span>{post?.metadata.readingTime}</span>
              </div>
            </header>

            <div
              className="prose prose-slate dark:prose-invert max-w-none
                         prose-headings:font-bold prose-headings:tracking-tight
                         prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                         prose-p:leading-relaxed prose-p:text-foreground/90
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4
                         prose-img:rounded-lg prose-img:shadow-md
                         prose-hr:border-border">
            <Markdown options={options}>
              {post?.content || ""}
            </Markdown>
          </div>

            <div className="max-w-4xl mx-auto px-4 mt-8">
              <div className="p-4 rounded-md bg-muted/30 dark:bg-muted/20 border border-border">
                <p className="text-sm text-foreground/90">
                  Have any suggestions or concerns with this post? Send me an email at{" "}
                  <a href="mailto:elijahahianyo@gmail.com" className="text-blue-600 dark:text-blue-400 underline">
                    elijahahianyo@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default Post;
