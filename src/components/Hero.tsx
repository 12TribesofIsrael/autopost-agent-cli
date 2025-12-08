import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const scrollToHow = () => {
    document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Text content */}
          <div className="animate-fade-in-up">
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
              Upload one video.{" "}
              <span className="text-primary">We post it everywhere.</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg text-muted-foreground">
              Turn one clip into a week of content. Our AI agent resizes, captions,
              and schedules your video across TikTok, YouTube Shorts, Instagram Reels and more.
            </p>
            <div className="mb-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button variant="outline" onClick={scrollToHow}>
                See how it works
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Free to start – set up your workflows in minutes.
            </p>
          </div>

          {/* Preview card */}
          <div
            className="animate-slide-in-right gradient-card rounded-2xl border border-border/80 p-6 shadow-soft"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Demo preview
              </span>
              <h2 className="mt-2 text-lg font-semibold">Autopost summary</h2>
            </div>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                1 video → 5+ platforms
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                AI titles, descriptions & hashtags
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Scheduling & posting automation
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Ready to connect to your backend in minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
