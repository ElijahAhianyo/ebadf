import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getBookById, S3_BASE } from "@/lib/readingList";
import { cloudinaryFetch } from "@/utils/cloudinary";

const BookDetail = () => {
  const { id } = useParams();
  const book = id ? getBookById(id) : undefined;

  if (!book) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto py-16 text-center">
          <h2 className="text-2xl font-semibold">Book not found</h2>
          <p className="text-muted-foreground mt-4">We couldn't find that book.</p>
          <Link to="/reading-list" className="inline-flex items-center mt-6 text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to reading list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-3xl mx-auto py-16 space-y-8">
        <div className="flex items-start space-x-6">
          <img src={cloudinaryFetch(((book.cover || "/placeholder.svg").startsWith("http") || (book.cover || "").startsWith("/") ? (book.cover || "/placeholder.svg") : `${S3_BASE}/${book.cover}`), { w: 288, h: 384, crop: "fill" })} alt={book.title} className="w-36 h-48 object-cover rounded shadow" />
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">by {book.author}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {book.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-3">
              <a
                href={book.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                View on publisher site
              </a>
              <Link to="/reading-list" className="text-sm text-muted-foreground">
                Back to list
              </Link>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xl font-semibold">About</h2>
          <p className="text-muted-foreground mt-2">{book.description}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">My thoughts</h2>
          <p className="mt-2">{book.thoughts ?? "I haven't written my thoughts yet."}</p>
        </section>
      </div>
    </div>
  );
};

export default BookDetail;
