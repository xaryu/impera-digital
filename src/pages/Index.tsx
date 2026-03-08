import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

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
      <AboutSection />
      
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
