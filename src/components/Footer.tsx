const Footer = () => {
  return (
    <footer className="mt-10 border-t border-border/50 py-8">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xl font-bold">
            Grow<span className="text-primary">YourBrand</span>
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GrowYourBrand. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Powered by BMBAIAUTOMATIONS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
