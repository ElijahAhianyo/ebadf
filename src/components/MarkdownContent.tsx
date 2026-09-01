import React from "react";
import Markdown from "markdown-to-jsx";
import { Link as LinkIcon } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { MarkdownAccordion } from "@/components/MarkdownAccordion";
import { Note } from "@/components/Note";

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
  "data-accordion-summary"?: string;
};

const isAccordionSummary = (child: React.ReactNode): child is React.ReactElement<AccordionSummaryProps> => {
  return React.isValidElement<AccordionSummaryProps>(child) &&
    child.props["data-accordion-summary"] === "true";
};

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
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
      div: {
        component: ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
          if (className?.includes("note")) {
            const variant = className.includes("warning") ? "warning" :
                          className.includes("tip") ? "tip" : "info";
            const title = className.includes("title=") ?
                         className.match(/title=([^ ]+)/)?.[1] : "Note";
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
        component: ({ children }: React.HTMLAttributes<HTMLElement>) => {
          return <span data-accordion-summary="true">{children}</span>;
        }
      },
      details: {
        component: ({ children, ...props }: React.DetailsHTMLAttributes<HTMLDetailsElement>) => {
          const childArray = React.Children.toArray(children);
          let title = props.title || "Notes";
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
          const codeContent = typeof children === "string"
            ? children
            : Array.isArray(children)
              ? children.join("")
              : "";

          const langMatch = (className || "").match(/\b(?:lang|language)-([A-Za-z0-9_-]+)\b/i);

          if (codeContent.includes("\n") || langMatch) {
            return (
              <CodeBlock className={className}>
                {codeContent}
              </CodeBlock>
            );
          }

          return (
            <code className={`inline-code ${className || ""}`.trim()} {...props}>
              {codeContent}
            </code>
          );
        }
      },
      blockquote: {
        component: ({ children, className }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => {
          return (
            <blockquote className={`border-l-1 pl-4 py-2 my-4 bg-muted/50 border-primary rounded-lg ${className || ""}`}>
              {children}
            </blockquote>
          );
        }
      }
    }
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none
                 prose-headings:font-bold prose-headings:tracking-tight
                 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                 prose-p:leading-relaxed prose-p:text-foreground/90
                 prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                 prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4
                 prose-img:rounded-lg prose-img:shadow-md
                 prose-hr:border-border">
      <Markdown options={options}>
        {content}
      </Markdown>
    </div>
  );
};
