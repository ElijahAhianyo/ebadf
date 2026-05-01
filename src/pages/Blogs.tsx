import BlogCard from "@/components/BlogCard";
import { Book, FileText, Sparkles } from "lucide-react";
import { getAllPosts } from "@/lib/posts";
import type { PostSource } from "@/lib/posts";

interface BlogsProps {
  postSource?: PostSource;
}

const Blogs = ({ postSource = 'published' }: BlogsProps) => {
  const isDraft = postSource === 'draft';
  const posts = getAllPosts(postSource);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Blog Posts
            </h1>
            {/* <p className="text-xl text-muted-foreground">
              Thoughts on technology, development, and everything in between.
            </p> */}
          </div>

          <div className="space-y-12">
            {posts && posts.length > 0 ? (
              posts.map((post, index) => (
                <div
                  key={post.slug}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BlogCard {...post} basePath={isDraft ? '/draft/blog' : '/blog'} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="h-16 w-16 text-primary/30" />
                  </div>
                </div>
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="text-xl font-semibold">Coming Soon!</h3>
                  <p className="text-muted-foreground">
                    I’m tinkering with a few drafts — exciting posts are brewing. Come back soon for the reveal! 🚀
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground animate-bounce">
                  <Book className="h-4 w-4" />
                  <span>•</span>
                  <FileText className="h-4 w-4" />
                  <span>•</span>
                  <Book className="h-4 w-4" />
                </div>
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
