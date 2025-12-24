import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Self-Service",
    price: "$29",
    period: "/month",
    features: [
      "Post to your source platform",
      "We auto-repurpose to all others",
      "Up to 10 videos/month",
      "AI-optimized captions & hashtags",
    ],
    featured: false,
  },
  {
    name: "Done-For-You",
    price: "$99",
    period: "/month",
    features: [
      "Send us your content",
      "We handle all uploads & repurposing",
      "Unlimited videos",
      "Priority scheduling",
    ],
    featured: true,
    tagline: "Most popular for busy creators.",
  },
  {
    name: "Full Creation",
    price: "Custom",
    period: "",
    features: [
      "We create original content for you",
      "Full repurposing across platforms",
      "Dedicated content strategist",
      "White-glove service",
    ],
    featured: false,
    tagline: "For brands that want it all.",
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-14 md:py-20">
      <div className="container">
        <h2 className="mb-10 text-2xl font-bold md:text-3xl">
          Simple creator-friendly pricing
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "animate-fade-in-up rounded-xl border p-6",
                plan.featured
                  ? "border-primary bg-secondary/80 shadow-soft"
                  : "border-border/80 bg-secondary/50"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="mb-2 font-semibold">{plan.name}</h3>
              <p className="mb-4 text-3xl font-bold">
                {plan.price}
                {plan.period && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </p>
              <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {plan.tagline && (
                <p className="text-sm font-medium text-primary">{plan.tagline}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
