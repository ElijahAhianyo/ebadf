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
    tags: ["computer architecture",],
    status: "previously-read",
    description:
      "A classic guide to the history and fundamentals of computer systems.",
    externalLink: "https://www.codehiddenlanguage.com/",
    thoughts: "I love this book because it talks through the evolution of computer systems and walks you through building \
    certain components on the hardware level  from first principles. In my opinion this is a really good book if youre seeking \
    an entry level into computer architechture.",
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
    externalLink: "https://www.nand2tetris.org/",
    thoughts: "I read this book along side Code by Charles Petzold. It's typically coupled with the Nand2Tetris course. \
    I love the projects after each chapter which forces you to think through building a computer from the ground up.\
    The book uses custom emulators, languages, and tools to make it agnostic to any specific technology, however, I decided to implement \
    the projects in industry-standard languages and tools. Eg, I used verilog for the Hardware description language and Nasm for the assembler.",
  },
  {
    id: "ostep",
    title: "Operating Systems: Three Easy Pieces",
    author: "Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau",
    cover: "ostep.jpg",
    tags: ["operating systems", "computer science"],
    status: "currently-reading",
    description:
      "The book is centered around three conceptual pieces that are fundamental to operating systems: virtualization, concurrency, and persistence",
    externalLink: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
    thoughts: "This is one of the best technical books I've ever read. The authors do a great job of breaking down complex topics \
    with clear explanations and practical examples. My favorite thing about the books is the countless references and papers linked after \
    each chapter for further reading.",
  },
  {
    id: "the_little_book_of_semaphores",
    title: "The Little Book of Semaphores",
    author: "Allen B. Downey",
    cover: "the-little-book-of-semaphores.jpg",
    tags: ["concurrency", "programming"],
    status: "future",
    description:
      "This book introduces the principles of synchronization in concurrent programming.",
    externalLink: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
    thoughts: "",
  },
  {
    id: "the_art_of_multiprocessor_programming",
    title: "The Art of Multiprocessor Programming",
    author: "Maurice Herlihy, Nir Shavit, Victor Luchangco, Michael Spear",
    cover: "the-art-of-multiprocessor-programming.jpg",
    tags: ["concurrency", "programming"],
    status: "future",
    description:
      "Tips and philosophies to become a better software developer across your career.",
    externalLink: "https://www.amazon.com/Art-Multiprocessor-Programming-Maurice-Herlihy/dp/0124159508",
    thoughts: "",
  },
  {
    id: "the_garbage_collection_handbook",
    title: "The Garbage Collection Handbook",
    author: "Richard Jones, Antony Hosking, and Eliot Moss",
    cover: "the-garbage-collection-handbook.jpg",
    tags: ["garbage collection", "programming"],
    status: "future",
    description:
      "This book provides a comprehensive introduction to the concepts, algorithms, and implementation techniques used in garbage collection.",
    externalLink: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
    thoughts: "",
  },
  {
    id: "concurrency_the_work_of_leslie_lamport",
    title: "Concurrency: The Work of Leslie Lamport",
    author: "Leslie Lamport",
    cover: "concurrency-the-work-of-leslie-lamport.jpg",
    tags: ["concurrency", "programming"],
    status: "future",
    description:
      "This book is a celebration of Leslie Lamport's work on concurrency, interwoven in four-and-a-half decades of \
      an evolving industry: from the introduction of the first personal computer to an era when parallel and distributed \
      multiprocessors are abundant.",
    externalLink: "https://www.amazon.com/Concurrency-Works-Leslie-Lamport-Books/dp/1450372708",
    thoughts: "",
  },
  {
    id: "memory_systems_cache_dram_disk",
    title: "Memory Systems: Cache, DRAM, Disk",
    author: "Bruce Jacob, Spencer Ng, David Wang",
    cover: "memory-systems-cache-dram-disk.jpg",
    tags: ["memory", "programming"],
    status: "future",
    description:
      " An in-depth exploration of memory systems, covering cache architectures, DRAM technologies, and disk storage mechanisms.",
    externalLink: "https://www.amazon.com/Memory-Systems-Cache-DRAM-Disk/dp/0123797519",
    thoughts: "",
  },
  {
    id: "hackers_delight",
    title: "Hacker's Delight(2nd Edition)",
    author: "Henry S. Warren Jr.",
    cover: "hackers-delight.jpg",
    tags: ["programming", "algorithms"],
    status: "future",
    description:
      "The book is a collection of programming tricks and techniques for low-level programming and bit manipulation.",
    externalLink: "https://www.amazon.com/Hackers-Delight-2nd-Henry-Warren/dp/0321842685",
    thoughts: "",
  },
  {
    id: "the_cache_memory_book",
    title: "The Cache Memory Book",
    author: "Jim Handy",
    cover: "the-cache-memory-book.jpg",
    tags: ["memory", "programming"],
    status: "future",
    description:
      " The Cache Memory Book introduces systems designers to the concepts behind cache design. \
      The book teaches the basic cache concepts and more exotic techniques.",
    externalLink: "https://www.amazon.com/Memory-Morgan-Kaufmann-Computer-Architecture/dp/0123229804",
    thoughts: "",
  },
  {
    id: "mordern_computer_architecture_and_organization",
    title: "Modern Computer Architecture and Organization",
    author: "Jim Ledin",
    cover: "mordern-computer-architecture-and-organization.jpg",
    tags: ["architecture", "programming"],
    status: "future",
    description:
      "A no-nonsense, practical guide to current and future processor and computer architectures,\
       enabling you to design computer systems and develop better software applications across a variety of domains",
    externalLink: "https://www.amazon.com/Modern-Computer-Architecture-Organization-architectures/dp/1838984399",
    thoughts: "",
  },
  {
    id: "building_a_debugger",
    title: "Building a Debugger",
    cover: "building-a-debugger.jpg",
    author: "Sy Brand",
    tags: ["debugging", "programming"],
    status: "future",
    description:
      "Master the inner workings of your x64 Linux system and expand your OS expertise by writing your very own debugger using C++.",
    externalLink: "https://www.amazon.com/Building-Debugger-Sy-Brand/dp/171850408X/",
    thoughts: "",
  },
  {
    id: "operating_systems_from_0_to_1",
    title: "Operating Systems: From 0 to 1",
    cover: "operating-systems-o-to-1.png",
    author: "Tu, Do Hoang",
    tags: ["operating systems", "programming"],
    status: "currently-reading",
    description:
      "Master the inner workings of your x64 Linux system and expand your OS expertise by writing your very own debugger using C++.",
    externalLink: "https://github.com/tuhdo/os01?tab=readme-ov-file",
    thoughts: "Many operating systems books focus on the theoretical and kernel aspects of OS design. This book explores the \
    practical and hardware side of OS design. Basically a walkthrough of building a simple OS from scratch. I started reading this to gain a \
    deeper understanding of how OSes interact with hardware at a low level.",
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
