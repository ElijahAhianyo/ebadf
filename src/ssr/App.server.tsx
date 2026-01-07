import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaticRouter } from 'react-router-dom/server';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import Blogs from '@/pages/Blogs';
import ReadingList from '@/pages/ReadingList';
import Post from '@/pages/Post';
import NotFound from '@/pages/NotFound';
import { Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient();

const AppServer = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/reading-list" element={<ReadingList />} />
              <Route path="/blog/:slug" element={<Post />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default AppServer;
