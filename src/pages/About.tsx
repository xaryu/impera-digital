import { Award, Users, Target, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "10+", label: "Years of Excellence" },
  { value: "98%", label: "Client Retention" },
  { value: "5", label: "Industry Awards" },
];

const values = [
  {
    icon: Shield,
    title: "Authority",
    description: "We don't follow trends — we set the standard. Every decision is made with the conviction that your brand deserves to lead.",
  },
  {
    icon: Target,
    title: "Precision",
    description: "Details matter. From kerning to conversion funnels, we obsess over the details that separate good from extraordinary.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Mediocrity is not in our vocabulary. We hold ourselves to the highest standards because your brand demands nothing less.",
  },
  {
    icon: Users,
    title: "Partnership",
    description: "We don't work for clients — we work with them. True collaboration is the foundation of every empire we help build.",
  },
];

const team = [
  { name: "Alessandro Voss", role: "Founder & Creative Director" },
  { name: "Camille Laurent", role: "Head of Strategy" },
  { name: "Marcus Chen", role: "Lead Developer" },
  { name: "Isabella Torres", role: "Brand Director" },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy-gradient">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
            Our Story
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-tight mb-8">
            Where Vision Meets <span className="text-gold-gradient">Authority</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-2xl mx-auto">
            From the Latin <em className="text-gold">imperare</em> — to command. We exist to help brands claim their rightful place at the top.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
                Our Philosophy
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-8 leading-tight">
                Digital excellence is not about aesthetics — it's about commanding presence.
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                At Impera, every pixel, every interaction, every strategy is designed to establish your brand as the undeniable leader in its space. We believe that true luxury in the digital realm comes from precision, restraint, and an unwavering commitment to quality.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                Founded in 2014, we've spent over a decade refining our craft, working exclusively with brands that share our ambition for excellence. We don't take on every project — we take on the right ones.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-8 border border-border text-center hover:border-gold/30 hover:gold-glow transition-all duration-500 bg-background"
                >
                  <p className="font-display text-4xl font-bold text-gold mb-2">
                    {stat.value}
                  </p>
                  <p className="font-body text-xs tracking-wider text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-navy-gradient">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
              What Drives Us
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream">
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-8 border border-gold/15 hover:border-gold/30 transition-all duration-500"
              >
                <value.icon className="w-8 h-8 text-gold mb-6" />
                <h3 className="font-display text-xl font-semibold text-cream mb-3">
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

      {/* Team */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
              The People
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy">
              Leadership
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="group text-center p-8 border border-border hover:border-gold/30 hover:gold-glow transition-all duration-500 bg-background"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-navy flex items-center justify-center">
                  <span className="font-display text-xl font-bold text-gold">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-navy mb-1">
                  {member.name}
                </h3>
                <p className="font-body text-xs tracking-wider text-muted-foreground uppercase">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-gradient text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
            Let's Build Something Remarkable
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-10">
            We're selective about the brands we partner with. If you share our ambition, we'd love to hear from you.
          </p>
          <Link
            to="/contact"
            className="inline-block px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
