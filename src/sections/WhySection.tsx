import { Award, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";

const features = [
  {
    icon: Users,
    title: "Real Student Insights",
    description:
      "Every advisor is a currently enrolled student. You get lived experience, not curated marketing content from a college PR team.",
    borderClass: "border-l-4 border-l-neon-orange",
    iconBg: "bg-neon-orange/10",
    iconColor: "text-neon-orange",
  },
  {
    icon: ShieldCheck,
    title: "No Fake Reviews",
    description:
      "Sessions are real conversations, not anonymous posts. Advisors are verified students with genuine credentials and college IDs.",
    borderClass: "border-l-4 border-l-neon-teal",
    iconBg: "bg-neon-teal/10",
    iconColor: "text-neon-teal",
  },
  {
    icon: MessageCircle,
    title: "Direct Conversations",
    description:
      "Ask questions you'd never find answers to online — about ragging, placements, professors, hostel life, and everything between.",
    borderClass: "border-l-4 border-l-neon-blue",
    iconBg: "bg-neon-blue/10",
    iconColor: "text-neon-blue",
  },
  {
    icon: Award,
    title: "Trusted Guidance",
    description:
      "Thousands of families have made better college decisions using CollegeConnect. Join them and choose confidently.",
    borderClass: "border-l-4 border-l-neon-orange",
    iconBg: "bg-neon-orange/10",
    iconColor: "text-neon-orange",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export default function WhySection() {
  return (
    <section
      id="why-us"
      className="relative py-24 px-4 sm:px-6 overflow-hidden"
    >
      {/* BG */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-[0.04] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.16 230), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: header */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
              Why Choose Us
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
              Why <span className="gradient-text-multi">CollegeConnect</span>
              <br />
              is Different
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              We built the platform we wished existed when we were choosing
              colleges — a space for real conversations, not scripted showcases.
            </p>

            <div className="mt-8 flex items-center gap-6">
              {[
                { value: "12,000+", label: "Sessions Completed" },
                { value: "98%", label: "Satisfaction Rate" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-display font-bold gradient-text-orange">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: feature cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className={`glass rounded-2xl p-5 ${
                  feature.borderClass
                } border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lift cursor-default`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-3`}
                >
                  <feature.icon size={18} className={feature.iconColor} />
                </div>
                <h3 className="font-display font-semibold text-base text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
