
import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "@/lib/posts";
import { ArrowLeft, Link as LinkIcon } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { Note } from "@/components/Note";
import { MarkdownAccordion } from "@/components/MarkdownAccordion";
import { useTheme } from "@/contexts/ThemeContext";
import { CodeBlock } from "@/components/CodeBlock";
import type { PostSource } from "@/lib/posts";
import NotFound from "./NotFound";

const getTextContent = (children: React.ReactNode): string => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return getTextContent(child.props.children);
      }

      return "";
    })
    .join("");
};

const slugifyHeading = (children: React.ReactNode): string => {
  return getTextContent(children)
    .toLowerCase()
    .trim()
    .replace(/[`'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createHeading = (Tag: `h${1 | 2 | 3 | 4 | 5 | 6}`) => {
  return ({ children, className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const headingId = id || slugifyHeading(children);

    return (
      <Tag id={headingId} className={`scroll-mt-28 ${className || ""}`.trim()} {...props}>
        <a
          href={`#${headingId}`}
          className="not-prose group !text-inherit no-underline hover:!text-inherit"
          aria-label={`Link to ${getTextContent(children)}`}
        >
          <span>{children}</span>
          <LinkIcon
            className="ml-2 inline-block h-4 w-4 align-middle opacity-0 transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70"
            aria-hidden="true"
          />
        </a>
      </Tag>
    );
  };
};

type AccordionSummaryProps = {
  children?: React.ReactNode;
  'data-accordion-summary'?: string;
};

const isAccordionSummary = (child: React.ReactNode): child is React.ReactElement<AccordionSummaryProps> => {
  return React.isValidElement<AccordionSummaryProps>(child) &&
    child.props['data-accordion-summary'] === 'true';
};

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


  const options = {
    overrides: {
      h1: {
        component: createHeading("h1"),
      },
      h2: {
        component: createHeading("h2"),
      },
      h3: {
        component: createHeading("h3"),
      },
      h4: {
        component: createHeading("h4"),
      },
      h5: {
        component: createHeading("h5"),
      },
      h6: {
        component: createHeading("h6"),
      },
      // Custom Note component support
      div: {
        component: ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
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
      // Custom Accordion component support
      summary: {
        component: ({ children }: React.HTMLAttributes<HTMLElement>) => {
          return <span data-accordion-summary="true">{children}</span>;
        }
      },
      details: {
        component: ({ children, ...props }: React.DetailsHTMLAttributes<HTMLDetailsElement>) => {
          const childArray = React.Children.toArray(children);
          let title = props.title || 'Notes';
          let content = childArray;
          
          const summaryIndex = childArray.findIndex(isAccordionSummary);
          
          if (summaryIndex !== -1) {
            const summaryElement = childArray[summaryIndex];
            title = summaryElement.props.children;
            content = childArray.filter((_, index) => index !== summaryIndex);
          }
          
          return (
            <MarkdownAccordion title={title}>
              {content}
            </MarkdownAccordion>
          );
        }
      },
      table: {
        component: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
          <div className="my-8 overflow-x-auto rounded-lg border border-border shadow-sm">
            <table className="min-w-full divide-y divide-border" {...props}>
              {children}
            </table>
          </div>
        )
      },
      thead: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
          <thead className="bg-muted/70" {...props}>
            {children}
          </thead>
        )
      },
      tbody: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
          <tbody className="divide-y divide-border bg-background" {...props}>
            {children}
          </tbody>
        )
      },
      tr: {
        component: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
          <tr className="hover:bg-muted/40 transition-colors duration-150" {...props}>
            {children}
          </tr>
        )
      },
      th: {
        component: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
          <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-b-2 border-border" {...props}>
            {children}
          </th>
        )
      },
      td: {
        component: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
          <td className="px-6 py-4 text-sm text-foreground/90" {...props}>
            {children}
          </td>
        )
      },
      a: {
        component: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
          const isHashLink = typeof href === "string" && href.startsWith("#");

          return (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:underline transition-colors link"
              target={isHashLink ? undefined : "_blank"}
              rel={isHashLink ? undefined : "noopener noreferrer"}
              {...props}
            >
              {children}
            </a>
          );
        }
      },
      code: {
        component: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
          const content = typeof children === 'string'
            ? children
            : Array.isArray(children)
              ? children.join('')
              : '';
          
          if (content.includes('\n')) {
            console.log("first codeblock");
            return (
              <CodeBlock className={className}>
                {content}
              </CodeBlock>
            );
          }

          const langMatch = (className || '').match(/\b(?:lang|language)-([A-Za-z0-9_-]+)\b/i);
          const hasLang = !!langMatch;
          if (hasLang) {
            console.log("second code block\n");
            return (
              <CodeBlock className={className}>
                {content}
              </CodeBlock>
            );
          }


          return (
            <code className={`inline-code ${className || ''}`.trim()} {...props}>
              {content}
            </code>
          );
        }
      },
      blockquote: {
  component: ({ children, className }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
    return (
      <blockquote className={`border-l-1 pl-4 py-2 my-4 bg-muted/50 border-primary rounded-lg ${className || ''}`}>
        {children}
      </blockquote>
    )
  }
}

    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-24">
      <div className="max-w-4xl mx-auto px-4 py-16">
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
          
            <div className="prose prose-slate dark:prose-invert max-w-none
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
