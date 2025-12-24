import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import bmbLogo from "@/assets/bmb-logo.png";

const Hero = () => {
  const navigate = useNavigate();

  const scrollToBetaForm = () => {
    document.getElementById("beta-form")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
            Brands Need to Be{" "}
            <span className="text-primary">Everywhere.</span>
          </h1>
          <p className="mb-2 text-xl font-semibold text-foreground/90">
            Let us help you build your brand.
          </p>
          <p className="mb-4 text-lg text-muted-foreground">
            If you really want to grow your brand, you came to the right place. We repurpose and distribute your content across every platform—so you stay visible without the extra work.
          </p>
          <p className="mb-8 text-sm text-muted-foreground/80">
            Now accepting early access clients — limited spots available.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={scrollToBetaForm}>
              Join the Free Beta
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/intake")}>
              Start Intake
            </Button>
          </div>
          
          <div className="mt-10 flex flex-col items-center gap-2">
            <img 
              src={bmbLogo} 
              alt="BMB AI Automations" 
              className="h-16 w-auto"
            />
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-semibold">BMBAIAUTOMATIONS</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
