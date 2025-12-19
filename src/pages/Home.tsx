import { Link } from "react-router-dom";
import { getAllPosts } from "@/lib/posts";
import { getFeaturedProjects, getPersonalProjects, getOpenSourceProjects } from "@/lib/projects";
import { Github, Linkedin, Mail, ArrowRight, Code, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";

const Home = () => {
  const posts = getAllPosts().slice(0, 3); // Show only first 3 posts
  const featuredProjects = getFeaturedProjects().slice(0, 3);
  const personalProjects = getPersonalProjects().slice(0, 2);
  const openSourceProjects = getOpenSourceProjects().slice(0, 2);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Biography Section */}
        <section className="space-y-8">
          <div className="space-y-6">
            <blockquote className="text-xl italic text-muted-foreground border-l-4 border-primary pl-6">
              "The only true wisdom is in knowing you know nothing."
              <footer className="text-sm mt-2 not-italic">— Socrates</footer>
            </blockquote>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Hey, I'm Elijah Ahianyo
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm a passionate software engineer from Ghana who loves to code.
                My interests currently lie in OSS, web dev tooling and systems programming.
                I use Rust daily, but I also write C, Python and Assembly when I have to. I am currently a maintainer
                of the <u><a href="https://github.com/cot-rs/cot">Cot</a></u> Rust web framework
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:elijahahianyo@gmail.com" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/ElijahAhianyo" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://linkedin.com/in/elijah-ahianyo" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
            </Button>
          </div>
        </section>

        {/* Recent Blog Posts */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Posts</h2>
            <Button variant="outline" asChild>
              <Link to="/blogs">View All Posts</Link>
            </Button>
          </div>

          <div className="grid gap-6">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group p-6 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <time dateTime={post.date}>{post.date}</time>
                    <span className="mx-2">•</span>
                    <span>{post.readingTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Projects */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Projects</h2>
            <Button variant="outline" asChild>
              <Link to="/projects">View All Projects</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Personal Projects Preview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Personal Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Side projects and personal experiments
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="group">
              <Link to="/projects?filter=personal" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personalProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* Open Source Projects Preview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Open Source Impact</h2>
                <p className="text-sm text-muted-foreground">
                  Projects where I've made meaningful contributions
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="group">
              <Link to="/projects?filter=opensource" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openSourceProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
