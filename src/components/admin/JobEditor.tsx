import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Save, Trash2, Eye, EyeOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { useDeleteRow } from "@/hooks/use-delete-row";

export type JobOpening = Tables<"job_openings">;

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const inputClass =
  "w-full bg-navy-dark border border-gold/20 text-cream font-body px-4 py-3 focus:border-gold/50 outline-none transition-colors rounded";
const labelClass = "font-body text-xs tracking-[0.2em] text-gold uppercase mb-2 block";

const JobEditor = ({ job, onClose }: { job: JobOpening | null; onClose: () => void }) => {
  const isNew = !job;
  const [title, setTitle] = useState(job?.title ?? "");
  const [slug, setSlug] = useState(job?.slug ?? "");
  const [department, setDepartment] = useState(job?.department ?? "");
  const [type, setType] = useState(job?.type ?? "Full-time");
  const [location, setLocation] = useState(job?.location ?? "");
  const [shortDescription, setShortDescription] = useState(job?.short_description ?? "");
  const [fullDescription, setFullDescription] = useState(job?.full_description ?? "");
  const [requirements, setRequirements] = useState(job?.requirements ?? "");
  const [benefits, setBenefits] = useState(job?.benefits ?? "");
  const [published, setPublished] = useState(job?.published ?? false);

  const queryClient = useQueryClient();

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew || slug === generateSlug(job?.title ?? "")) {
      setSlug(generateSlug(val));
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        slug: slug || generateSlug(title),
        department,
        type,
        location,
        short_description: shortDescription,
        full_description: fullDescription,
        requirements,
        benefits,
        published,
      };
      const { error } = isNew
        ? await supabase.from("job_openings").insert(payload)
        : await supabase.from("job_openings").update(payload).eq("id", job.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
      toast.success(isNew ? "Job created" : "Job updated");
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useDeleteRow("job_openings", "Job deleted");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/90 backdrop-blur-sm p-4">
      <div className="bg-navy border border-gold/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/10">
          <h2 className="font-display text-xl font-bold text-cream">{isNew ? "New Job" : "Edit Job"}</h2>
          <button onClick={onClose} className="text-gold-muted hover:text-cream transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inputClass} placeholder="Senior Automation Engineer" />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={`${inputClass} text-sm`} placeholder="url-friendly-slug" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} placeholder="Engineering" />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <input value={type} onChange={(e) => setType(e.target.value)} className={inputClass} placeholder="Full-time" />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Leuven / Remote" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Short Description</label>
            <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={`${inputClass} min-h-[70px] resize-none`} placeholder="One or two lines shown in the job list..." />
          </div>
          <div>
            <label className={labelClass}>Full Description</label>
            <Textarea value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} className={`${inputClass} min-h-[160px] resize-y text-sm leading-relaxed`} />
          </div>
          <div>
            <label className={labelClass}>Requirements (use - for bullet points)</label>
            <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className={`${inputClass} min-h-[120px] resize-y text-sm leading-relaxed`} placeholder={"- 5+ years of...\n- Fluent in..."} />
          </div>
          <div>
            <label className={labelClass}>Benefits (use - for bullet points)</label>
            <Textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} className={`${inputClass} min-h-[100px] resize-y text-sm leading-relaxed`} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gold/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPublished(!published)}
              className={`flex items-center gap-2 font-body text-xs tracking-wider uppercase px-4 py-2 border transition-colors rounded ${
                published ? "border-gold/40 text-gold" : "border-gold/20 text-gold-muted"
              }`}
            >
              {published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {published ? "Published" : "Draft"}
            </button>

            {!isNew && (
              <ConfirmDelete itemLabel={job.title} onConfirm={() => deleteMutation.mutate(job.id, { onSuccess: onClose })}>
                <button className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-destructive/70 hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </ConfirmDelete>
            )}
          </div>

          <button
            onClick={() => saveMutation.mutate()}
            disabled={!title || !department || !location || saveMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 bg-gold text-navy-dark font-body text-xs font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50 rounded"
          >
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobEditor;
