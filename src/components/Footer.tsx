const Footer = () => {
  return (
    <footer className="mt-10 border-t border-border/50 py-6">
      <div className="container text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AutopostAgent. MVP UI ready for backend integration.
      </div>
    </footer>
  );
};

export default Footer;
