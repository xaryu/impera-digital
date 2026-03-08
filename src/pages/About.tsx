import { useEffect, useState } from "react";
import { Award, Users, Target, Shield, Settings, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadershipSection from "@/components/LeadershipSection";
import AdminAuth from "@/components/AdminAuth";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const stats = [
  { value: "10+", label: "Years Collective Experience" },
  { value: "6", label: "Specialists United" },
  { value: "100+", label: "Clients Served" },
  { value: "2025", label: "Year of Formation" },
];

const values = [
  {
    icon: Shield,
    title: "Authority",
    description: "True authority is earned through mastery — a decade of independent expertise, now amplified by the precision of modern technology. We don't follow the market. We command it.",
  },
  {
    icon: Target,
    title: "Precision",
    description: "Every pixel, every data point, every campaign is engineered with intent. We pair battle-tested intuition with AI-driven analytics to eliminate guesswork and deliver certainty.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Mediocrity is the refuge of those who lack ambition. We hold every deliverable to the standard our own reputations were built on — nothing leaves our hands until it commands respect.",
  },
  {
    icon: Users,
    title: "Partnership",
    description: "Empires are not built alone. We stand beside the brands we serve — not as vendors, but as allies invested in their ascent. Your victories are ours.",
  },
];

const About = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
  };

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
            Built by Veterans, <span className="text-gold-gradient">Launched for the Future.</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-3xl mx-auto">
            Impera was founded in 2025 by digital specialists who spent over a decade mastering their crafts as independent professionals. After years of delivering results for ambitious brands across Europe, we recognized businesses needed strategic partners who could combine deep expertise with cutting-edge technology. Rather than continue working in isolation, we united our skills to create Impera — a boutique agency built for brands that refuse to settle.
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
                Where Vision Meets Authority
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                For over a decade, the specialists behind Impera operated independently — building brands, engineering platforms, and driving growth for clients across Europe. Startups, scale-ups, and established enterprises alike trusted them to deliver what others couldn't: results that commanded attention.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                But working in isolation had its limits. The most ambitious projects demanded more than individual brilliance — they required the combined force of strategy, design, development, and performance working as one. That conviction became Impera: a modern agency built on 10+ years of collective mastery, enhanced by the tools and methodologies that define the next generation of digital excellence.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                We are not a startup finding its way. We are seasoned specialists who chose to evolve — leveraging AI-powered insights, agile execution, and data-driven precision to set a new modern standard for what a digital agency can achieve.
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
              The Principles Behind the Empire
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

      <LeadershipSection isAdmin={isAdmin} />

      {/* CTA */}
      <section className="py-24 bg-navy-gradient text-center relative">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
            Built for Brands That Refuse to Settle
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-10">
            We partner with ambitious businesses ready to claim digital authority. If average was never an option for you, we should talk.
          </p>
          <Link
            to="/contact"
            className="inline-block px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
          >
            Get in Touch
          </Link>
        </div>
        {/* Admin toggle */}
        <div className="absolute bottom-4 right-6">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-body text-xs text-gold/40 hover:text-gold/80 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Exit Admin
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 font-body text-xs text-gold/20 hover:text-gold/60 transition-colors"
            >
              <Settings className="w-3 h-3" />
              Admin
            </button>
          )}
        </div>
      </section>

      {showAuthModal && (
        <AdminAuth
          onClose={() => setShowAuthModal(false)}
          onLoggedIn={() => setIsAdmin(true)}
        />
      )}

      <Footer />
    </div>
  );
};

export default About;
