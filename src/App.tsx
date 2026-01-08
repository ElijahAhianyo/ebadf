
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Blogs from "./pages/Blogs";
import ReadingList from "./pages/ReadingList";
import Post from "./pages/Post";
import NotFound from "./pages/NotFound";
import type { RouteRecord } from "vite-react-ssg";
import { Helmet } from "react-helmet-async";

const queryClient = new QueryClient();

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* Default head tags; pages can override with Helmet */}
        <Helmet>
          <title>Elijah Ahianyo — Portfolio</title>
          <meta name="description" content="Elijah Ahianyo — software engineer. Exploring design, development, and creative thoughts." />
        </Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export const routes: RouteRecord[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'projects', element: <Projects /> },
      { path: 'blogs', element: <Blogs /> },
      { path: 'reading-list', element: <ReadingList /> },
      { path: 'blog/:slug', element: <Post /> },
      { path: '*', element: <NotFound /> }
    ]
  }
];

export default RootLayout;
