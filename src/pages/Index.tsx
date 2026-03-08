import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import WhyImperaSection from "@/components/WhyImperaSection";
import GuaranteeSection from "@/components/GuaranteeSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ExitIntentPopup from "@/components/ExitIntentPopup";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Impera — Command Your Digital Presence"
        description="Impera is a premium digital media agency crafting luxury brand experiences that command authority and distinction."
        path="/"
      />
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <WhyImperaSection />
      <AboutSection />
      <GuaranteeSection />
      <CTASection />
      <Footer />
      <ExitIntentPopup />
    </div>
  );
};

export default Index;
