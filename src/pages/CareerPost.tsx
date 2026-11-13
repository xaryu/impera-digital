import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import LocalizedLink from "@/components/layout/LocalizedLink";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { submitForm, honeypotProps, honeypotWrapperClass } from "@/lib/submit-form";

const MAX_CV_BYTES = 10 * 1024 * 1024;

// Error messages are dictionary keys, translated when shown.
const applicationSchema = z.object({
  fullName: z.string().trim().min(1, "careerPost.requiredFields").max(100),
  email: z.string().trim().min(1, "careerPost.requiredFields").email("careerPost.invalidEmail").max(255),
  motivation: z.string().trim().min(1, "careerPost.requiredFields").max(5000),
});

// The extensions the cv-uploads bucket accepts, lower-cased; null for anything else.
const cvExtension = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ext === "pdf" || ext === "doc" || ext === "docx" ? ext : null;
};

const CareerPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [motivation, setMotivation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [website, setWebsite] = useState(""); // honeypot
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job-opening", slug],
    queryFn: async () => {
      // No published filter here: RLS shows visitors only published openings and admins every one,
      // so an admin can open a draft from the careers list (as on BlogPost). maybeSingle: a missing
      // slug is "not found", not a 406 error.
      const { data, error } = await supabase.from("job_openings").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const applyMutation = useMutation({
    mutationFn: async (form: z.infer<typeof applicationSchema>) => {
      if (!job) throw new Error("common.genericError");
      let cvPath: string | null = null;
      if (cvFile) {
        // A random name, never the applicant's: Storage rejects keys with accents or quotes, and the
        // form-submit function only accepts <job id>/<uuid>.<pdf|doc|docx>.
        const fileExt = cvExtension(cvFile.name);
        if (!fileExt) throw new Error("careerPost.fileWrongType");
        const filePath = `${job.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("cv-uploads").upload(filePath, cvFile);
        if (uploadError) throw new Error("common.genericError");
        cvPath = filePath;
      }
      const errorKey = await submitForm({
        kind: "application",
        jobId: job.id,
        fullName: form.fullName,
        email: form.email,
        motivation: form.motivation,
        cvPath,
        website,
      });
      if (errorKey) throw new Error(errorKey);
    },
    onSuccess: () => {
      toast.success(t("careerPost.submitSuccess"));
      setFullName(""); setEmail(""); setMotivation(""); setCvFile(null);
      // Otherwise picking the same file again fires no change event.
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error: Error) => toast.error(t(error.message)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = applicationSchema.safeParse({ fullName, email, motivation });
    if (!result.success) {
      toast.error(t(result.error.errors[0].message));
      return;
    }
    applyMutation.mutate(result.data);
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
          {!job.published && (
            <p role="status" className="mb-8 border border-gold/40 bg-gold/10 px-4 py-3 font-body text-sm text-cream">
              {t("careerPost.draftNotice")}
            </p>
          )}
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
              <div aria-hidden="true" className={honeypotWrapperClass}>
                <input {...honeypotProps} value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
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
                <input ref={fileInputRef} id="apply-cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => {
                  const file = e.target.files?.[0];
                  const problem = !file ? null : !cvExtension(file.name) ? "careerPost.fileWrongType" : file.size > MAX_CV_BYTES ? "careerPost.fileTooLarge" : null;
                  if (problem) { toast.error(t(problem)); e.target.value = ""; setCvFile(null); return; }
                  setCvFile(file || null);
                }} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} aria-describedby="cv-file-name" className="flex items-center gap-3 border border-gold/10 hover:border-gold/30 px-6 py-3 transition-colors min-h-[44px]">
                  <Upload className="w-4 h-4 text-gold" aria-hidden="true" />
                  <span id="cv-file-name" className="font-body text-sm text-gold-muted">{cvFile ? cvFile.name : t("careerPost.chooseFile")}</span>
                </button>
              </div>
              {/* form-submit only accepts applications for published openings. */}
              <button type="submit" disabled={applyMutation.isPending || !job.published} className="px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-60 min-h-[48px]">
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
