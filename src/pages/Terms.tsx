import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Terms = () => {
  return (
    <div className="min-h-screen bg-navy-dark">
      <SEO title="Terms of Service — Impera" description="Review Impera's terms of service and conditions of use." path="/terms" />
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            Legal
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cream mb-12">
            Terms of Service
          </h1>
          <p className="font-body text-xs text-gold-muted mb-12">
            Last updated: March 8, 2025
          </p>

          <div className="space-y-10 font-body text-sm text-cream/80 leading-relaxed">
            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">1. Services</h2>
              <p>
                Impera provides digital marketing and consulting services including, but not limited to: brand strategy, digital marketing campaigns, search engine optimization (SEO), web development, content creation, and performance marketing, as described on our website and in individual service agreements.
              </p>
              <p className="mt-3">
                Specific deliverables, timelines, and scope of work are defined in individual project proposals or service agreements between Impera and the client.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">2. Payment Terms</h2>
              <ul className="list-disc list-inside space-y-2 text-cream/70">
                <li>Services are invoiced monthly unless otherwise agreed in writing.</li>
                <li>Invoices are due within 14 calendar days of the invoice date.</li>
                <li>Late payments are subject to a penalty interest of 10% per annum, in accordance with Belgian law on combating late payment in commercial transactions.</li>
                <li>A fixed compensation of €40 for recovery costs will be applied to overdue invoices, without prejudice to any additional recovery costs.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">3. Intellectual Property</h2>
              <p className="mb-3">Upon full payment of all outstanding invoices:</p>
              <ul className="list-disc list-inside space-y-2 text-cream/70">
                <li>The client owns all final deliverables (designs, copy, assets) as specified in the project agreement.</li>
                <li>Impera retains ownership of all working files, internal processes, proprietary tools, methodologies, and frameworks used during the engagement.</li>
                <li>Impera reserves the right to showcase completed work in its portfolio, unless a non-disclosure agreement (NDA) is in place.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">4. Client Obligations</h2>
              <p>
                The client agrees to provide timely access to all materials, approvals, and information necessary for the completion of agreed services. Delays caused by the client may result in adjusted timelines and, where applicable, additional charges.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">5. Confidentiality</h2>
              <p>
                Both parties agree to treat all proprietary information, business strategies, and project details as confidential. This obligation survives the termination of any service agreement for a period of two (2) years.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">6. Limitation of Liability</h2>
              <p className="mb-3">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside space-y-2 text-cream/70">
                <li>Impera's total liability for any claim arising from or related to our services shall not exceed the total fees paid by the client for the specific service giving rise to the claim during the 3 months preceding the claim.</li>
                <li>Impera shall not be liable for indirect, incidental, consequential, or punitive damages, including loss of revenue, profit, data, or business opportunities.</li>
                <li>Impera does not guarantee specific marketing outcomes (e.g., rankings, traffic, conversion rates), as results depend on multiple factors beyond our control.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">7. Termination</h2>
              <p>
                Either party may terminate a service agreement with 30 days' written notice. The client remains responsible for payment of all services rendered up to the termination date, including any work in progress. Upon termination, Impera will deliver all completed work to the client.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">8. Force Majeure</h2>
              <p>
                Neither party shall be liable for delays or failure to perform due to circumstances beyond their reasonable control, including but not limited to natural disasters, government actions, pandemics, or disruptions in technology infrastructure.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">9. Governing Law & Jurisdiction</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of Belgium. Any disputes arising from these terms or related services shall be submitted to the exclusive jurisdiction of the courts of Leuven, Belgium.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-cream mb-4">10. Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us:
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

export default Terms;
