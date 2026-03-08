import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import LocalizedLink from "@/components/LocalizedLink";
import { ArrowLeft, Clock, Linkedin, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const SITE_URL = "https://impera-digital.lovable.app";

const estimateReadTime = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const fetchPost = async (slug: string) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:team_members!blog_posts_author_id_fkey(id, name, role, photo_url)")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
};

const fetchRelatedPosts = async (category: string, currentId: string) => {
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, image_url, category, published_at")
    .eq("published", true)
    .eq("category", category)
    .neq("id", currentId)
    .order("published_at", { ascending: false })
    .limit(3);
  return data ?? [];
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: () => fetchPost(slug!),
    enabled: !!slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["related_posts", post?.category, post?.id],
    queryFn: () => fetchRelatedPosts(post!.category, post!.id),
    enabled: !!post,
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
          <h1 className="font-display text-4xl font-bold text-cream mb-4">{t("blogPage.postNotFound")}</h1>
          <LocalizedLink to="/blog" className="font-body text-gold hover:text-cream transition-colors">
            {t("blogPage.backToJournal")}
          </LocalizedLink>
        </div>
        <Footer />
      </div>
    );
  }

  const readTime = estimateReadTime(post.content);
  const shareUrl = `${SITE_URL}/blog/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);
  const shareText = encodeURIComponent(post.excerpt);
  const author = post.author as { id: string; name: string; role: string; photo_url: string | null } | null;

  const locale = i18n.language === "fr" ? "fr-FR" : i18n.language === "nl" ? "nl-NL" : "en-US";

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith("### ")) {
        elements.push(<h3 key={i} className="font-display text-xl font-bold text-cream mt-10 mb-4">{line.slice(4)}</h3>);
      } else if (line.startsWith("## ")) {
        elements.push(<h2 key={i} className="font-display text-2xl md:text-3xl font-bold text-cream mt-12 mb-6">{line.slice(3)}</h2>);
      } else if (line.startsWith("- **")) {
        elements.push(
          <li key={i} className="font-body text-gold-muted leading-relaxed ml-4 mb-2">
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-cream">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
          </li>
        );
      } else if (line.startsWith("**")) {
        elements.push(<p key={i} className="font-body text-gold-muted leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cream font-semibold">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />);
      } else if (line.trim() === "") {
        // skip
      } else {
        elements.push(<p key={i} className="font-body text-gold-muted leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cream">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-gold">$1</em>') }} />);
      }
      i++;
    }
    return elements;
  };

  return (
    <div className="min-h-screen bg-navy-dark">
      <SEO title={`${post.title} — Impera Journal`} description={post.excerpt} path={`/blog/${post.slug}`} ogImage={post.image_url || undefined} ogType="article" />
      <Navbar />

      <article className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <LocalizedLink to="/blog" className="inline-flex items-center gap-2 font-body text-sm text-gold/60 hover:text-gold transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" />
            {t("blogPage.backToJournalShort")}
          </LocalizedLink>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="font-body text-xs tracking-[0.3em] text-gold uppercase">{post.category}</span>
            <span className="text-gold-muted/30">•</span>
            <span className="font-body text-xs text-gold-muted/60">
              {post.published_at ? new Date(post.published_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }) : t("blogPage.draft")}
            </span>
            <span className="text-gold-muted/30">•</span>
            <span className="inline-flex items-center gap-1 font-body text-xs text-gold-muted/60">
              <Clock className="w-3 h-3" />
              {readTime} {t("blogPage.minRead")}
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-bold text-cream leading-tight mb-6">{post.title}</h1>

          {author && (
            <div className="flex items-center gap-4 mb-10">
              {author.photo_url ? (
                <img src={author.photo_url} alt={author.name} className="w-12 h-12 rounded-full object-cover border-2 border-gold/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center border-2 border-gold/30">
                  <span className="font-display text-gold text-lg font-bold">{author.name[0]}</span>
                </div>
              )}
              <div>
                <p className="font-body text-sm text-cream font-medium">{author.name}</p>
                <p className="font-body text-xs text-gold-muted/60">{author.role}</p>
              </div>
            </div>
          )}

          <p className="font-body text-lg text-gold-muted leading-relaxed mb-10 border-l-2 border-gold/30 pl-6">{post.excerpt}</p>

          {post.image_url && (
            <div className="mb-12 overflow-hidden rounded-lg">
              <img src={post.image_url} alt={post.title} className="w-full h-72 md:h-[28rem] object-cover" loading="lazy" />
            </div>
          )}

          <div className="prose-impera">{renderContent(post.content)}</div>

          <div className="mt-16 pt-8 border-t border-gold/10">
            <p className="font-body text-xs tracking-[0.3em] text-gold uppercase mb-4">{t("blogPage.shareArticle")}</p>
            <div className="flex items-center gap-3">
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold-muted hover:text-gold hover:border-gold/50 transition-colors" aria-label="Share on LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href={`https://x.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold-muted hover:text-gold hover:border-gold/50 transition-colors" aria-label="Share on X">
                <XIcon className="w-4 h-4" />
              </a>
              <a href={`mailto:?subject=${shareTitle}&body=${shareText}%0A%0A${encodeURIComponent(shareUrl)}`} className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-gold-muted hover:text-gold hover:border-gold/50 transition-colors" aria-label="Share via Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="px-6 pb-24">
          <div className="container mx-auto max-w-5xl">
            <div className="border-t border-gold/10 pt-16">
              <h2 className="font-display text-2xl font-bold text-cream mb-10 text-center">{t("blogPage.relatedArticles")}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((rp) => (
                  <LocalizedLink key={rp.id} to={`/blog/${rp.slug}`} className="group border border-gold/10 bg-navy/30 hover:border-gold/30 transition-all duration-500 rounded-lg overflow-hidden">
                    {rp.image_url && (
                      <div className="h-44 overflow-hidden">
                        <img src={rp.image_url} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="font-body text-[10px] tracking-[0.3em] text-gold uppercase">{rp.category}</span>
                      <h3 className="font-display text-lg font-bold text-cream mt-2 mb-2 leading-tight group-hover:text-gold transition-colors">{rp.title}</h3>
                      <p className="font-body text-xs text-gold-muted line-clamp-2">{rp.excerpt}</p>
                    </div>
                  </LocalizedLink>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
