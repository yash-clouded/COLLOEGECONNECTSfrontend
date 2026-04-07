import { BrandLogo, brandLogoSrc } from "@/components/BrandLogo";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function HeroSection() {
  const headline = "Talk to Real College Students";
  const headline2 = "Before Choosing Your College";

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, oklch(0.67 0.19 40) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="orb-2 absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.15 175) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="orb-3 absolute -bottom-24 left-1/3 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.16 230) 0%, transparent 70%)", filter: "blur(70px)" }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(oklch(0.6 0.01 265) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0.01 265) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
      </div>

      {/* Large background mark — PNG alpha only, no CSS “plate” behind it */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
        aria-hidden
      >
        <img
          src={brandLogoSrc}
          alt=""
          width={1024}
          height={1024}
          className="w-[min(92vw,760px)] max-h-[min(58vh,560px)] object-contain object-center opacity-[0.09] select-none bg-transparent"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 flex justify-center"
        >
          <BrandLogo size="xl" />
        </motion.div>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass neon-border-teal rounded-full px-4 py-2 mb-8 text-sm"
        >
          <Sparkles size={14} className="text-neon-teal" />
          <span className="text-muted-foreground">Connect with real students, not bots</span>
          <span className="text-neon-teal font-semibold">→ 500+ Advisors</span>
        </motion.div>

        {/* Headline */}
        <div className="mb-6 overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight"
          >
            <span className="text-foreground">{headline}</span>
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight mt-2"
          >
            <span className="gradient-text-multi">{headline2}</span>
          </motion.h1>
        </div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Get honest, unfiltered insights from current undergrads —{" "}
          <span className="text-foreground font-medium">before you commit to a college.</span>
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-16 pt-8 border-t border-border/40"
        >
          {[
            { value: "500+", label: "Student Advisors", color: "text-neon-orange" },
            { value: "50+", label: "Top Colleges", color: "text-neon-teal" },
            { value: "4.9★", label: "Average Rating", color: "text-neon-blue" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}