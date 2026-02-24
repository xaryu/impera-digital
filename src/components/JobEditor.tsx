import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface JobOpening {
  id: string;
  title: string;
  slug: string;
  department: string;
  type: string;
  location: string;
  short_description: string;
  full_description: string;
  requirements: string;
  benefits: string;
  published: boolean;
}

const emptyJob: Omit<JobOpening, "id"> = {
  title: "",
  slug: "",
  department: "",
  type: "Full-time",
  location: "",
  short_description: "",
  full_description: "",
  requirements: "",
  benefits: "",
  published: false,
};

const JobEditor = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<JobOpening | null>(null);
  const [form, setForm] = useState(emptyJob);

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_openings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobOpening[];
    },
  });

  useEffect(() => {
    if (editing) {
      const { id, ...rest } = editing;
      setForm(rest);
    }
  }, [editing]);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, slug: form.slug || generateSlug(form.title) };
      if (editing) {
        const { error } = await supabase.from("job_openings").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("job_openings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Job updated" : "Job created");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
      setEditing(null);
      setForm(emptyJob);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("job_openings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const togglePublish = useMutation({
    mutationFn: async (job: JobOpening) => {
      const { error } = await supabase
        .from("job_openings")
        .update({ published: !job.published })
        .eq("id", job.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
    },
  });

  const isFormMode = editing !== null || form.title !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-dark/80 backdrop-blur-sm overflow-y-auto py-10">
      <div className="relative bg-background border border-gold/20 p-8 w-full max-w-3xl my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display text-xl font-semibold text-foreground mb-6">
          Manage Job Openings
        </h2>

        {/* Job List */}
        {!isFormMode && (
          <>
            <button
              onClick={() => setForm(emptyJob)}
              className="flex items-center gap-2 mb-6 px-4 py-2 border border-gold/20 text-gold font-body text-sm tracking-wider uppercase hover:bg-gold/10 transition-colors"
              // trigger form mode by setting a title placeholder below
            >
              <Plus className="w-4 h-4" /> New Job
            </button>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between border border-border p-4"
                >
                  <div>
                    <h4 className="font-display text-sm font-semibold text-foreground">
                      {job.title}
                    </h4>
                    <p className="font-body text-xs text-muted-foreground">
                      {job.department} · {job.location}
                      {!job.published && " · Draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublish.mutate(job)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                      title={job.published ? "Unpublish" : "Publish"}
                    >
                      {job.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditing(job)}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this job?")) deleteMutation.mutate(job.id);
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Form — shown when "New Job" clicked or editing */}
        {(isFormMode || editing) && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
              <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated" />
              <Field label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} required />
              <Field label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
              <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} required />
            </div>
            <AreaField label="Short Description" value={form.short_description} onChange={(v) => setForm({ ...form, short_description: v })} rows={2} />
            <AreaField label="Full Description" value={form.full_description} onChange={(v) => setForm({ ...form, full_description: v })} rows={5} />
            <AreaField label="Requirements (use - for bullet points)" value={form.requirements} onChange={(v) => setForm({ ...form, requirements: v })} rows={5} />
            <AreaField label="Benefits (use - for bullet points)" value={form.benefits} onChange={(v) => setForm({ ...form, benefits: v })} rows={4} />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="accent-gold"
              />
              <span className="font-body text-sm text-muted-foreground">Published</span>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-3 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-60"
              >
                {saveMutation.isPending ? "Saving…" : editing ? "Update Job" : "Create Job"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(null); setForm(emptyJob); }}
                className="px-6 py-3 border border-gold/20 text-gold-muted font-body text-sm tracking-wider uppercase hover:bg-gold/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, required, placeholder }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string }) => (
  <div>
    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-1 block">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full bg-transparent border border-border focus:border-gold/50 px-3 py-2 font-body text-sm text-foreground outline-none transition-colors"
    />
  </div>
);

const AreaField = ({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows: number }) => (
  <div>
    <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-1 block">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-transparent border border-border focus:border-gold/50 px-3 py-2 font-body text-sm text-foreground outline-none transition-colors resize-none"
    />
  </div>
);

export default JobEditor;
