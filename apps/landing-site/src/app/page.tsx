import {
  Navbar,
  LogosSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from '@/components/landing';
import NewHeroSection from '@/components/landing/NewHeroSection';
import ROICalculator from '@/components/landing/ROICalculator';
import FAQSection from '@/components/landing/FAQSection';
import TrustSection from '@/components/landing/TrustSection';
import IntegrationsSection from '@/components/landing/IntegrationsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <NewHeroSection />
      <LogosSection />
      <IntegrationsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ROICalculator />
      <TrustSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
