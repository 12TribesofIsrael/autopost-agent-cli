import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WhyMultiPlatform from "@/components/WhyMultiPlatform";
import SocialProof from "@/components/SocialProof";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import IntakeForm from "@/components/IntakeForm";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <WhyMultiPlatform />
        <SocialProof />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <IntakeForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
