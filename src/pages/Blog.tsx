import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminAuth from "@/components/AdminAuth";
import BlogEditor from "@/components/BlogEditor";
import { Plus, Pencil, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  published: boolean;
  published_at: string | null;
};

const fetchPosts = async (isAdmin: boolean): Promise<BlogPost[]> => {
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const Blog = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null | undefined>(undefined);
  // undefined = closed, null = new post, BlogPost = editing

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAdmin(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog_posts", isAdmin],
    queryFn: () => fetchPosts(isAdmin),
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Draft";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-navy-dark">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            Insights & Perspectives
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-cream leading-tight mb-6">
            The Impera Journal
          </h1>
          <p className="font-body text-gold-muted max-w-2xl mx-auto leading-relaxed">
            Strategic thinking, design philosophy, and industry insights from the minds behind premium digital experiences.
          </p>
          {isAdmin && (
            <button
              onClick={() => setEditingPost(null)}
              className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-gold text-navy-dark font-body text-xs font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          )}
        </div>
      </section>

      {isLoading ? (
        <section className="px-6 pb-24">
          <div className="container mx-auto">
            <div className="h-72 bg-gold/5 animate-pulse mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-80 bg-gold/5 animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Featured Post */}
          {featured && (
            <section className="px-6 pb-16">
              <div className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-0 border border-gold/20 overflow-hidden relative group">
                  <Link to={`/blog/${featured.slug}`} className="h-72 md:h-auto overflow-hidden block">
                    <img
                      src={featured.image_url || ""}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                  <div className="p-10 md:p-14 flex flex-col justify-center bg-navy/50">
                    <span className="font-body text-xs tracking-[0.3em] text-gold uppercase mb-4">
                      Featured — {featured.category}
                      {!featured.published && (
                        <span className="ml-2 text-destructive/80">(Draft)</span>
                      )}
                    </span>
                    <Link to={`/blog/${featured.slug}`}>
                      <h2 className="font-display text-2xl md:text-3xl font-bold text-cream mb-4 leading-tight hover:text-gold transition-colors">
                        {featured.title}
                      </h2>
                    </Link>
                    <p className="font-body text-gold-muted leading-relaxed mb-6">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-xs text-gold-muted/60">
                        {formatDate(featured.published_at)}
                      </span>
                      <div className="flex items-center gap-3">
                        {isAdmin && (
                          <button
                            onClick={() => setEditingPost(featured)}
                            className="font-body text-xs text-gold/50 hover:text-gold transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <Link
                          to={`/blog/${featured.slug}`}
                          className="font-body text-sm text-gold tracking-wider uppercase hover:text-cream transition-colors"
                        >
                          Read Article →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Posts Grid */}
          {rest.length > 0 && (
            <section className="px-6 pb-24">
              <div className="container mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((post) => (
                    <article
                      key={post.id}
                      className="border border-gold/10 bg-navy/30 hover:border-gold/30 transition-all duration-500 group relative"
                    >
                      <Link to={`/blog/${post.slug}`} className="block h-52 overflow-hidden">
                        <img
                          src={post.image_url || ""}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </Link>
                      <div className="p-8">
                        <span className="font-body text-xs tracking-[0.3em] text-gold uppercase">
                          {post.category}
                          {!post.published && (
                            <span className="ml-2 text-destructive/80">(Draft)</span>
                          )}
                        </span>
                        <Link to={`/blog/${post.slug}`}>
                          <h3 className="font-display text-xl font-bold text-cream mt-3 mb-3 leading-tight hover:text-gold transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="font-body text-sm text-gold-muted leading-relaxed mb-6">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-body text-xs text-gold-muted/60">
                            {formatDate(post.published_at)}
                          </span>
                          <div className="flex items-center gap-3">
                            {isAdmin && (
                              <button
                                onClick={() => setEditingPost(post)}
                                className="text-gold/40 hover:text-gold transition-colors"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                            <Link
                              to={`/blog/${post.slug}`}
                              className="font-body text-xs text-gold tracking-wider uppercase hover:text-cream transition-colors"
                            >
                              Read →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Admin toggle */}
      <section className="py-12 bg-navy-dark text-center relative">
        <div className="absolute bottom-4 right-6">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-body text-xs text-gold/40 hover:text-gold/80 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Exit Admin
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 font-body text-xs text-gold/20 hover:text-gold/60 transition-colors"
            >
              <Settings className="w-3 h-3" />
              Admin
            </button>
          )}
        </div>
      </section>

      {showAuthModal && (
        <AdminAuth
          onClose={() => setShowAuthModal(false)}
          onLoggedIn={() => setIsAdmin(true)}
        />
      )}

      {editingPost !== undefined && (
        <BlogEditor
          post={editingPost}
          onClose={() => setEditingPost(undefined)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Blog;
