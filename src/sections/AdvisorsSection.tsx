import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Advisor } from "../backend.d";
import { useGetAllAdvisors } from "../hooks/useQueries";

const SAMPLE_ADVISORS: (Advisor & { id: string })[] = [
  { id: "a1", name: "Kartik Shukla", college: "RGIPT", branch: "Petroleum Engineering", year: BigInt(2), rating: 4.9, sessionPrice: BigInt(499) },
  { id: "a2", name: "Hitesh Sirvi", college: "RGIPT", branch: "Information Technology", year: BigInt(2), rating: 4.8, sessionPrice: BigInt(399) },
  { id: "a3", name: "Rohan Vishwakarma", college: "RGIPT", branch: "Electronics Engineering", year: BigInt(2), rating: 4.7, sessionPrice: BigInt(349) },
  { id: "a4", name: "Bhargav Venkat", college: "RGIPT", branch: "Mathematics and Computing", year: BigInt(2), rating: 4.9, sessionPrice: BigInt(549) },
  { id: "a5", name: "Kishan", college: "RGIPT", branch: "Mathematics and Computing", year: BigInt(2), rating: 4.6, sessionPrice: BigInt(299) },
  { id: "a6", name: "Yashwanth", college: "RGIPT", branch: "Mathematics and Computing", year: BigInt(2), rating: 4.8, sessionPrice: BigInt(449) },
];

const avatarColors = [
  "from-neon-orange to-orange-400",
  "from-neon-teal to-teal-400",
  "from-neon-blue to-blue-400",
  "from-purple-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

function AdvisorCard({ advisor, index }: { advisor: Advisor; index: number; key?: string | number }) {
  const [hovered, setHovered] = useState(false);
  const initials = advisor.name.split(" ").map((n) => n[0]).join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative glass rounded-2xl border border-border overflow-hidden group cursor-pointer"
      style={{
        boxShadow: hovered
          ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 30px oklch(0.67 0.19 40 / 0.12)"
          : undefined,
      }}
      data-ocid={`advisors.card.${index + 1}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-lg font-display font-bold text-white shadow-lg`}>
            {initials}
          </div>
          <div className="flex items-center gap-1 glass rounded-full px-3 py-1">
            <Star size={12} className="text-neon-orange fill-neon-orange" />
            <span className="text-sm font-semibold text-foreground">{advisor.rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-1">{advisor.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={13} className="text-neon-teal" />
          <span className="text-sm text-neon-teal font-medium">{advisor.college}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{advisor.branch}</p>
        <p className="text-sm text-muted-foreground">Year {advisor.year.toString()}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div>
            <span className="text-sm text-muted-foreground">per session</span>
            <div className="text-xl font-display font-bold text-neon-orange">₹{advisor.sessionPrice.toString()}</div>
          </div>
          <motion.div
            animate={{ x: hovered ? 2 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center text-xs text-muted-foreground"
          >
            View profile
            <ArrowRight size={12} className="ml-1" />
          </motion.div>
        </div>
      </div>
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ border: "1px solid oklch(0.67 0.19 40 / 0.4)", boxShadow: "inset 0 0 20px oklch(0.67 0.19 40 / 0.05)" }}
      />
    </motion.div>
  );
}

export default function AdvisorsSection() {
  const { data: backendAdvisors } = useGetAllAdvisors();
  const advisors = backendAdvisors && backendAdvisors.length > 0 ? backendAdvisors : SAMPLE_ADVISORS;

  return (
    <section id="advisors" className="relative py-24 px-4 sm:px-6 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.67 0.19 40), transparent 70%)", filter: "blur(80px)" }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-pulse" />
            Verified Students
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground">
            Meet Our <span className="gradient-text-orange">Advisors</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Real students from India's top colleges, ready to share their honest experience.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advisors.map((advisor, i) => {
            const advKey = "id" in advisor ? (advisor as { id: string }).id : `advisor-${i}`;
            return (
              <AdvisorCard
                key={advKey}
                advisor={advisor}
                index={i}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}