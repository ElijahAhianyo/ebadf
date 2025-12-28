
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

const Post = () => {
  const { slug } = useParams();
  const { theme } = useTheme();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPostBySlug(slug as string),
  });



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
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <p className="text-destructive">Error loading post</p>
        </div>
      </div>
    );
  }


  const options = {
    overrides: {
      // Custom Note component support
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
      // Custom Accordion component support
      summary: {
        component: ({ children }: any) => {
          return <span data-accordion-summary="true">{children}</span>;
        }
      },
      details: {
        component: ({ children, ...props }: any) => {
          const childArray = React.Children.toArray(children);
          let title = props.title || 'Notes';
          let content = childArray;
          
          const summaryIndex = childArray.findIndex((child: any) => 
            child?.props?.['data-accordion-summary'] === 'true'
          );
          
          if (summaryIndex !== -1) {
            const summaryElement = childArray[summaryIndex] as any;
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
        component: ({ children, ...props }: any) => (
          <div className="my-8 overflow-x-auto rounded-lg border border-border shadow-sm">
            <table className="min-w-full divide-y divide-border" {...props}>
              {children}
            </table>
          </div>
        )
      },
      thead: {
        component: ({ children, ...props }: any) => (
          <thead className="bg-muted/70" {...props}>
            {children}
          </thead>
        )
      },
      tbody: {
        component: ({ children, ...props }: any) => (
          <tbody className="divide-y divide-border bg-background" {...props}>
            {children}
          </tbody>
        )
      },
      tr: {
        component: ({ children, ...props }: any) => (
          <tr className="hover:bg-muted/40 transition-colors duration-150" {...props}>
            {children}
          </tr>
        )
      },
      th: {
        component: ({ children, ...props }: any) => (
          <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-b-2 border-border" {...props}>
            {children}
          </th>
        )
      },
      td: {
        component: ({ children, ...props }: any) => (
          <td className="px-6 py-4 text-sm text-foreground/90" {...props}>
            {children}
          </td>
        )
      },
      a: {
        component: ({ href, children, ...props }: any) => (
          <a
            href={href}
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors link"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        )
      },
      code: {
        component: ({ className, children, ...props }: any) => {
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
            <code className={`inline-code ${props.className || ''}`.trim()} {...props}>
              {content}
            </code>
          );
        }
      },
      blockquote: {
  component: ({ children, className }: any) => {
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
        <Link 
          to="/blogs" 
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to posts</span>
        </Link>
        
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
                Have any concerns with this post? Send me an email at{' '}
                <a href="mailto:elijahahianyo@gmail.com" className="text-blue-600 dark:text-blue-400 underline">
                  elijahahianyo@gmail.com
                </a>
                . I appreciate corrections and thoughtful feedback.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default Post;
