import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

const CareerPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [motivation, setMotivation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job-opening", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_openings")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!job) throw new Error("Job not found");

      let cvUrl: string | null = null;

      if (cvFile) {
        const fileExt = cvFile.name.split(".").pop();
        const filePath = `${job.id}/${Date.now()}-${fullName.replace(/\s+/g, "-")}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("cv-uploads")
          .upload(filePath, cvFile);
        if (uploadError) throw uploadError;
        cvUrl = filePath;
      }

      const { error } = await supabase.from("job_applications").insert({
        job_opening_id: job.id,
        full_name: fullName.trim(),
        email: email.trim(),
        motivation_letter: motivation.trim(),
        cv_url: cvUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setFullName("");
      setEmail("");
      setMotivation("");
      setCvFile(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !motivation.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    applyMutation.mutate();
  };

  const renderContent = (text: string) =>
    text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ")) {
        return (
          <li key={i} className="font-body text-gold-muted leading-relaxed ml-4 list-disc">
            {trimmed.slice(2)}
          </li>
        );
      }
      if (!trimmed) return <br key={i} />;
      return (
        <p key={i} className="font-body text-gold-muted leading-relaxed mb-2">
          {trimmed}
        </p>
      );
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-navy-dark">
        <Navbar />
        <div className="pt-32 pb-20 px-6 text-center">
          <h1 className="font-display text-3xl font-bold text-cream mb-4">Position Not Found</h1>
          <Link to="/careers" className="text-gold hover:underline font-body text-sm">
            ← Back to Careers
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-dark">
      <Navbar />

      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-gold font-body text-sm tracking-wider uppercase hover:text-gold-light transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="font-body text-xs tracking-wider text-gold-muted/60 uppercase border border-gold/10 px-3 py-1">
              {job.department}
            </span>
            <span className="font-body text-xs tracking-wider text-gold-muted/60 uppercase border border-gold/10 px-3 py-1">
              {job.type}
            </span>
            <span className="font-body text-xs tracking-wider text-gold-muted/60 uppercase border border-gold/10 px-3 py-1">
              {job.location}
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-bold text-cream leading-tight mb-6">
            {job.title}
          </h1>
          <p className="font-body text-gold-muted leading-relaxed text-lg mb-12">
            {job.short_description}
          </p>
        </div>
      </section>

      {/* Full Description */}
      <section className="px-6 pb-12">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-xl font-bold text-cream mb-6 border-b border-gold/10 pb-4">
            About the Role
          </h2>
          <div>{renderContent(job.full_description)}</div>
        </div>
      </section>

      {/* Requirements */}
      {job.requirements && (
        <section className="px-6 pb-12">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-xl font-bold text-cream mb-6 border-b border-gold/10 pb-4">
              Requirements
            </h2>
            <ul className="space-y-2">{renderContent(job.requirements)}</ul>
          </div>
        </section>
      )}

      {/* Benefits */}
      {job.benefits && (
        <section className="px-6 pb-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-xl font-bold text-cream mb-6 border-b border-gold/10 pb-4">
              What We Offer
            </h2>
            <ul className="space-y-2">{renderContent(job.benefits)}</ul>
          </div>
        </section>
      )}

      {/* Application Form */}
      <section className="px-6 pb-24">
        <div className="container mx-auto max-w-4xl">
          <div className="border border-gold/10 p-8 md:p-12 bg-navy/30">
            <h2 className="font-display text-2xl font-bold text-cream mb-2">
              Apply for this Position
            </h2>
            <p className="font-body text-sm text-gold-muted mb-8">
              Fill in the form below and attach your CV to apply.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={100}
                    className="w-full bg-transparent border border-gold/10 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={255}
                    className="w-full bg-transparent border border-gold/10 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">
                  Motivation Letter *
                </label>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  required
                  maxLength={5000}
                  rows={8}
                  placeholder="Tell us why you're the right fit for this role..."
                  className="w-full bg-transparent border border-gold/10 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors resize-none placeholder:text-gold-muted/30"
                />
              </div>

              <div>
                <label className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">
                  Attach CV (PDF, DOC, DOCX — max 10MB)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 10 * 1024 * 1024) {
                      toast.error("File must be under 10MB");
                      return;
                    }
                    setCvFile(file || null);
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 border border-gold/10 hover:border-gold/30 px-6 py-3 transition-colors"
                >
                  <Upload className="w-4 h-4 text-gold" />
                  <span className="font-body text-sm text-gold-muted">
                    {cvFile ? cvFile.name : "Choose file…"}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-60"
              >
                {applyMutation.isPending ? "Submitting…" : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareerPost;
