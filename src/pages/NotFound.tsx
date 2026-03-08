import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/LocalizedLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Home, Briefcase, Users, Mail, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=site:impera-digital.lovable.app+${encodeURIComponent(query)}`, "_blank");
    }
  };

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/services", label: "Services", icon: Briefcase },
    { to: "/about", label: "About", icon: Users },
    { to: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Page Not Found — Impera" description="The page you're looking for doesn't exist." path={location.pathname} />
      <Navbar />

      <main className="flex-1 flex items-center justify-center bg-navy-gradient py-32">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <p className="font-display text-[8rem] md:text-[10rem] font-bold leading-none text-gold/10 select-none mb-[-2rem]">
            404
          </p>

          <h1 className="font-display text-3xl md:text-5xl font-bold text-cream leading-tight mb-4">
            This Page Has Lost Its Command
          </h1>

          <p className="font-body text-gold-muted text-lg mb-10 max-w-lg mx-auto">
            The page you're looking for has been moved, removed, or never existed. Let us guide you back to familiar territory.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search our site..."
              className="w-full pl-11 pr-4 py-3.5 bg-transparent border border-gold/20 focus:border-gold/50 text-cream font-body text-sm placeholder:text-gold/30 outline-none transition-colors"
            />
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {links.map(({ to, label, icon: Icon }) => (
              <LocalizedLink
                key={to}
                to={to}
                className="group flex flex-col items-center gap-2 p-5 border border-gold/10 hover:border-gold/30 hover:gold-glow transition-all duration-500"
              >
                <Icon className="w-5 h-5 text-gold/60 group-hover:text-gold transition-colors" />
                <span className="font-body text-xs tracking-wider text-cream/70 group-hover:text-cream uppercase transition-colors">
                  {label}
                </span>
              </LocalizedLink>
            ))}
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Base
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;