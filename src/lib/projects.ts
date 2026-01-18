export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  url: string;
  githubUrl?: string;
  image?: string;
  technologies: string[];
  category: 'personal' | 'opensource';
  featured: boolean;
  impact?: string; // For open source projects
  date: string;
  status: 'active' | 'completed' | 'archived';
}

export const projects: Project[] = [
  // Personal Projects
  {
    id: 'reflex-type-animation',
    title: 'Reflex Type Animation',
    description: 'a port of the react-type-animation library to reflex',
    longDescription: 'A port of the react-type-animation library to reflex. It is a library that allows you to create type animations in reflex.',
    url: 'https://github.com/ElijahAhianyo/reflex-type-animation',
    githubUrl: 'https://github.com/ElijahAhianyo/reflex-type-animation',
    technologies: ["Reflex", "Python"],
    category: 'personal',
    featured: false,
    date: '2024-03-21',
    status: 'archived'
  },
  {
    id: 'cot-basic-auth',
    title: 'Cot Basic Auth',
    description: 'a basic auth app built with cot.rs',
    longDescription: 'A basic auth app built with cot.rs. This features functionalities like registration, login, logout, and password reset.',
    url: 'https://github.com/ElijahAhianyo/cot-basic-auth',
    githubUrl: 'https://github.com/ElijahAhianyo/cot-basic-auth',
    technologies: ['Cot', 'Rust'],
    category: 'personal',
    featured: false,
    date: '2025-07-15',
    status: 'active'
  },
  {
    id: 'ser',
    title: 'Ser',
    description: 'an unfinished toy programming language built with rust',
    longDescription: 'A simple programming language built with Rust.',
    url: 'https://github.com/ElijahAhianyo/ser',
    githubUrl: 'https://github.com/ElijahAhianyo/ser',
    technologies: ["Rust"],
    category: 'personal',
    featured: false,
    date: '2025-08-17',
    status: 'active'
  },

  {
    id: 'xmalloc',
    title: 'Xmalloc',
    description: 'a rudimentary memory allocator written in aarch64 assembly for educational purposes',
    longDescription: 'A simple memory allocator built with aarch64 assembly for educational purposes.',
    url: 'https://github.com/ElijahAhianyo/xmalloc',
    githubUrl: 'https://github.com/ElijahAhianyo/xmalloc',
    technologies: ["Assembly", "aarch64"],
    category: 'personal',
    featured: false,
    date: '2025-11-10',
    status: 'active'
  },
  
  // Open Source Projects
  {
    id: 'reflex',
    title: 'Reflex',
    description: 'building web apps with pure python',
    longDescription: 'I was a core team member of the Reflex project from 2023 to 2025. I also worked on some internal tools like the Reflex Hosting platform, the Reflex CLI and the reflex AI tool.',
    url: 'https://reflex.dev',
    githubUrl: 'https://github.com/reflex-dev/reflex',
    technologies: ['Python', 'Nextjs', 'Javascript', 'FastAPI'],
    category: 'opensource',
    featured: true,
    impact: '28000+ GitHub stars',
    date: '2023-03-06',
    status: 'completed'
  },
  {
    id: 'cot-rs',
    title: 'Cot.rs',
    description: 'a web framework for rust',
    longDescription: 'I\'m currently a maintainer of the project.',
    url: 'https://github.com/cot-rs/cot',
    githubUrl: 'https://github.com/cot-rs/cot',
    technologies: ['Rust'],
    category: 'opensource',
    featured: true,
    impact: '800+ GitHub stars',
    date: '2025-03-15',
    status: 'active'
  },
  {
    id: 'charlotte-os',
    title: 'Charlotte OS',
    description: 'a rust operating system',
    longDescription: 'I\'m currently a maintainer of the project.',
    url: 'https://codeberg.org/CharlotteOS',
    githubUrl: 'https://codeberg.org/CharlotteOS',
    technologies: ['Rust'],
    category: 'opensource',
    featured: true,
    impact: '10+ GitHub stars',
    date: '2025-12-01',
    status: 'active'
  },
];

export function getPersonalProjects(): Project[] {
  return projects.filter(project => project.category === 'personal');
}

export function getOpenSourceProjects(): Project[] {
  return projects.filter(project => project.category === 'opensource');
}

export function getFeaturedProjects(): Project[] {
  return projects.filter(project => project.featured);
}

export function getProjectById(id: string): Project | undefined {
  return projects.find(project => project.id === id);
}
