import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Autopost<span className="text-primary">Agent</span>
        </Link>
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
            <Link to="/auth">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
