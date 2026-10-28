import Giscus from "@giscus/react";
import { useTheme } from "@/contexts/ThemeContext";

/*
 * Comments for a blog post, stored as GitHub Discussions through giscus.
 *
 * Each post gets its own discussion in the "Announcements" category of
 * ElijahAhianyo/ebadf, titled after the post's slug. The thread is created
 * the first time someone comments, and readers sign in with GitHub to post.
 * Changing a slug starts a new thread, so keep slugs stable once published.
 */
export function PostComments({ slug }: { slug: string }) {
  const { resolvedTheme } = useTheme();

  return (
    <section aria-labelledby="comments-heading" className="mt-16 border-t border-border pt-10">
      <h2 id="comments-heading" className="mb-6 text-2xl font-bold tracking-tight">
        Comments
      </h2>
      <Giscus
        id="comments"
        repo="ElijahAhianyo/ebadf"
        repoId="R_kgDON22G4Q"
        category="Announcements"
        categoryId="DIC_kwDON22G4c4DJ1oy"
        mapping="specific"
        term={`blog/${slug}`}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        lang="en"
        loading="lazy"
      />
    </section>
  );
}
