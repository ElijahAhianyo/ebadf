
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NotFoundProps {
  variant?: 'page' | 'post';
  returnTo?: string;
}

const NotFound = ({ variant = 'page', returnTo = '/' }: NotFoundProps) => {
  const location = useLocation();
  const isPost = variant === 'post';

  return (
    <main className="min-h-[70vh] px-4 pt-24 pb-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="not-found-float relative mb-8 h-36 w-64 overflow-hidden rounded-lg border border-border bg-muted/25 shadow-sm">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />
          <div className="not-found-scan absolute left-0 top-0 h-10 w-full bg-gradient-to-b from-transparent via-foreground/10 to-transparent" />
          <div className="relative flex h-full items-center justify-center gap-4">
            <SearchX className="h-10 w-10 text-muted-foreground animate-pulse" />
            <span className="font-mono text-6xl font-bold tracking-tight">404</span>
          </div>
        </div>

        <div className="space-y-4 animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {isPost ? 'Post not found' : 'Page not found'}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            {isPost ? 'That post is not here.' : 'This page wandered off.'}
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
            {isPost
              ? 'The post may be unpublished, still in drafts, or using a different slug.'
              : "The route you requested doesn't exist or may have moved."}
          </p>
          <p className="font-mono text-sm text-muted-foreground/80 break-all">
            {location.pathname}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row animate-fade-up" style={{ animationDelay: "120ms" }}>
          <Button asChild>
            <Link to={returnTo}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isPost ? 'Back to posts' : 'Go back'}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
