import { Sparkles } from "lucide-react";
import WarStoryCard from "@/components/WarStoryCard";
import { getAllWarStories } from "@/lib/warStories";

const WarStories = () => {
  const stories = getAllWarStories();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              War Stories
            </h1>
          </div>

          <div className="space-y-6">
            {stories.length > 0 ? (
              stories.map((story, index) => (
                <div
                  key={story.slug}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <WarStoryCard story={story} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                <h3 className="text-xl font-semibold">No episodes yet</h3>
                <p className="max-w-md text-muted-foreground">
                  Notes from the field will show up here when they are ready.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarStories;
