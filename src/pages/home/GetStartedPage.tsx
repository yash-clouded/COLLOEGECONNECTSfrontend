import { BrandLogo } from "@/components/BrandLogo";
import { Link } from "@tanstack/react-router";
import { Briefcase, GraduationCap, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function GetStartedPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, oklch(0.67 0.19 40) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.15 175) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(oklch(0.6 0.01 265) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0.01 265) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <Link to="/" className="inline-flex" aria-label="CollegeConnect home">
              <BrandLogo size="xl" />
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 glass neon-border-teal rounded-full px-4 py-2 mb-6 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-teal animate-pulse" />
            <span className="text-muted-foreground">Join CollegeConnect</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Get <span className="gradient-text-orange">Started</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose your role to create an account or sign in.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Advisor Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative glass rounded-2xl border border-neon-orange/30 p-6 sm:p-8 group hover:-translate-y-1.5 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-neon-orange/10 flex items-center justify-center">
                <Briefcase className="text-neon-orange" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">Advisor</h2>
                <p className="text-xs text-muted-foreground">College student</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Share your college experience, guide students, and earn money by listing sessions.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/auth/advisor/signup"
                className="inline-flex items-center justify-center bg-neon-orange hover:bg-neon-orange/80 hover:scale-105 text-black font-semibold rounded-xl px-5 py-2.5 text-sm glow-orange transition-all duration-300"
              >
                <UserPlus size={16} className="mr-2" />
                Create Advisor Account
              </Link>
              <Link
                to="/auth/advisor/login"
                className="inline-flex items-center justify-center border border-neon-orange/40 text-neon-orange hover:bg-neon-orange/15 hover:border-neon-orange hover:scale-105 rounded-xl px-5 py-2.5 text-sm transition-all duration-300"
              >
                <LogIn size={16} className="mr-2" />
                Sign In as Advisor
              </Link>
            </div>

            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: "inset 0 0 26px oklch(0.67 0.19 40 / 0.08), 0 0 40px oklch(0.67 0.19 40 / 0.06)" }}
            />
          </motion.div>

          {/* Student Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative glass rounded-2xl border border-neon-teal/30 p-6 sm:p-8 group hover:-translate-y-1.5 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-neon-teal/10 flex items-center justify-center">
                <GraduationCap className="text-neon-teal" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">Student</h2>
                <p className="text-xs text-muted-foreground">Aspiring college student</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Connect with real college students, get honest advice, and make the right college decision.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/auth/student/signup"
                className="inline-flex items-center justify-center bg-neon-teal hover:bg-neon-teal/80 hover:scale-105 text-black font-semibold rounded-xl px-5 py-2.5 text-sm glow-teal transition-all duration-300"
              >
                <UserPlus size={16} className="mr-2" />
                Create Student Account
              </Link>
              <Link
                to="/auth/student/login"
                className="inline-flex items-center justify-center border border-neon-teal/40 text-neon-teal hover:bg-neon-teal/15 hover:border-neon-teal hover:scale-105 rounded-xl px-5 py-2.5 text-sm transition-all duration-300"
              >
                <LogIn size={16} className="mr-2" />
                Sign In as Student
              </Link>
            </div>

            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: "inset 0 0 26px oklch(0.78 0.15 175 / 0.08), 0 0 40px oklch(0.78 0.15 175 / 0.06)" }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}