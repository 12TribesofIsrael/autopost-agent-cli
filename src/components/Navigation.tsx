import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Grow<span className="text-primary">YourBrand</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isHome ? (
            <>
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
              <a
                href="#faq"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                FAQ
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="container py-4 flex flex-col gap-4"
            >
              {isHome ? (
                <>
                  <a
                    href="#how"
                    onClick={closeMobileMenu}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    How it works
                  </a>
                  <a
                    href="#pricing"
                    onClick={closeMobileMenu}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    Pricing
                  </a>
                  <a
                    href="#faq"
                    onClick={closeMobileMenu}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground py-2"
                  >
                    FAQ
                  </a>
                </>
              ) : (
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground py-2"
                >
                  Home
                </Link>
              )}
              <Link
                to="/intake"
                onClick={closeMobileMenu}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground py-2"
              >
                Intake
              </Link>
              <Button variant="nav" size="sm" asChild className="w-fit">
                <Link to="/auth" onClick={closeMobileMenu}>Sign In</Link>
              </Button>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;
