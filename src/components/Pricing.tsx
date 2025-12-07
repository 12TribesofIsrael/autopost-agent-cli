import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    features: ["Up to 4 videos per month", "Post to 3 platforms", "AI titles & hashtags"],
    featured: false,
  },
  {
    name: "Pro Creator",
    price: "$49",
    period: "/month",
    features: ["Unlimited videos", "All major platforms", "Scheduling & analytics"],
    featured: true,
    tagline: "Perfect tier to launch first.",
  },
  {
    name: "Agency",
    price: "Custom",
    period: "",
    features: ["Multiple client accounts", "White-label options", "Priority support"],
    featured: false,
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
