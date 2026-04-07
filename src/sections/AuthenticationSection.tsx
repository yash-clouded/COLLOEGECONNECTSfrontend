import { BrandLogo } from "@/components/BrandLogo";
import { Link } from "@tanstack/react-router";
import { Briefcase, GraduationCap, LogIn, UserPlus } from "lucide-react";
import { motion } from "motion/react";

export default function AuthenticationSection() {
  return (
    <section
      id="authentication"
      className="relative py-24 px-4 sm:px-6 overflow-hidden scroll-mt-24"
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 55% at 50% 0%, oklch(0.72 0.16 230), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <div className="flex justify-center mb-6">
            <Link to="/" className="inline-flex" aria-label="CollegeConnect home">
              <BrandLogo size="lg" />
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
            Accounts & Access
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground">
            <span className="gradient-text-multi">Authentication</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your role to sign up or sign in.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Advisor card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative glass rounded-2xl border border-neon-orange/30 p-6 sm:p-8 group hover:-translate-y-1.5 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-neon-orange/10 flex items-center justify-center">
                <Briefcase className="text-neon-orange" size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground">
                For Advisors
              </h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Create your advisor profile or sign back in to manage sessions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/auth/advisor/signup"
                className="inline-flex items-center justify-center bg-neon-orange hover:bg-neon-orange/80 hover:scale-105 hover:shadow-lg text-black font-semibold rounded-xl px-5 py-2.5 text-sm glow-orange transition-all duration-300"
              >
                <UserPlus size={16} className="mr-2" />
                Sign Up for Advisor
              </Link>
              <Link
                to="/auth/advisor/login"
                className="inline-flex items-center justify-center border border-neon-orange/40 text-neon-orange hover:bg-neon-orange/15 hover:border-neon-orange hover:scale-105 hover:shadow-lg rounded-xl px-5 py-2.5 text-sm transition-all duration-300"
              >
                <LogIn size={16} className="mr-2" />
                Sign In for Advisor
              </Link>
            </div>

            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow: "inset 0 0 26px oklch(0.67 0.19 40 / 0.08), 0 0 40px oklch(0.67 0.19 40 / 0.06)",
              }}
            />
          </motion.div>

          {/* Student card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
            className="relative glass rounded-2xl border border-neon-teal/30 p-6 sm:p-8 group hover:-translate-y-1.5 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-neon-teal/10 flex items-center justify-center">
                <GraduationCap className="text-neon-teal" size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-foreground">
                For Students
              </h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Get started booking sessions or sign in to continue your journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/auth/student/signup"
                className="inline-flex items-center justify-center bg-neon-teal hover:bg-neon-teal/80 hover:scale-105 hover:shadow-lg text-black font-semibold rounded-xl px-5 py-2.5 text-sm glow-teal transition-all duration-300"
              >
                <UserPlus size={16} className="mr-2" />
                Sign Up for Student
              </Link>
              <Link
                to="/auth/student/login"
                className="inline-flex items-center justify-center border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/15 hover:border-neon-teal hover:scale-105 hover:shadow-lg rounded-xl px-5 py-2.5 text-sm transition-all duration-300"
              >
                <LogIn size={16} className="mr-2" />
                Sign In for Student
              </Link>
            </div>

            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow: "inset 0 0 26px oklch(0.78 0.15 175 / 0.08), 0 0 40px oklch(0.78 0.15 175 / 0.06)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}