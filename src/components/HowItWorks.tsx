const steps = [
  {
    number: 1,
    title: "Upload or paste your video link",
    description:
      "Drop a link from Google Drive, Dropbox, YouTube, or any video host.",
  },
  {
    number: 2,
    title: "Choose platforms & preferences",
    description:
      "Pick TikTok, YouTube Shorts, Instagram Reels and more. Add notes for clips, style, or posting schedule.",
  },
  {
    number: 3,
    title: "AI agent handles the rest",
    description:
      "The backend will resize, caption, and post your content on autopilot.",
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
