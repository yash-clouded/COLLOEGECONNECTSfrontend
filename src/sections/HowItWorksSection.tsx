import { Calendar, Lightbulb, Search, Video } from "lucide-react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Search Advisor",
    description:
      "Browse student advisors by college, branch, or year. Filter by rating and session price to find your perfect match.",
    borderColor: "border-neon-orange/40",
    iconBg: "bg-neon-orange/10",
    iconColor: "text-neon-orange",
    numberColor: "text-neon-orange/20",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Book Session",
    description:
      "Choose a time slot that works for you. Pay securely online for a 30 or 60-minute one-on-one session.",
    borderColor: "border-neon-teal/40",
    iconBg: "bg-neon-teal/10",
    iconColor: "text-neon-teal",
    numberColor: "text-neon-teal/20",
  },
  {
    icon: Video,
    number: "03",
    title: "Talk on Google Meet",
    description:
      "Join a private Google Meet session. Ask anything — hostel life, academics, placements, campus culture.",
    borderColor: "border-neon-blue/40",
    iconBg: "bg-neon-blue/10",
    iconColor: "text-neon-blue",
    numberColor: "text-neon-blue/20",
  },
  {
    icon: Lightbulb,
    number: "04",
    title: "Get Real Insights",
    description:
      "Walk away with honest, first-hand knowledge that no brochure or review site can give you.",
    borderColor: "border-neon-orange/40",
    iconBg: "bg-neon-orange/10",
    iconColor: "text-neon-orange",
    numberColor: "text-neon-orange/20",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 px-4 sm:px-6 overflow-hidden"
    >
      {/* Subtle bg gradient */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.78 0.15 175), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-teal animate-pulse" />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground">
            How It <span className="gradient-text-teal">Works</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            From search to insight in four simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className={`relative glass rounded-2xl p-6 border ${
                step.borderColor
              } group hover:-translate-y-2 transition-transform duration-300`}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-6 z-10">
                  <div className="h-px w-full bg-gradient-to-r from-border to-transparent" />
                </div>
              )}

              {/* Number */}
              <div
                className={`text-7xl font-display font-bold ${step.numberColor} leading-none mb-4 select-none`}
              >
                {step.number}
              </div>

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center mb-4`}
              >
                <step.icon size={22} className={step.iconColor} />
              </div>

              {/* Content */}
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
