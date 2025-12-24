import { TrendingUp, Users, Video, Zap } from "lucide-react";

const stats = [
  {
    icon: Users,
    stat: "6.83",
    label: "Social Networks",
    description: "The average person uses 6.83 different social platforms. Your audience is everywhere.",
  },
  {
    icon: Video,
    stat: "2.5x",
    label: "More Engagement",
    description: "Short-form video gets 2.5x more engagement than any other content type.",
  },
  {
    icon: TrendingUp,
    stat: "49%",
    label: "Faster Growth",
    description: "Businesses using video marketing grow revenue 49% faster than those who don't.",
  },
  {
    icon: Zap,
    stat: "82%",
    label: "Purchase Influence",
    description: "82% of consumers say short-form video directly influenced their purchase decision.",
  },
];

const WhyMultiPlatform = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
            The Data Doesn't Lie
          </p>
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl mb-4">
            Why You <span className="text-primary">Need</span> Multi-Platform Presence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your competitors are already everywhere. Here's why posting on one platform isn't enough anymore.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {stats.map((item, index) => (
            <div
              key={index}
              className="relative group bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="text-4xl font-extrabold text-foreground mb-1">
                {item.stat}
              </div>
              <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                {item.label}
              </div>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12 text-center animate-fade-in">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            3x Your Reach Without 3x The Work
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            TikTok, Instagram Reels, and YouTube Shorts combined reach <span className="text-foreground font-semibold">billions of users daily</span>. 
            YouTube Shorts alone has over <span className="text-foreground font-semibold">5 trillion all-time views</span>. 
            Post to your favorite platform once, and we'll make sure you're everywhere—without the extra effort.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-background/80 px-4 py-2 rounded-full border border-border">
              <span className="font-semibold">TikTok:</span> 40% market share, 50% user purchases
            </div>
            <div className="bg-background/80 px-4 py-2 rounded-full border border-border">
              <span className="font-semibold">Reels:</span> 50% of IG time spent watching
            </div>
            <div className="bg-background/80 px-4 py-2 rounded-full border border-border">
              <span className="font-semibold">Shorts:</span> 5 trillion+ all-time views
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyMultiPlatform;
