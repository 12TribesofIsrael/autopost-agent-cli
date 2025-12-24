import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Autopost<span className="text-primary">Agent</span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          {isHome ? (
            <>
              <a
                href="#how"
                className="hidden md:inline text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                How it works
              </a>
              <a
                href="#pricing"
                className="hidden md:inline text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </a>
            </>
          ) : (
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
          )}
          <Link
            to="/intake"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Intake
          </Link>
          <Button variant="nav" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
