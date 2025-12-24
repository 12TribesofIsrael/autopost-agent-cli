import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Self-Service",
    price: "$49",
    period: "/month",
    description: "You post, we distribute everywhere else.",
    features: [
      "Post to your source platform",
      "Auto-repurpose to 5+ platforms",
      "Up to 20 videos/month",
      "AI-optimized captions & hashtags",
      "Basic analytics dashboard",
    ],
    featured: false,
  },
  {
    name: "Done-For-You",
    price: "$199",
    period: "/month",
    description: "Send us your content, we handle everything.",
    features: [
      "Send us your raw content",
      "We upload & repurpose for you",
      "Unlimited videos",
      "Priority scheduling & posting",
      "Custom captions per platform",
      "Dedicated support",
    ],
    featured: true,
    tagline: "Most popular",
  },
  {
    name: "Full Creation",
    price: "$499",
    period: "/month",
    description: "We create AND distribute your content.",
    features: [
      "Original content creation",
      "Full repurposing across all platforms",
      "Dedicated content strategist",
      "Brand voice & style matching",
      "Monthly strategy calls",
      "White-glove service",
    ],
    featured: false,
    tagline: "Best value for growth",
  },
];

const addons = [
  { name: "Account creation", price: "$35/platform", description: "One-time setup fee" },
  { name: "Extra platforms", price: "$15/platform/mo", description: "Beyond included 5" },
  { name: "Priority support", price: "$29/mo", description: "Same-day responses" },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-14 md:py-20">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the level of service that fits your brand. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "animate-fade-in-up rounded-2xl border p-6 relative flex flex-col",
                plan.featured
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                  : "border-border/80 bg-card/50"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.tagline && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  {plan.tagline}
                </span>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <p className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </p>
              <ul className="space-y-3 text-sm flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-center mb-4">Optional Add-ons</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className="text-center p-4 rounded-lg border border-border/60 bg-card/30"
              >
                <p className="font-medium text-sm">{addon.name}</p>
                <p className="text-primary font-bold">{addon.price}</p>
                <p className="text-xs text-muted-foreground">{addon.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
