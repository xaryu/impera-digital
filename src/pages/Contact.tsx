import { Mail, MapPin, Phone } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(100).optional(),
  service: z.string().max(50).optional(),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: result.data.name,
      email: result.data.email,
      company: result.data.company || "",
      service: result.data.service || "",
      message: result.data.message,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    toast.success(t("contactPage.successMessage") || "Message sent successfully!");
  };

  return (
    <div className="min-h-screen">
      <SEO title={`${t("contactPage.title")} ${t("contactPage.titleHighlight")} — Impera`} description={t("contactPage.subtitle")} path="/contact" />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy-gradient">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
            {t("contactPage.eyebrow")}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-cream leading-tight mb-8">
            {t("contactPage.title")} <span className="text-gold-gradient">{t("contactPage.titleHighlight")}</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-2xl mx-auto">
            {t("contactPage.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="font-display text-3xl font-bold text-navy mb-8">
                {t("contactPage.formTitle")}
              </h2>

              {submitted ? (
                <div className="p-10 border border-gold/30 bg-background text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                    <Mail className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-navy mb-3">
                    {t("contactPage.thankYouTitle") || "Thank You!"}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed max-w-md mx-auto">
                    {t("contactPage.thankYouDesc") || "Your message has been received. We'll get back to you within 24 hours."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-name" className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                        {t("contactPage.nameLabel")}
                      </label>
                      <input id="contact-name" type="text" name="name" value={formData.name} onChange={handleChange} required autoComplete="name" className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors" placeholder={t("contactPage.namePlaceholder")} />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                        {t("contactPage.emailLabel")}
                      </label>
                      <input id="contact-email" type="email" name="email" value={formData.email} onChange={handleChange} required autoComplete="email" className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors" placeholder={t("contactPage.emailPlaceholder")} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-company" className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                        {t("contactPage.companyLabel")}
                      </label>
                      <input id="contact-company" type="text" name="company" value={formData.company} onChange={handleChange} autoComplete="organization" className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors" placeholder={t("contactPage.companyPlaceholder")} />
                    </div>
                    <div>
                      <label htmlFor="contact-service" className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                        {t("contactPage.serviceLabel")}
                      </label>
                      <select id="contact-service" name="service" value={formData.service} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors appearance-none">
                        <option value="">{t("contactPage.serviceDefault")}</option>
                        <option value="brand">{t("contactPage.serviceBrand")}</option>
                        <option value="web">{t("contactPage.serviceWeb")}</option>
                        <option value="marketing">{t("contactPage.serviceMarketing")}</option>
                        <option value="strategy">{t("contactPage.serviceStrategy")}</option>
                        <option value="multiple">{t("contactPage.serviceMultiple")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                      {t("contactPage.messageLabel")}
                    </label>
                    <textarea id="contact-message" name="message" value={formData.message} onChange={handleChange} required rows={6} className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors resize-none" placeholder={t("contactPage.messagePlaceholder")} />
                  </div>

                  <button type="submit" disabled={submitting} className="w-full sm:w-auto px-12 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300 min-h-[48px] disabled:opacity-60">
                    {submitting ? (t("contactPage.sending") || "Sending...") : t("contactPage.submit")}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-3xl font-bold text-navy mb-8">
                {t("contactPage.detailsTitle")}
              </h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-gold mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-body text-xs tracking-wider text-muted-foreground uppercase mb-1">{t("contactPage.email")}</p>
                    <a href="mailto:contact@impera-group.com" className="font-body text-navy hover:text-gold transition-colors">contact@impera-group.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-gold mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-body text-xs tracking-wider text-muted-foreground uppercase mb-1">{t("contactPage.phone")}</p>
                    <a href="tel:+32492202377" className="font-body text-navy hover:text-gold transition-colors">+32 492 20 23 77</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gold mt-1 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-body text-xs tracking-wider text-muted-foreground uppercase mb-1">{t("contactPage.office")}</p>
                    <p className="font-body text-navy">Justus Lipsiusstraat 16<br />3000, Leuven</p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="mt-12 p-8 border border-border bg-background">
                <h3 className="font-display text-lg font-semibold text-navy mb-4">{t("contactPage.hoursTitle")}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">{t("contactPage.monFri")}</span>
                    <span className="text-navy">{t("contactPage.monFriHours")}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">{t("contactPage.saturday")}</span>
                    <span className="text-navy">{t("contactPage.saturdayHours")}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">{t("contactPage.sunday")}</span>
                    <span className="text-navy">{t("contactPage.sundayHours")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;