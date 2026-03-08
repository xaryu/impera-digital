import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollProgress from "./components/ScrollProgress";
import PageLoader from "./components/PageLoader";
import LanguageLayout from "./components/LanguageLayout";
import CookieConsent from "./components/CookieConsent";
import { useTrackingConsent } from "./hooks/use-tracking-consent";

import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Careers from "./pages/Careers";
import CareerPost from "./pages/CareerPost";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Methodology from "./pages/Methodology";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <>
    <Route index element={<Index />} />
    <Route path="services" element={<Services />} />
    <Route path="about" element={<About />} />
    <Route path="contact" element={<Contact />} />
    <Route path="blog" element={<Blog />} />
    <Route path="blog/:slug" element={<BlogPost />} />
    <Route path="careers" element={<Careers />} />
    <Route path="careers/:slug" element={<CareerPost />} />
    <Route path="methodology" element={<Methodology />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="terms" element={<Terms />} />
  </>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollProgress />
          <PageLoader>
            <Routes>
              {/* English (no prefix) */}
              <Route element={<LanguageLayout />}>
                {AppRoutes()}
              </Route>
              {/* French & Dutch (with prefix) */}
              <Route path=":lang" element={<LanguageLayout />}>
                {AppRoutes()}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageLoader>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
