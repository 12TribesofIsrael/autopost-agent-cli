import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="container flex items-center justify-between py-4">
        <div className="text-xl font-bold tracking-tight">
          Autopost<span className="text-primary">Agent</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#how"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <Button variant="nav" size="sm" asChild>
            <a href="#get-started">Get started</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
