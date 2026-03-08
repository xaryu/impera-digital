import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import LocalizedLink from "@/components/LocalizedLink";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const CareerPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [motivation, setMotivation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job-opening", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_openings").select("*").eq("slug", slug!).eq("published", true).single();
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
        const { error: uploadError } = await supabase.storage.from("cv-uploads").upload(filePath, cvFile);
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
      setFullName(""); setEmail(""); setMotivation(""); setCvFile(null);
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
      if (trimmed.startsWith("- ")) return <li key={i} className="font-body text-gold-muted leading-relaxed ml-4 list-disc">{trimmed.slice(2)}</li>;
      if (!trimmed) return <br key={i} />;
      return <p key={i} className="font-body text-gold-muted leading-relaxed mb-2">{trimmed}</p>;
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
          <h1 className="font-display text-3xl font-bold text-cream mb-4">{t("careerPost.positionNotFound")}</h1>
          <LocalizedLink to="/careers" className="text-gold hover:underline font-body text-sm">← {t("careerPost.backToCareers")}</LocalizedLink>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-dark">
      <SEO title={`${job.title} — Impera`} description={job.short_description} path={`/careers/${job.slug}`} />
      <Navbar />

      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <LocalizedLink to="/careers" className="inline-flex items-center gap-2 text-gold font-body text-sm tracking-wider uppercase hover:text-gold-light transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> {t("careerPost.backToCareers")}
          </LocalizedLink>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="font-body text-xs tracking-wider text-gold-muted/60 uppercase border border-gold/10 px-3 py-1">{job.department}</span>
            <span className="font-body text-xs tracking-wider text-gold-muted/60 uppercase border border-gold/10 px-3 py-1">{job.type}</span>
            <span className="font-body text-xs tracking-wider text-gold-muted/60 uppercase border border-gold/10 px-3 py-1">{job.location}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cream leading-tight mb-6">{job.title}</h1>
          <p className="font-body text-gold-muted leading-relaxed text-lg mb-12">{job.short_description}</p>
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-xl font-bold text-cream mb-6 border-b border-gold/10 pb-4">{t("careerPost.aboutRole")}</h2>
          <div>{renderContent(job.full_description)}</div>
        </div>
      </section>

      {job.requirements && (
        <section className="px-6 pb-12">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-xl font-bold text-cream mb-6 border-b border-gold/10 pb-4">{t("careerPost.requirements")}</h2>
            <ul className="space-y-2">{renderContent(job.requirements)}</ul>
          </div>
        </section>
      )}

      {job.benefits && (
        <section className="px-6 pb-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-xl font-bold text-cream mb-6 border-b border-gold/10 pb-4">{t("careerPost.whatWeOffer")}</h2>
            <ul className="space-y-2">{renderContent(job.benefits)}</ul>
          </div>
        </section>
      )}

      <section className="px-6 pb-24">
        <div className="container mx-auto max-w-4xl">
          <div className="border border-gold/10 p-8 md:p-12 bg-navy/30">
            <h2 className="font-display text-2xl font-bold text-cream mb-2">{t("careerPost.applyTitle")}</h2>
            <p className="font-body text-sm text-gold-muted mb-8">{t("careerPost.applyDesc")}</p>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="apply-name" className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">{t("careerPost.fullName")}</label>
                  <input id="apply-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} autoComplete="name" className="w-full bg-transparent border border-gold/10 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors" />
                </div>
                <div>
                  <label htmlFor="apply-email" className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">{t("careerPost.email")}</label>
                  <input id="apply-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" className="w-full bg-transparent border border-gold/10 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label htmlFor="apply-motivation" className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">{t("careerPost.motivationLetter")}</label>
                <textarea id="apply-motivation" value={motivation} onChange={(e) => setMotivation(e.target.value)} required maxLength={5000} rows={8} placeholder={t("careerPost.motivationPlaceholder")} className="w-full bg-transparent border border-gold/10 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors resize-none placeholder:text-gold-muted/30" />
              </div>
              <div>
                <label htmlFor="apply-cv" className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">{t("careerPost.attachCV")}</label>
                <input ref={fileInputRef} id="apply-cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const file = e.target.files?.[0]; if (file && file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; } setCvFile(file || null); }} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} aria-describedby="cv-file-name" className="flex items-center gap-3 border border-gold/10 hover:border-gold/30 px-6 py-3 transition-colors min-h-[44px]">
                  <Upload className="w-4 h-4 text-gold" aria-hidden="true" />
                  <span id="cv-file-name" className="font-body text-sm text-gold-muted">{cvFile ? cvFile.name : t("careerPost.chooseFile")}</span>
                </button>
              </div>
              <button type="submit" disabled={applyMutation.isPending} className="px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-60 min-h-[48px]">
                {applyMutation.isPending ? t("careerPost.submitting") : t("careerPost.submit")}
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
