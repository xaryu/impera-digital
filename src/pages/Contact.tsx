import { Mail, MapPin, Phone } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy-gradient">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
            Let's Connect
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-tight mb-8">
            Begin Your <span className="text-gold-gradient">Ascent</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-2xl mx-auto">
            Every empire begins with a single decision. Tell us about your vision, and let's discuss how Impera can bring it to life.
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
                Get in Touch
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors"
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                      Service of Interest
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors appearance-none"
                    >
                      <option value="">Select a service</option>
                      <option value="brand">Brand Identity</option>
                      <option value="web">Web Design & Development</option>
                      <option value="marketing">Digital Marketing</option>
                      <option value="strategy">Growth Strategy</option>
                      <option value="multiple">Multiple Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs tracking-wider text-muted-foreground uppercase mb-2">
                    Tell Us About Your Project
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-background border border-border font-body text-sm text-foreground focus:border-gold focus:outline-none transition-colors resize-none"
                    placeholder="Describe your vision, goals, and timeline..."
                  />
                </div>

                <button
                  type="submit"
                  className="px-12 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
                >
                  Send Inquiry
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-3xl font-bold text-navy mb-8">
                Contact Details
              </h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div>
                    <p className="font-body text-xs tracking-wider text-muted-foreground uppercase mb-1">
                      Email
                    </p>
                    <a
                      href="mailto:contact@impera-group.com"
                      className="font-body text-navy hover:text-gold transition-colors"
                    >
                      contact@impera-group.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div>
                    <p className="font-body text-xs tracking-wider text-muted-foreground uppercase mb-1">
                      Phone
                    </p>
                    <a
                      href="tel:+32492202377"
                      className="font-body text-navy hover:text-gold transition-colors"
                    >
                      +32 492 20 23 77
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gold mt-1 shrink-0" />
                  <div>
                    <p className="font-body text-xs tracking-wider text-muted-foreground uppercase mb-1">
                      Office
                    </p>
                    <p className="font-body text-navy">
                      Justus Lipsiusstraat 16
                      <br />
                      3000, Leuven
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="mt-12 p-8 border border-border bg-background">
                <h3 className="font-display text-lg font-semibold text-navy mb-4">
                  Office Hours
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Monday – Friday</span>
                    <span className="text-navy">9:00 – 18:00</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="text-navy">By Appointment</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="text-navy">Closed</span>
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
