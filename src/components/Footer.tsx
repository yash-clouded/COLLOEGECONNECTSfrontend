import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="inline-flex transition-opacity hover:opacity-95"
            aria-label="CollegeConnect home"
          >
            <BrandLogo size="sm" />
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>

          {/* Attribution */}
          <p className="text-sm text-muted-foreground text-center">
            © {year}. Built with <span className="text-neon-orange">♥</span>
          </p>
        </div>
      </div>
    </footer>
  );
}