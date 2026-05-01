
import { Link } from "react-router-dom";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  slug: string;
  featured?: boolean;
  basePath?: string;
}

const BlogCard = ({ title, excerpt, date, readingTime, slug, featured, basePath = '/blog' }: BlogCardProps) => {
  return (
    <Link
      to={`${basePath}/${slug}`}
      className={`
        block group p-6 rounded-lg transition-all duration-300 hover:shadow-sm hover:-translate-y-1 hover:shadow-lg border border-border hover:border-primary/50
        ${featured ? 'border-l-4 border-blog-300' : ''}
      `}
    >
      <article className="space-y-3">
        <div className="flex items-center gap-2 text-sm ">
          <time>{date}</time>
          <span>•</span>
          <span>{readingTime}</span>
        </div>
        <h2 className={`
          ${featured ? 'text-2xl' : 'text-xl'}
          font-semibold tracking-tight 
          group-hover:text-blog-600 transition-colors
        `}>
          {title}
        </h2>
        <p className="text-blog-600 line-clamp-2">
          {excerpt}
        </p>
      </article>
    </Link>
  );
};

export default BlogCard;
