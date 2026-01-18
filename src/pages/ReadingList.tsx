import { Book as BookIcon, FileText, Sparkles } from "lucide-react";
import { cloudinaryFetch } from "@/utils/cloudinary";
import { S3_BASE } from "@/lib/readingList";
import { useNavigate } from "react-router-dom";
import { books as allBooks, articles as allArticles, papers as allPapers } from "@/lib/readingList";
import type { Book, Article, Paper } from "@/lib/readingList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";


 const ReadingList = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState<"books" | "articles" | "papers">("books");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    let source: Array<{ tags: string[] }> = [];
    if (tab === "books") source = allBooks as any;
    else if (tab === "articles") source = allArticles as any;
    else source = allPapers as any;
    source.forEach((b) => b.tags.forEach((t: string) => tags.add(t)));
    return Array.from(tags).sort();
  }, [tab]);

  // filtered items depending on active tab
  const filteredBooks = allBooks.filter((b) => {
    const statusOk = statusFilter === "all" || b.status === statusFilter;
    const tagOk = tagFilter === "all" || b.tags.includes(tagFilter);
    return statusOk && tagOk;
  });

  const filteredArticles = allArticles.filter((a) => {
    const tagOk = tagFilter === "all" || a.tags.includes(tagFilter);
    return tagOk;
  });

  const filteredPapers = allPapers.filter((a) => {
    const tagOk = tagFilter === "all" || a.tags.includes(tagFilter);
    return tagOk;
  });

  const EmptyState = ({ category }: { category: string }) => (
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
          I'm curating an amazing collection of {category} that have shaped my thinking.
          Check back soon for some mind-bending recommendations!
        </p>
      </div>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground animate-bounce">
        <BookIcon className="h-4 w-4" />
        <span>•</span>
        <FileText className="h-4 w-4" />
        <span>•</span>
        <BookIcon className="h-4 w-4" />
      </div>
    </div>
  );

  const BookCard = ({ book }: { book: Book }) => (
    <div
      onClick={() => navigate(`/reading-list/book/${book.id}`)}
      className="group cursor-pointer p-4 rounded-lg border hover:shadow-md transition bg-card"
    >
      <div className="flex flex-col items-start">
        {/* smaller cover like typical book thumbnails */}
        <img
          src={cloudinaryFetch(
            (book.cover || "/placeholder.svg").startsWith("http") || (book.cover || "").startsWith("/")
              ? (book.cover || "/placeholder.svg")
              : `${S3_BASE}/${book.cover}`,
            { w: 200, h: 280, crop: "fill" }
          )}
          alt={book.title}
          className="w-20 h-28 object-cover rounded mx-auto"
        />
        <div className="mt-3 w-full text-center">
          <h3 className="text-sm font-semibold line-clamp-2">{book.title}</h3>
          <p className="text-xs text-muted-foreground">{book.author}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {book.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 w-full flex justify-center">
          <a
            href={book.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-primary underline"
          >
            Open
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8"> 
           <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Reading List</h1>
            <p className="text-xl text-muted-foreground">
              Books and papers that have influenced my thinking and approach to technology.
            </p>
          </div>
          <div className="space-y-6">
            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setTab("books")}
                  className={`px-3 py-1 rounded ${tab === "books" ? "bg-primary text-primary-foreground" : "bg-muted/10"}`}
                >
                  Books
                </button>
                <button
                  onClick={() => setTab("articles")}
                  className={`px-3 py-1 rounded ${tab === "articles" ? "bg-primary text-primary-foreground" : "bg-muted/10"}`}
                >
                  Articles
                </button>
                <button
                  onClick={() => setTab("papers")}
                  className={`px-3 py-1 rounded ${tab === "papers" ? "bg-primary text-primary-foreground" : "bg-muted/10"}`}
                >
                  Papers
                </button>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {/* status filter only for books tab */}
                {tab === "books" && (
                  <div className="flex items-center gap-2">
                    <BookIcon className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                      <SelectTrigger className="w-48 bg-muted/10 rounded">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="currently-reading">Currently Reading</SelectItem>
                        <SelectItem value="future">Future Reading</SelectItem>
                        <SelectItem value="previously-read">Previously Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Select value={tagFilter} onValueChange={(v: any) => setTagFilter(v)}>
                    <SelectTrigger className="w-48 bg-muted/10 rounded">
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {availableTags.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* render content per tab */}
            {tab === "books" ? (
              // if no books after filters show empty state for books
              filteredBooks.length === 0 ? (
                <EmptyState category="books" />
              ) : (
                <div className="space-y-8">
                  {/* Currently Reading */}
                  {filteredBooks.filter((b) => b.status === "currently-reading").length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookIcon className="h-6 w-6" /> Currently Reading
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks
                          .filter((b) => b.status === "currently-reading")
                          .map((b) => (
                            <BookCard key={b.id} book={b} />
                          ))}
                      </div>
                    </section>
                  )}

                  {/* Future Reading */}
                  {filteredBooks.filter((b) => b.status === "future").length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookIcon className="h-6 w-6" /> Future Reading
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks
                          .filter((b) => b.status === "future")
                          .map((b) => (
                            <BookCard key={b.id} book={b} />
                          ))}
                      </div>
                    </section>
                  )}

                  {/* Previously Read */}
                  {filteredBooks.filter((b) => b.status === "previously-read").length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookIcon className="h-6 w-6" /> Previously Read
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBooks
                          .filter((b) => b.status === "previously-read")
                          .map((b) => (
                            <BookCard key={b.id} book={b} />
                          ))}
                      </div>
                    </section>
                  )}
                </div>
              )
            ) : tab === "articles" ? (
              filteredArticles.length === 0 ? (
                <EmptyState category="articles" />
              ) : (
                <div className="space-y-4">
                  {filteredArticles.map((a: Article) => (
                    <a
                      key={a.id}
                      href={a.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg border hover:shadow-md transition bg-card"
                    >
                      <div className="flex items-start gap-4">
                        <img src={cloudinaryFetch(((a.thumb || "/placeholder.svg").startsWith("http") || (a.thumb || "").startsWith("/") ? (a.thumb || "/placeholder.svg") : `${S3_BASE}/${a.thumb}`), { w: 120, h: 162, crop: "fill" })} alt={a.title} className="w-20 h-35 object-cover rounded" />
                        <div>
                          <h3 className="text-lg font-semibold">{a.title}</h3>
                          <p className="text-sm text-muted-foreground">{a.authors}</p>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                          <div className="mt-2 flex gap-2">
                            {a.tags.map((t) => (
                              <span key={t} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )
            ) : (
              filteredPapers.length === 0 ? (
                <EmptyState category="papers" />
              ) : (
                <div className="space-y-4">
                  {filteredPapers.map((p: Paper) => (
                    <a
                      key={p.id}
                      href={p.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg border hover:shadow-md transition bg-card"
                    >
                      <div className="flex items-start gap-4">
                        <img src={cloudinaryFetch(((p.thumb || "/placeholder.svg").startsWith("http") || (p.thumb || "").startsWith("/") ? (p.thumb || "/placeholder.svg") : `${S3_BASE}/${p.thumb}`), { w: 120, h: 160, crop: "fill" })} alt={p.title} className="w-20 h-35 object-cover rounded" />
                        <div>
                          <h3 className="text-lg font-semibold">{p.title}</h3>
                          <p className="text-sm text-muted-foreground">{p.authors}</p>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                          <div className="mt-2 flex gap-2">
                            {p.tags.map((t) => (
                              <span key={t} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
        </div>
    </div>
  );
};

export default ReadingList;