import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    role: "Boxing Coach",
    quote: "I used to spend 30 minutes uploading the same clip to three apps. Now I just send it once and it's done. Game changer.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    role: "Fitness Studio Owner",
    quote: "My content is finally consistent across all platforms. My followers love it and I get my time back.",
    rating: 5,
  },
  {
    name: "David R.",
    role: "MMA Gym Owner",
    quote: "Simple, fast, and it actually works. Perfect for busy gym owners who don't have time to post everywhere.",
    rating: 5,
  },
];

const SocialProof = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
            Trusted by creators
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            What Beta Users Are Saying
          </h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <p className="text-foreground/90 mb-4 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            <span className="font-semibold text-foreground">Currently in Beta</span> — Join now and help shape the product
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
