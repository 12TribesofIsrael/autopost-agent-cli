const steps = [
  {
    number: 1,
    title: "Post to your favorite platform",
    description:
      "Upload your video to TikTok, YouTube, or Instagram—wherever you already post.",
  },
  {
    number: 2,
    title: "Connect your accounts",
    description:
      "Link your social platforms once. Tell us your posting preferences and schedule.",
  },
  {
    number: 3,
    title: "We distribute everywhere",
    description:
      "Our AI automatically repurposes and posts your content to all connected platforms.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-14 md:py-20">
      <div className="container">
        <h2 className="mb-10 text-2xl font-bold md:text-3xl">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="animate-fade-in-up rounded-xl border border-border/80 bg-secondary/50 p-6 shadow-subtle"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {step.number}
              </div>
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
