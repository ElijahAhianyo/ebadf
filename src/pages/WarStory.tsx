import React from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { MarkdownContent } from "@/components/MarkdownContent";
import { getWarStoryBySlug } from "@/lib/warStories";
import NotFound from "./NotFound";

const WarStory = () => {
  const { slug } = useParams();

  const { data: story, isLoading, error } = useQuery({
    queryKey: ["war-story", slug],
    queryFn: () => getWarStoryBySlug(slug as string),
    retry: false,
  });

  React.useEffect(() => {
    if (!story?.content || !window.location.hash) {
      return;
    }

    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(id);

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start" });
      });
    }
  }, [story?.content, slug]);

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
    return <NotFound variant="post" returnTo="/war-stories" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-24">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <RouterLink
          to="/war-stories"
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to war stories</span>
        </RouterLink>

        <article className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {story?.metadata.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={story?.metadata.date}>{story?.metadata.date}</time>
              <span>•</span>
              <span>{story?.metadata.readingTime}</span>
            </div>

            {story?.metadata.categories && story.metadata.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {story.metadata.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </header>

          <MarkdownContent content={story?.content || ""} />
        </article>
      </div>
    </div>
  );
};

export default WarStory;
