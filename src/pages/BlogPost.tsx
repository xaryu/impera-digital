import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const fetchPost = async (slug: string) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: () => fetchPost(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-dark">
        <Navbar />
        <div className="pt-32 pb-24 px-6">
          <div className="container mx-auto max-w-3xl">
            <div className="h-8 w-48 bg-gold/10 animate-pulse mb-8" />
            <div className="h-12 w-full bg-gold/10 animate-pulse mb-4" />
            <div className="h-6 w-2/3 bg-gold/10 animate-pulse mb-12" />
            <div className="h-72 w-full bg-gold/10 animate-pulse mb-12" />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-gold/10 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-navy-dark">
        <Navbar />
        <div className="pt-32 pb-24 px-6 text-center">
          <h1 className="font-display text-4xl font-bold text-cream mb-4">Post Not Found</h1>
          <Link to="/blog" className="font-body text-gold hover:text-cream transition-colors">
            ← Back to Journal
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Simple markdown-like rendering: headers, bold, lists, paragraphs
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="font-display text-xl font-bold text-cream mt-10 mb-4">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="font-display text-2xl md:text-3xl font-bold text-cream mt-12 mb-6">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("- **")) {
        elements.push(
          <li key={i} className="font-body text-gold-muted leading-relaxed ml-4 mb-2">
            <span
              dangerouslySetInnerHTML={{
                __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-cream">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>'),
              }}
            />
          </li>
        );
      } else if (line.startsWith("**")) {
        elements.push(
          <p
            key={i}
            className="font-body text-gold-muted leading-relaxed mb-4"
            dangerouslySetInnerHTML={{
              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cream font-semibold">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>'),
            }}
          />
        );
      } else if (line.trim() === "") {
        // skip empty lines
      } else {
        elements.push(
          <p
            key={i}
            className="font-body text-gold-muted leading-relaxed mb-4"
            dangerouslySetInnerHTML={{
              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cream">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-gold">$1</em>').replace(/''(.*?)''/g, "'$1'"),
            }}
          />
        );
      }
      i++;
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-navy-dark">
      <Navbar />

      <article className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-body text-sm text-gold/60 hover:text-gold transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>

          {/* Meta */}
          <div className="mb-8">
            <span className="font-body text-xs tracking-[0.3em] text-gold uppercase">
              {post.category}
            </span>
            <span className="font-body text-xs text-gold-muted/40 mx-4">•</span>
            <span className="font-body text-xs text-gold-muted/60">
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Draft"}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cream leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="font-body text-lg text-gold-muted leading-relaxed mb-10 border-l-2 border-gold/30 pl-6">
            {post.excerpt}
          </p>

          {/* Hero image */}
          {post.image_url && (
            <div className="mb-12 overflow-hidden">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-72 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose-impera">{renderContent(post.content)}</div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
