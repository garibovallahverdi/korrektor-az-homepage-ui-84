import { useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { DemoSection } from "@/components/DemoSection";
import { PricingSection } from "@/components/PricingSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ProFeaturesSection } from "@/components/ProFeaturesSection";
import { ContactSection } from "@/components/ContactSection";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    // URL'deki hash'i kontrol et
    const hash = window.location.hash;
    
    if (hash) {
      // Hash varsa (örn: #contact), o ID'ye sahip elementi bul
      const elementId = hash.substring(1); // # işaretini çıkar
      const element = document.getElementById(elementId);
      
      if (element) {
        // Element varsa ora scroll et
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100); // Kısa gecikme ile componentlerin yüklenmesini bekle
      }
    }
  }, []);

  // Hash değişikliklerini dinle
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash) {
        const elementId = hash.substring(1);
        const element = document.getElementById(elementId);
        
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <DemoSection />
        <PricingSection />
        <TestimonialsSection />
        <ProFeaturesSection />
        <ContactSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;