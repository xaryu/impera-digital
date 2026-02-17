import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const values = [
  {
    title: "Relentless Standards",
    description: "We don't settle. Every pixel, every word, every strategy is held to the highest standard.",
  },
  {
    title: "Ownership Mentality",
    description: "You own your craft and your outcomes. We trust our team to lead, not just execute.",
  },
  {
    title: "Creative Courage",
    description: "Safe is forgettable. We push boundaries and champion bold ideas that move markets.",
  },
  {
    title: "Collective Ambition",
    description: "Individual brilliance, collective triumph. We elevate each other to achieve the extraordinary.",
  },
];

const openings = [
  {
    title: "Senior Brand Strategist",
    department: "Strategy",
    type: "Full-time",
    location: "London / Remote",
    description: "Lead brand strategy for high-profile clients, crafting positioning frameworks that command market authority.",
  },
  {
    title: "Lead UI/UX Designer",
    department: "Design",
    type: "Full-time",
    location: "London",
    description: "Shape premium digital experiences from concept to pixel-perfect execution for luxury and enterprise brands.",
  },
  {
    title: "Full-Stack Developer",
    department: "Engineering",
    type: "Full-time",
    location: "London / Remote",
    description: "Build performant, elegant web applications that set the standard for digital craftsmanship.",
  },
  {
    title: "Performance Marketing Manager",
    department: "Marketing",
    type: "Full-time",
    location: "Remote",
    description: "Drive measurable growth for premium brands through sophisticated paid media strategies.",
  },
  {
    title: "Content Strategist",
    department: "Content",
    type: "Full-time",
    location: "London / Remote",
    description: "Develop compelling narratives and content ecosystems that position our clients as industry authorities.",
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-navy-dark">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            Join the Ranks
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-cream leading-tight mb-6">
            Build What Commands
          </h1>
          <p className="font-body text-gold-muted max-w-2xl mx-auto leading-relaxed">
            We're assembling a team of exceptional talent — strategists, designers, developers, and marketers who refuse to be ordinary.
          </p>
        </div>
      </section>

      {/* Culture Values */}
      <section className="px-6 pb-20">
        <div className="container mx-auto">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-10 text-center">
            What We Stand For
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="border border-gold/10 p-8 hover:border-gold/30 transition-all duration-500 bg-navy/30"
              >
                <span className="font-display text-4xl font-bold text-gold/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-lg font-bold text-cream mt-4 mb-3">
                  {value.title}
                </h3>
                <p className="font-body text-sm text-gold-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 pb-20">
        <div className="container mx-auto border border-gold/10 p-10 md:p-14 bg-navy/30">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cream mb-8 text-center">
            Why Impera
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Competitive Compensation", detail: "Premium salaries, equity options, and performance bonuses." },
              { label: "Flexible Work", detail: "Hybrid and remote options. We trust you to deliver, wherever you are." },
              { label: "Growth Budget", detail: "Annual learning stipend for courses, conferences, and tools." },
              { label: "Premium Health", detail: "Comprehensive health, dental, and wellness coverage." },
              { label: "Creative Freedom", detail: "Work on bold projects with clients who value excellence." },
              { label: "Team Retreats", detail: "Quarterly off-sites in inspiring locations to recharge and connect." },
            ].map((benefit, i) => (
              <div key={i} className="border-l border-gold/20 pl-6">
                <h4 className="font-display text-sm font-bold text-cream mb-2">{benefit.label}</h4>
                <p className="font-body text-xs text-gold-muted leading-relaxed">{benefit.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="px-6 pb-24">
        <div className="container mx-auto">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4 text-center">
            Open Positions
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cream mb-12 text-center">
            Current Openings
          </h2>
          <div className="space-y-4">
            {openings.map((role, i) => (
              <div
                key={i}
                className="border border-gold/10 p-8 hover:border-gold/30 transition-all duration-500 bg-navy/30 group cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-bold text-cream group-hover:text-gold transition-colors mb-2">
                      {role.title}
                    </h3>
                    <p className="font-body text-sm text-gold-muted leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="font-body text-xs tracking-wider text-gold-muted/60 uppercase">
                      {role.department}
                    </span>
                    <span className="text-gold/20">|</span>
                    <span className="font-body text-xs tracking-wider text-gold-muted/60 uppercase">
                      {role.location}
                    </span>
                    <span className="font-body text-sm text-gold tracking-wider uppercase ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      Apply →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* General Application */}
          <div className="mt-16 text-center border-t border-gold/10 pt-16">
            <h3 className="font-display text-xl font-bold text-cream mb-4">
              Don't See Your Role?
            </h3>
            <p className="font-body text-sm text-gold-muted mb-8 max-w-lg mx-auto leading-relaxed">
              Exceptional talent transcends job titles. If you believe you belong at Impera, we want to hear from you.
            </p>
            <Link
              to="/contact"
              className="inline-block px-10 py-4 border border-gold/40 text-gold text-sm tracking-wider uppercase hover:bg-gold/10 transition-all duration-300"
            >
              Send Open Application
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
