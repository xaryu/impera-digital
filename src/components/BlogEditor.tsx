import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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

const BlogEditor = ({
  post,
  onClose,
}: {
  post: BlogPost | null; // null = new post
  onClose: () => void;
}) => {
  const isNew = !post;
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState(post?.category ?? "General");
  const [imageUrl, setImageUrl] = useState(post?.image_url ?? "");
  const [published, setPublished] = useState(post?.published ?? false);

  const queryClient = useQueryClient();

  const generateSlug = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew || slug === generateSlug(post?.title ?? "")) {
      setSlug(generateSlug(val));
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        slug,
        excerpt,
        content,
        category,
        image_url: imageUrl || null,
        published,
        published_at: published ? (post?.published_at ?? new Date().toISOString()) : null,
      };
      if (isNew) {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", post.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
      toast.success(isNew ? "Post created" : "Post updated");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog_posts"] });
      toast.success("Post deleted");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/90 backdrop-blur-sm p-4">
      <div className="bg-navy border border-gold/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/10">
          <h2 className="font-display text-xl font-bold text-cream">
            {isNew ? "New Post" : "Edit Post"}
          </h2>
          <button onClick={onClose} className="text-gold-muted hover:text-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div>
            <label className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2 block">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-navy-dark border border-gold/20 text-cream font-body px-4 py-3 focus:border-gold/50 outline-none transition-colors"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2 block">
              Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-navy-dark border border-gold/20 text-cream font-body px-4 py-3 focus:border-gold/50 outline-none transition-colors text-sm"
              placeholder="url-friendly-slug"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2 block">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-dark border border-gold/20 text-cream font-body px-4 py-3 focus:border-gold/50 outline-none transition-colors"
                placeholder="Brand Strategy"
              />
            </div>
            <div>
              <label className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2 block">
                Image URL
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-navy-dark border border-gold/20 text-cream font-body px-4 py-3 focus:border-gold/50 outline-none transition-colors text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2 block">
              Excerpt
            </label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full bg-navy-dark border border-gold/20 text-cream font-body px-4 py-3 focus:border-gold/50 outline-none transition-colors min-h-[80px] resize-none"
              placeholder="Brief summary..."
            />
          </div>

          <div>
            <label className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2 block">
              Content (Markdown)
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-navy-dark border border-gold/20 text-cream font-body px-4 py-3 focus:border-gold/50 outline-none transition-colors min-h-[300px] resize-y text-sm leading-relaxed"
              placeholder="## Your article content here..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gold/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPublished(!published)}
              className={`flex items-center gap-2 font-body text-xs tracking-wider uppercase px-4 py-2 border transition-colors ${
                published
                  ? "border-gold/40 text-gold"
                  : "border-gold/20 text-gold-muted"
              }`}
            >
              {published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {published ? "Published" : "Draft"}
            </button>

            {!isNew && (
              <button
                onClick={() => {
                  if (confirm("Delete this post permanently?")) {
                    deleteMutation.mutate();
                  }
                }}
                className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-destructive/70 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>

          <button
            onClick={() => saveMutation.mutate()}
            disabled={!title || !slug || saveMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 bg-gold text-navy-dark font-body text-xs font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
