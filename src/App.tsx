
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Blogs from "./pages/Blogs";
import WarStories from "./pages/WarStories";
import WarStory from "./pages/WarStory";
import ReadingList from "./pages/ReadingList";
import BookDetail from "./pages/BookDetail";
import Post from "./pages/Post";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/draft" element={<Home postSource="draft" />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/draft/blogs" element={<Blogs postSource="draft" />} />
              <Route path="/war-stories" element={<WarStories />} />
              <Route path="/war-stories/:slug" element={<WarStory />} />
              <Route path="/reading-list" element={<ReadingList />} />
              <Route path="/reading-list/book/:id" element={<BookDetail />} />
              <Route path="/blog/:slug" element={<Post />} />
              <Route path="/draft/blog/:slug" element={<Post postSource="draft" />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
