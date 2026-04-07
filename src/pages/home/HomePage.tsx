import AdvisorsSection from "../../sections/AdvisorsSection";
import CTASection from "../../sections/CTASection";
import HeroSection from "../../sections/HeroSection";
import HowItWorksSection from "../../sections/HowItWorksSection";
import TestimonialsSection from "../../sections/TestimonialsSection";
import WhySection from "../../sections/WhySection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <HowItWorksSection />
      <AdvisorsSection />
      <WhySection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}