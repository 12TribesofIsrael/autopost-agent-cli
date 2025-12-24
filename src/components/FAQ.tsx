import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the content repurposing work?",
    answer:
      "You post to one platform (like TikTok or Instagram), and we automatically grab that content and distribute it to all your other connected platforms. No extra uploads, no extra work on your end.",
  },
  {
    question: "What platforms do you support?",
    answer:
      "We support TikTok, Instagram (Reels & Stories), YouTube Shorts, Facebook (Feed & Stories), Snapchat Stories, Pinterest, and LinkedIn. More platforms coming soon!",
  },
  {
    question: "What's the difference between the three service tiers?",
    answer:
      "Self-Service: You post to your main platform, we repurpose everywhere else. Done-For-You: Send us your content and we handle all uploads. Full Creation: We create original content for you AND repurpose it across all platforms.",
  },
  {
    question: "Do I need to give you my account passwords?",
    answer:
      "No. We use secure API connections and authorized integrations to post on your behalf. Your login credentials stay private.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Most brands are fully set up within 24-48 hours after completing the intake form. We'll email you with next steps and get your workflows running quickly.",
  },
  {
    question: "Is there a contract or commitment?",
    answer:
      "During the beta, there's no long-term commitment. We're focused on proving value first. After beta, we'll offer flexible monthly plans.",
  },
  {
    question: "Can you create accounts for platforms I don't have yet?",
    answer:
      "Yes! Account creation is available as a paid add-on service. Just indicate which platforms you need during intake and we'll handle the setup.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-14 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-4 bg-card/50"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
