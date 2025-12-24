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
            Stop Wasting Time.{" "}
            <span className="text-primary">Start Going Viral.</span>
          </h1>
          <p className="mb-2 text-xl font-semibold text-foreground/90">
            One upload. Three platforms. Under 2 hours.
          </p>
          <p className="mb-4 text-lg text-muted-foreground">
            I help boxers, gyms, fitness businesses, and daycare owners who post short vertical videos get their content onto TikTok, Instagram Reels, and YouTube Shorts—without uploading to each app one by one.
          </p>
          <p className="mb-8 text-sm text-muted-foreground/80 italic">
            Built by a 13-year-old founder. Currently running a small free beta for feedback.
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
