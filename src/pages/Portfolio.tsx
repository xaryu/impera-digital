import { ArrowRight, TrendingUp, Users, Globe, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const caseStudies = [
{
  industry: "Luxury Investment",
  category: "Brand Identity & Web",
  challenge:
  "A boutique investment firm needed to reposition itself from a regional player to a brand that signals trust and exclusivity to high-net-worth clientele.",
  approach:
  "We developed a refined visual identity, bespoke typography system, and a private-access digital platform with gated investor portals and cinematic storytelling.",
  results: [
  { metric: "340%", label: "Increase in qualified leads" },
  { metric: "2.8x", label: "Higher average engagement time" },
  { metric: "67%", label: "Growth in AUM inquiries" }]

},
{
  industry: "Haute Couture Fashion",
  category: "Digital Marketing",
  challenge:
  "An emerging fashion house needed to break through a saturated digital landscape and build a presence that rivaled established maisons.",
  approach:
  "We orchestrated a 360° campaign spanning paid media, influencer partnerships, and editorial content — with a focus on aspirational storytelling over discount-driven tactics.",
  results: [
  { metric: "520%", label: "Social media growth in 6 months" },
  { metric: "4.2x", label: "Return on ad spend" },
  { metric: "18K+", label: "Email subscribers acquired" }]

},
{
  industry: "Premium Automotive",
  category: "Web Development",
  challenge:
  "A premium car dealership group wanted a digital showroom experience that matched the in-person luxury of their physical locations.",
  approach:
  "We built an immersive, performance-first web platform with cinematic transitions, interactive vehicle explorers, and a concierge-style booking flow.",
  results: [
  { metric: "89%", label: "Improvement in page speed" },
  { metric: "3.1x", label: "Increase in online bookings" },
  { metric: "45%", label: "Lower bounce rate" }]

},
{
  industry: "Wellness & Fitness",
  category: "Growth Strategy",
  challenge:
  "A fitness brand expanding from local studios to a national DTC model needed a digital-first growth strategy that preserved their premium positioning.",
  approach:
  "We developed a data-driven growth framework combining brand storytelling, retention-focused email sequences, and a membership platform designed for exclusivity.",
  results: [
  { metric: "200%", label: "Growth in online memberships" },
  { metric: "78%", label: "Member retention rate" },
  { metric: "5x", label: "Revenue growth in 12 months" }]

}];


const industries = [
"Luxury & Fashion",
"Finance & Investment",
"Automotive",
"Wellness & Fitness",
"Hospitality",
"Emerging DTC Brands",
"Professional Services",
"Real Estate"];


const Portfolio = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy-gradient">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
            Case Studies
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-tight mb-8">
            Results That <span className="text-gold-gradient">Speak</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-2xl mx-auto">
            We don't just build brands — we engineer measurable outcomes. Every engagement is designed around one principle: commanding, demonstrable results.
          </p>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
              Proven Impact
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">
              Selected Case Studies
            </h2>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study, i) =>
            <div
              key={study.industry}
              className="group bg-navy p-10 md:p-14 hover:gold-glow transition-all duration-500">

                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2">
                      {study.category}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl font-semibold text-cream">
                      {study.industry} Client
                    </h3>
                  </div>
                  <span className="font-display text-6xl font-bold text-gold/10 group-hover:text-gold/20 transition-colors duration-500 hidden md:block">
                    0{i + 1}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-10 mb-10">
                  <div>
                    <p className="font-body text-xs tracking-wider text-gold uppercase mb-3">
                      The Challenge
                    </p>
                    <p className="font-body text-sm text-gold-muted leading-relaxed">
                      {study.challenge}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs tracking-wider text-gold uppercase mb-3">
                      Our Approach
                    </p>
                    <p className="font-body text-sm text-gold-muted leading-relaxed">
                      {study.approach}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gold/15 pt-8">
                  <p className="font-body text-xs tracking-wider text-gold uppercase mb-6">
                    Key Results
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    {study.results.map((result) =>
                  <div key={result.label} className="text-center md:text-left">
                        <p className="font-display text-3xl md:text-4xl font-bold text-gold mb-1">
                          {result.metric}
                        </p>
                        <p className="font-body text-xs tracking-wider text-gold-muted uppercase">
                          {result.label}
                        </p>
                      </div>
                  )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Industry Expertise */}
      <section className="py-24 bg-navy-gradient">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
                Industry Expertise
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-8 leading-tight">
                Deep Knowledge
                <br />
                Across <span className="text-gold-gradient">Sectors</span>
              </h2>
              <p className="font-body text-gold-muted leading-relaxed mb-6">
                From luxury fashion houses to emerging DTC brands, from investment firms to premium fitness concepts — we bring sector-specific insight to every engagement. Our work isn't generic; it's tailored to the nuances of your market.
              </p>
              <p className="font-body text-gold-muted leading-relaxed">
                We invest in understanding each industry's audience psychology, competitive landscape, and growth levers before a single design decision is made.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {industries.map((industry) =>
              <div
                key={industry}
                className="p-6 border border-gold/15 text-center hover:border-gold/30 hover:bg-gold/5 transition-all duration-500">

                  <p className="font-body text-sm tracking-wider text-cream uppercase">
                    {industry}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Credibility */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
              The Imperator
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-navy mb-8">
              Built on Authority
            </h2>

            <div className="bg-navy p-10 md:p-16 text-left">
              <blockquote className="font-display text-2xl md:text-3xl text-cream leading-relaxed mb-8 italic">
                "Impera was born from a conviction that brands don't need louder marketing — they need commanding presence."
              </blockquote>
              <p className="font-body text-gold-muted leading-relaxed mb-6">
                With over a decade of experience in digital strategy and brand building across international markets, our founder brings a multilingual, multi-cultural perspective that most agencies simply cannot offer. Fluent in the languages of both business and design, the vision behind Impera is rooted in the Latin <em className="text-gold">imperare</em> — to command.
              </p>
              <p className="font-body text-gold-muted leading-relaxed mb-8">
                Every project is led with the same philosophy: understand deeply, strategise precisely, and execute with authority. We don't follow trends — we set the standard.
              </p>
              <div className="flex flex-wrap gap-6 border-t border-gold/15 pt-8">
                <div>
                  <p className="font-display text-2xl font-bold text-gold">​10+</p>
                  <p className="font-body text-xs tracking-wider text-gold-muted uppercase">Years of Experience</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-gold">8
                  </p>
                  <p className="font-body text-xs tracking-wider text-gold-muted uppercase">Languages Spoken</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-gold">3</p>
                  <p className="font-body text-xs tracking-wider text-gold-muted uppercase">Continents Worked</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-gold">100%</p>
                  <p className="font-body text-xs tracking-wider text-gold-muted uppercase">Founder-Led Projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-gradient text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
            Ready to Command Your Market?
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-10">
            Let's discuss how we can engineer measurable results for your brand.
          </p>
          <Link to="/contact"
          className="inline-flex items-center gap-2 px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300">

            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>);

};

export default Portfolio;