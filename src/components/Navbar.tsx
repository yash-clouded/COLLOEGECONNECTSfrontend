import { Link, useLocation } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { BrandLogo } from "@/components/BrandLogo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Meet Advisor", href: "#advisors" },
  { label: "Why Us", href: "#why-us" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthResolved(true);
    });
  }, []);
  const isPostSigninPage =
    location.pathname.startsWith("/student/dashboard") ||
    location.pathname.startsWith("/advisor/dashboard");
  const showTopNav = !isPostSigninPage || !authResolved || !authUser;

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href === "/") {
      window.location.href = "/";
      return;
    }
    if (isHomePage) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/" + href;
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* Logo */}
        <BrandLogo size="md" asLink />

        {/* Desktop Nav */}
        {showTopNav ? (
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-200 hover:text-glow-teal"
                data-ocid="nav.link"
              >
                {link.label}
              </button>
            ))}
          </nav>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Get Started Button */}
        {showTopNav ? (
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/get-started"
              className="inline-flex items-center justify-center bg-neon-orange hover:bg-neon-orange/80 hover:scale-105 text-black font-semibold rounded-xl px-5 py-2 text-sm glow-orange transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        ) : null}

        {/* Mobile toggle */}
        {showTopNav ? (
          <button
            type="button"
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-ocid="nav.toggle"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        ) : null}
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {showTopNav && mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-strong border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-4 gap-3">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left text-sm font-body text-muted-foreground hover:text-foreground transition-colors py-2"
                  data-ocid="nav.link"
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/get-started"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center bg-neon-orange hover:bg-neon-orange/80 text-black font-semibold rounded-xl px-5 py-2.5 text-sm glow-orange transition-all duration-300 mt-2"
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}