export type Book = {
  id: string;
  title: string;
  author: string;
  cover?: string;
  tags: string[];
  status: "currently-reading" | "future" | "previously-read";
  description?: string;
  externalLink?: string;
  thoughts?: string;
};

// S3 base where cover/thumb images are stored
export const S3_BASE = "https://ebadf.s3.eu-north-1.amazonaws.com/covers";

export const books: Book[] = [
  {
    id: "code",
    title: "Code: The Hidden Language of Computer Hardware and Software",
    author: "Charles Petzold",
    cover: "code.jpg",
    tags: ["programming", "computer science"],
    status: "previously-read",
    description:
      "A sweeping narrative of human history that explores how Homo sapiens came to dominate the planet.",
    externalLink: "https://www.ynharari.com/book/sapiens-2/",
    thoughts: "A must-read. I keep returning to the sections on imagined orders.",
  },
  {
    id: "the-elements-of-computing-systems",
    title: "The Elements of Computing Systems",
    author: "Noam Nisan, Shimon Schocken",
    cover: "the-elements-of-computing-systems.jpg",
    tags: ["computer science", "systems"],
    status: "previously-read",
    description:
      "A sweeping narrative of human history that explores how Homo sapiens came to dominate the planet.",
    externalLink: "https://www.ynharari.com/book/sapiens-2/",
    thoughts: "A must-read. I keep returning to the sections on imagined orders.",
  },
  {
    id: "ostep",
    title: "Operating Systems: Three Easy Pieces",
    author: "Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau",
    cover: "ostep.jpg",
    tags: ["operating systems", "computer science"],
    status: "currently-reading",
    description:
      "Techniques for improving codebases incrementally without breaking behavior.",
    externalLink: "https://martinfowler.com/books/refactoring.html",
    thoughts: "Working through examples is helping me see small, safe refactors.",
  },
  {
    id: "the_little_book_of_semaphores",
    title: "The Little Book of Semaphores",
    author: "Allen B. Downey",
    cover: "the-little-book-of-semaphores.jpg",
    tags: ["concurrency", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
  {
    id: "the_art_of_multiprocessor_programming",
    title: "The Art of Multiprocessor Programming",
    author: "Maurice Herlihy, Nir Shavit",
    cover: "the-art-of-multiprocessor-programming.jpg",
    tags: ["concurrency", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://www.amazon.com/Art-Multiprocessor-Programming-Maurice-Herlihy/dp/0124159508",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
  {
    id: "the_garbage_collection_handbook",
    title: "The Garbage Collection Handbook",
    author: "Richard Jones, Antony Hosking, and Eliot Moss",
    cover: "the-garbage-collection-handbook.jpg",
    tags: ["garbage collection", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
  {
    id: "concurrency_the_work_of_leslie_lamport",
    title: "Concurrency: The Work of Leslie Lamport",
    author: "Leslie Lamport",
    cover: "concurrency-the-work-of-leslie-lamport.jpg",
    tags: ["concurrency", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://www.amazon.com/Concurrency-Works-Leslie-Lamport-Books/dp/1450372708",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
  {
    id: "memory_systems_cache_dram_disk",
    title: "Memory Systems: Cache, DRAM, Disk",
    author: "Bruce Jacob, Spencer Ng, David Wang",
    cover: "memory-systems-cache-dram-disk.jpg",
    tags: ["memory", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://www.amazon.com/Memory-Systems-Cache-DRAM-Disk/dp/0123797519",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
  {
    id: "hackers_delight",
    title: "Hacker's Delight(2nd Edition)",
    author: "Henry S. Warren Jr.",
    cover: "hackers-delight.jpg",
    tags: ["programming", "algorithms"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://www.amazon.com/Hackers-Delight-2nd-Henry-Warren/dp/0321842685",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
  {
    id: "the_cache_memory_book",
    title: "The Cache Memory Book",
    author: "Morgan Kaufmann",
    cover: "the-cache-memory-book.jpg",
    tags: ["memory", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://www.amazon.com/Memory-Morgan-Kaufmann-Computer-Architecture/dp/0123229804",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
  {
    id: "mordern_computer_architecture_and_organization",
    title: "Modern Computer Architecture and Organization",
    author: "Jim Ledin",
    cover: "mordern-computer-architecture-and-organization.jpg",
    tags: ["architecture", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://www.amazon.com/Modern-Computer-Architecture-Organization-architectures/dp/1838984399",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
  {
    id: "building_a_debugger",
    title: "Building a Debugger",
    cover: "building-a-debugger.jpg",
    author: "Sy Brand",
    tags: ["debugging", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://www.amazon.com/Building-Debugger-Sy-Brand/dp/171850408X/",
    thoughts: "Planning to read this during my next tooling sprint.",
  },
];

export function getBookById(id: string) {
  return books.find((b) => b.id === id);
}

export type Article = {
  id: string;
  title: string;
  authors: string;
  thumb?: string;
  tags: string[];
  externalLink: string;
  description?: string;
};

export const articles: Article[] = [
//   {
//     id: "ergonomic-async-trait-objects",
//     title: "Ergonomic async trait objects in Rust",
//     authors: "Elijah Ahianyo",
//     thumb: "code.jpg",
//     tags: ["rust", "async", "systems"],
//     externalLink: "https://eli.example.com/ergonomic-async-trait-objects-rust",
//     description: "A deep-dive into ergonomic async trait objects and their implementation trade-offs.",
//   },
];

export function getArticleById(id: string) {
  return articles.find((a) => a.id === id);
}

export type Paper = {
  id: string;
  title: string;
  authors: string;
  thumb?: string;
  tags: string[];
  externalLink: string;
  venue?: string;
  year?: number;
  description?: string;
};

export const papers: Paper[] = [
  {
    id: "what-every-programmer-should-know-about-memory",
    title: "What Every Programmer Should Know About Memory",
    authors: "Ulrich Drepper",
    thumb: "what-every-programmer-should-know-about-memory.png",
    tags: ["distributed", "consensus"],
    externalLink: "https://people.freebsd.org/~lstewart/articles/cpumemory.pdf",
    venue: "Memory Systems",
    year: 2001,
    description: "An in-depth look at memory architectures and their implications for programmers.",
  },
];

export function getPaperById(id: string) {
  return papers.find((p) => p.id === id);
}
