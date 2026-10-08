import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import PathwaySection from "@/components/sections/PathwaySection";
import ServicesSection from "@/components/sections/ServicesSection";
import AboutSection from "@/components/sections/AboutSection";
import WhyImperaSection from "@/components/sections/WhyImperaSection";
import GuaranteeSection from "@/components/sections/GuaranteeSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import ExitIntentPopup from "@/components/common/ExitIntentPopup";
import ResultsSection from "@/components/sections/ResultsSection";
import FAQSection from "@/components/sections/FAQSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Impera — Command your growth. Automate everything else."
        description="Impera is a premium digital media agency crafting luxury brand experiences that command authority and distinction."
        path="/"
      />
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <Navbar />
      <main id="main-content" role="main">
        <HeroSection />
        <ServicesSection />
        <ResultsSection/>
        <PathwaySection />
        <WhyImperaSection />
        <FAQSection />
        <AboutSection />
        <GuaranteeSection />
        <CTASection />
      </main>
      <Footer />
      <ExitIntentPopup />
    </div>
  );
};

export default Index;
