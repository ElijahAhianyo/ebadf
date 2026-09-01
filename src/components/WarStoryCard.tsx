import { Link } from "react-router-dom";
import { Pin } from "lucide-react";
import type { WarStoryMetadata } from "@/lib/warStories";

interface WarStoryCardProps {
  story: WarStoryMetadata;
}

const WarStoryCard = ({ story }: WarStoryCardProps) => {
  return (
    <Link
      to={`/war-stories/${story.slug}`}
      className="block group p-6 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <article className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {story.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-foreground">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}
          <time dateTime={story.date}>{story.date}</time>
          <span>•</span>
          <span>{story.readingTime}</span>
        </div>

        <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
          {story.title}
        </h3>

        <p className="text-muted-foreground line-clamp-2">
          {story.excerpt}
        </p>

        {story.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {story.categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
};

export default WarStoryCard;
