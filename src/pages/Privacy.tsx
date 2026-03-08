import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-navy-dark">
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            Legal
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cream mb-12">
            Privacy Policy
          </h1>
          <p className="font-body text-xs text-gold-muted mb-12">
            Last updated: March 8, 2025
          </p>

          <div className="space-y-10 font-body text-sm text-cream/80 leading-relaxed">
            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">1. Introduction</h2>
              <p>
                Impera ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal data when you interact with our website and services, in compliance with the General Data Protection Regulation (GDPR) and applicable Belgian data protection law.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">2. Data We Collect</h2>
              <p className="mb-3">We collect the following personal data when you voluntarily provide it:</p>
              <ul className="list-disc list-inside space-y-2 text-cream/70">
                <li><span className="text-cream/80">Contact forms:</span> Name, email address, phone number, and your message.</li>
                <li><span className="text-cream/80">Calendly scheduling:</span> Name, email address, and any information you provide when booking a meeting through our integrated Calendly widget.</li>
                <li><span className="text-cream/80">Job applications:</span> Full name, email address, motivation letter, and CV/resume.</li>
              </ul>
              <p className="mt-3">
                We do not use tracking cookies for advertising purposes. Basic analytics may be used to understand site usage patterns.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">3. How We Use Your Data</h2>
              <p className="mb-3">Your personal data is used exclusively for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-cream/70">
                <li>To respond to your inquiries submitted through our contact form.</li>
                <li>To schedule and manage meetings booked via Calendly.</li>
                <li>To process and evaluate job applications.</li>
                <li>To improve our website and services.</li>
              </ul>
              <p className="mt-3">
                We do not sell, trade, or rent your personal data to third parties. Data is only shared with service providers essential to our operations (e.g., Calendly for scheduling, email hosting for communication).
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">4. Legal Basis for Processing</h2>
              <p>
                We process your personal data based on: (a) your explicit consent when submitting forms or booking meetings; (b) our legitimate interest in responding to business inquiries and evaluating candidates; and (c) contractual necessity when you engage our services.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">5. Data Protection</h2>
              <p>
                We implement industry-standard security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encrypted data transmission (SSL/TLS), secure hosting infrastructure, and restricted access controls.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">6. Data Retention</h2>
              <p>
                We retain personal data only as long as necessary to fulfill the purposes outlined in this policy. Contact form submissions are retained for up to 12 months. Job applications are retained for up to 6 months after the position is filled, unless you consent to longer retention.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">7. Your Rights</h2>
              <p className="mb-3">Under the GDPR, you have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-cream/70">
                <li><span className="text-cream/80">Access</span> — Request a copy of the personal data we hold about you.</li>
                <li><span className="text-cream/80">Rectification</span> — Request correction of inaccurate or incomplete data.</li>
                <li><span className="text-cream/80">Erasure</span> — Request deletion of your personal data ("right to be forgotten").</li>
                <li><span className="text-cream/80">Restriction</span> — Request that we limit the processing of your data.</li>
                <li><span className="text-cream/80">Portability</span> — Request your data in a structured, machine-readable format.</li>
                <li><span className="text-cream/80">Objection</span> — Object to the processing of your personal data.</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact us at the address below. We will respond within 30 days.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">8. Third-Party Services</h2>
              <p>
                Our website integrates with Calendly for appointment scheduling. When you use Calendly, your data is also subject to{" "}
                <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light transition-colors underline">
                  Calendly's Privacy Policy
                </a>
                . We encourage you to review their policy.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">9. Contact</h2>
              <p>
                For any questions regarding this Privacy Policy or to exercise your data rights, please contact us:
              </p>
              <div className="mt-4 border border-gold/10 p-6 bg-navy/30">
                <p className="text-cream">Impera</p>
                <p className="text-cream/70 mt-1">Justus Lipsiusstraat 16, 3000 Leuven, Belgium</p>
                <p className="mt-2">
                  <a href="mailto:contact@impera-group.com" className="text-gold hover:text-gold-light transition-colors">
                    contact@impera-group.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
