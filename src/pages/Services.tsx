import { Megaphone, Palette, TrendingUp, Globe, ArrowRight, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import CalendlyDialog from "@/components/CalendlyDialog";

const services = [
{
  icon: Palette,
  title: "Brand Identity",
  tagline: "Crafting visual identities that command attention.",
  description:
  "Your brand is more than a logo — it's the feeling people carry long after they encounter you. We build complete brand systems that communicate prestige, consistency, and authority at every touchpoint.",
  deliverables: [
  "Logo & Visual Identity System",
  "Brand Guidelines & Style Guides",
  "Typography & Color Palette",
  "Stationery & Collateral Design",
  "Brand Voice & Messaging Framework"]

},
{
  icon: Globe,
  title: "Web Design & Development",
  tagline: "Bespoke digital experiences engineered for impact.",
  description:
  "We design and develop websites that don't just look exceptional — they perform. Every interaction is crafted to convert visitors into believers, using cutting-edge technology and timeless design principles.",
  deliverables: [
  "Custom Website Design & Development",
  "Responsive & Mobile-First Architecture",
  "Performance Optimization & SEO",
  "CMS Integration & Training",
  "Ongoing Maintenance & Support"]

},
{
  icon: Megaphone,
  title: "Digital Marketing",
  tagline: "Strategic campaigns that position you before the right audience.",
  description:
  "Visibility without strategy is noise. We create targeted campaigns across paid media, organic search, and social channels that put your brand in front of decision-makers who matter.",
  deliverables: [
  "Paid Media Strategy (Google, Meta, LinkedIn)",
  "Search Engine Optimization",
  "Content Strategy & Creation",
  "Social Media Management",
  "Analytics & Performance Reporting"]

},
{
  icon: TrendingUp,
  title: "Growth Strategy",
  tagline: "Data-driven frameworks for measurable dominance.",
  description:
  "Growth isn't accidental — it's engineered. We combine market research, competitive analysis, and data science to build roadmaps that transform your market presence into sustained leadership.",
  deliverables: [
  "Market Research & Competitor Analysis",
  "Customer Journey Mapping",
  "Conversion Rate Optimization",
  "Revenue Growth Frameworks",
  "Quarterly Strategy Reviews"]

}];


const Services = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy-gradient">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
            What We Do
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-tight mb-8">
            Services of <span className="text-gold-gradient">Distinction</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-2xl mx-auto mb-8">
            Every service we offer is designed with one purpose: to position your brand as the undeniable leader in its space.
          </p>
          <p className="font-body text-base text-gold-muted/80 max-w-3xl mx-auto border-t border-gold/15 pt-8">
            <span className="text-gold font-semibold">What sets us apart:</span> We leverage AI-powered tools for campaign optimization, automated reporting, and predictive analytics — delivering results traditional agencies can't match, with transparency they don't offer.
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="space-y-24">
            {services.map((service, i) =>
            <div
              key={service.title}
              className={`grid lg:grid-cols-2 gap-16 items-start ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}>

                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-6">
                    <service.icon className="w-8 h-8 text-gold" />
                    <span className="font-display text-5xl font-bold text-gold/10">0{i + 1}</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
                    {service.title}
                  </h2>
                  <p className="font-body text-gold italic mb-6">{service.tagline}</p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-8">
                    {service.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <CalendlyDialog>
                      <button className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300">
                        BOOK FREE CALL
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </CalendlyDialog>
                    <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-3 border border-gold/40 text-navy font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold/10 transition-all duration-300">

                      Request Custom Quote
                    </Link>
                  </div>
                </div>

                <div className={`p-10 border border-border bg-background ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <h3 className="font-display text-lg font-semibold text-navy mb-6">
                    What You'll Receive
                  </h3>
                  <ul className="space-y-4">
                    {service.deliverables.map((item) =>
                  <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                        <span className="font-body text-sm text-muted-foreground">{item}</span>
                      </li>
                  )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-gradient text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
            Ready to Elevate?
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-10">
            Let's discuss which services will best position your brand for dominance.
          </p>
          <Link
            to="/contact"
            className="inline-block px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300">

            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </div>);

};

export default Services;