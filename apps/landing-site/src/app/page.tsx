import {
  Navbar,
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
import LLMParallaxSection from '@/components/landing/LLMParallaxSection';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Velanova',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Windows, macOS, Linux',
    description:
      'AI Adoption & Governance Engine — Connect your databases and enterprise systems to 67+ AI models through one unified interface.',
    url: 'https://velanova.app',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '49',
      offerCount: '3',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nexolve Technologies',
      url: 'https://velanova.app',
    },
  };

  return (
    <div className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <NewHeroSection />
      <LLMParallaxSection />
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
