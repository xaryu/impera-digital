import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, LogOut, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { signOutAdmin, useAdmin } from "@/hooks/use-admin";
import { useDeleteRow } from "@/hooks/use-delete-row";
import ImperaLogo from "@/components/common/ImperaLogo";
import AdminLogin from "@/components/admin/AdminLogin";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import BlogEditor from "@/components/admin/BlogEditor";
import JobEditor, { type JobOpening } from "@/components/admin/JobEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BlogPost = Tables<"blog_posts">;

// `undefined` = editor closed, `null` = creating a new item.
type EditorTarget<T> = T | null | undefined;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });

const StatusBadge = ({ published }: { published: boolean }) => (
  <span
    className={`font-body text-[10px] tracking-wider uppercase px-2 py-0.5 border rounded ${
      published ? "border-gold/40 text-gold" : "border-gold/15 text-gold-muted/70"
    }`}
  >
    {published ? "Published" : "Draft"}
  </span>
);

type ListRowProps = {
  title: string;
  meta: string;
  published: boolean;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
};

const ListRow = ({ title, meta, published, onEdit, onDelete, deleting }: ListRowProps) => (
  <li className="flex items-center justify-between gap-4 border border-gold/10 bg-navy/30 hover:border-gold/30 transition-colors rounded-lg px-5 py-4">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h3 className="font-display text-base font-semibold text-cream truncate">{title}</h3>
        <StatusBadge published={published} />
      </div>
      <p className="font-body text-xs text-gold-muted/70 truncate">{meta}</p>
    </div>
    <div className="shrink-0 flex items-center gap-5">
      <button
        onClick={onEdit}
        className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-gold/70 hover:text-gold transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
      <ConfirmDelete itemLabel={title} onConfirm={onDelete}>
        <button
          disabled={deleting}
          className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-destructive/60 hover:text-destructive transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </ConfirmDelete>
    </div>
  </li>
);

const PanelHeader = ({ count, noun, onNew }: { count: number; noun: string; onNew: () => void }) => (
  <div className="flex items-center justify-between mb-6">
    <p className="font-body text-sm text-gold-muted">
      {count} {count === 1 ? noun : `${noun}s`}
    </p>
    <button
      onClick={onNew}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold text-navy-dark font-body text-xs font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors rounded"
    >
      <Plus className="w-4 h-4" /> New {noun}
    </button>
  </div>
);

const EmptyList = ({ text }: { text: string }) => (
  <p className="border border-dashed border-gold/20 rounded-lg p-10 text-center font-body text-sm text-gold-muted">{text}</p>
);

const ListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-[74px] bg-gold/5 animate-pulse rounded-lg" />
    ))}
  </div>
);

const BlogPanel = () => {
  const [editing, setEditing] = useState<EditorTarget<BlogPost>>(undefined);
  const deleteMutation = useDeleteRow("blog_posts", "Post deleted");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog_posts", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PanelHeader count={posts.length} noun="post" onNew={() => setEditing(null)} />
      {isLoading ? (
        <ListSkeleton />
      ) : posts.length === 0 ? (
        <EmptyList text="No blog posts yet. Create the first one." />
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <ListRow
              key={post.id}
              title={post.title}
              meta={`${post.category} · /blog/${post.slug} · updated ${formatDate(post.updated_at)}`}
              published={post.published}
              onEdit={() => setEditing(post)}
              onDelete={() => deleteMutation.mutate(post.id)}
              deleting={deleteMutation.isPending && deleteMutation.variables === post.id}
            />
          ))}
        </ul>
      )}
      {editing !== undefined && <BlogEditor post={editing} onClose={() => setEditing(undefined)} />}
    </>
  );
};

const CareersPanel = () => {
  const [editing, setEditing] = useState<EditorTarget<JobOpening>>(undefined);
  const deleteMutation = useDeleteRow("job_openings", "Job deleted");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["job-openings", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_openings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PanelHeader count={jobs.length} noun="job" onNew={() => setEditing(null)} />
      {isLoading ? (
        <ListSkeleton />
      ) : jobs.length === 0 ? (
        <EmptyList text="No job openings yet. Create the first one." />
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <ListRow
              key={job.id}
              title={job.title}
              meta={`${job.department} · ${job.type} · ${job.location} · updated ${formatDate(job.updated_at)}`}
              published={job.published}
              onEdit={() => setEditing(job)}
              onDelete={() => deleteMutation.mutate(job.id)}
              deleting={deleteMutation.isPending && deleteMutation.variables === job.id}
            />
          ))}
        </ul>
      )}
      {editing !== undefined && <JobEditor job={editing} onClose={() => setEditing(undefined)} />}
    </>
  );
};

const Dashboard = ({ email }: { email: string }) => (
  <div className="min-h-screen bg-navy-dark">
    <header className="border-b border-gold/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ImperaLogo className="h-8" />
          <span className="font-body text-xs tracking-[0.3em] text-gold uppercase">Admin</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden sm:inline font-body text-xs text-gold-muted">{email}</span>
          <Link to="/" className="flex items-center gap-1.5 font-body text-xs text-gold-muted hover:text-gold transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> View site
          </Link>
          <button onClick={signOutAdmin} className="flex items-center gap-1.5 font-body text-xs text-gold-muted hover:text-gold transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </div>
    </header>

    <main className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-cream mb-8">Content</h1>
      <Tabs defaultValue="blog">
        <TabsList className="bg-navy border border-gold/10 mb-8">
          <TabsTrigger value="blog" className="font-body text-xs tracking-wider uppercase data-[state=active]:bg-gold data-[state=active]:text-navy-dark">
            Blog posts
          </TabsTrigger>
          <TabsTrigger value="careers" className="font-body text-xs tracking-wider uppercase data-[state=active]:bg-gold data-[state=active]:text-navy-dark">
            Careers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="blog">
          <BlogPanel />
        </TabsContent>
        <TabsContent value="careers">
          <CareersPanel />
        </TabsContent>
      </Tabs>
    </main>
  </div>
);

const CenteredScreen = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-navy-dark flex items-center justify-center px-6">{children}</div>
);

// Not linked from anywhere on the site. Being hidden is not the protection:
// only accounts with the 'admin' role can read drafts or write, enforced by RLS.
const Admin = () => {
  const { session, isAdmin, loading } = useAdmin();

  let content: React.ReactNode;
  if (loading) {
    content = (
      <CenteredScreen>
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" aria-label="Loading" />
      </CenteredScreen>
    );
  } else if (!session) {
    content = (
      <CenteredScreen>
        <AdminLogin />
      </CenteredScreen>
    );
  } else if (!isAdmin) {
    content = (
      <CenteredScreen>
        <div className="max-w-md text-center border border-gold/20 bg-navy/50 rounded-lg p-10">
          <ShieldAlert className="w-7 h-7 text-gold mx-auto mb-5" aria-hidden="true" />
          <h1 className="font-display text-xl font-bold text-cream mb-3">No admin access</h1>
          <p className="font-body text-sm text-gold-muted mb-8">
            {session.user.email} is signed in but doesn't have the admin role.
          </p>
          <button
            onClick={signOutAdmin}
            className="px-8 py-3 border border-gold/40 text-gold font-body text-xs tracking-wider uppercase hover:bg-gold/10 transition-colors rounded"
          >
            Sign out
          </button>
        </div>
      </CenteredScreen>
    );
  } else {
    content = <Dashboard email={session.user.email ?? ""} />;
  }

  return (
    <>
      <Helmet>
        <title>Admin — Impera</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {content}
    </>
  );
};

export default Admin;
