import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { SeoFromRoute } from "./components/SeoFromRoute";
import type { ReactNode } from "react";

export default function App({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      <SeoFromRoute />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-neon-teal"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
