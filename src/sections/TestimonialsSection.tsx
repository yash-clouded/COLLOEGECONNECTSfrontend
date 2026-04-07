import { Quote, Star } from "lucide-react";
import { motion } from "motion/react";

const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"];

const testimonials = [
  {
    id: "t1",
    quote:
      "I was torn between IIT Roorkee and BITS Pilani. One session with a BITS student cleared everything — I understood the culture, the placement scene, and the campus life in 45 minutes.",
    name: "Rahul Kapoor",
    role: "JEE Advanced 2024 qualifier",
    stars: 5,
    color: "orange",
  },
  {
    id: "t2",
    quote:
      "As a parent, I was worried about sending my daughter far from home. Talking to a girl from NIT Trichy about hostel safety and faculty accessibility made all the difference.",
    name: "Meena Krishnan",
    role: "Parent of NIT Trichy student",
    stars: 5,
    color: "teal",
  },
  {
    id: "t3",
    quote:
      "No college counsellor could tell me what coding culture at IIT Bombay is really like. A 3rd year CSE student explained it better in 30 minutes than any website ever could.",
    name: "Dev Anand",
    role: "IIT Aspirant, Class of 2024",
    stars: 5,
    color: "blue",
  },
  {
    id: "t4",
    quote:
      "I asked about the quality of life, food, professors, everything. My advisor was incredibly honest about the pros and cons. No sugar-coating — exactly what I needed.",
    name: "Simran Gill",
    role: "Now studying at BITS Pilani",
    stars: 5,
    color: "orange",
  },
  {
    id: "t5",
    quote:
      "My son got into VIT but wasn't sure if it was worth it over a state NIT. The session with a VIT final-year student helped him decide confidently. Best ₹400 we ever spent.",
    name: "Suresh Nair",
    role: "Parent of IIT Bombay student",
    stars: 5,
    color: "teal",
  },
  {
    id: "t6",
    quote:
      "The platform is so simple. I booked a session in 2 minutes, got on Meet, and had the most real conversation about engineering college life I've ever had.",
    name: "Tanvi Bhat",
    role: "Currently at IIT Delhi",
    stars: 5,
    color: "blue",
  },
];

const colorMap: Record<string, string> = {
  orange: "border-neon-orange/30",
  teal: "border-neon-teal/30",
  blue: "border-neon-blue/30",
};

const quoteColorMap: Record<string, string> = {
  orange: "text-neon-orange",
  teal: "text-neon-teal",
  blue: "text-neon-blue",
};

function TestimonialCard({ t }: { t: (typeof testimonials)[0]; key?: string }) {
  return (
    <div
      className={`glass rounded-2xl p-6 border ${
        colorMap[t.color]
      } w-[340px] sm:w-[380px] flex-shrink-0`}
    >
      <Quote size={20} className={`${quoteColorMap[t.color]} mb-4`} />
      <p className="text-sm text-foreground/90 leading-relaxed mb-5">
        {t.quote}
      </p>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display font-semibold text-sm text-foreground">
            {t.name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
        </div>
        <div className="flex gap-0.5">
          {STAR_KEYS.slice(0, t.stars).map((k) => (
            <Star
              key={k}
              size={12}
              className="text-neon-orange fill-neon-orange"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const doubled = [
    ...testimonials.map((t) => ({ ...t, key: `a-${t.id}` })),
    ...testimonials.map((t) => ({ ...t, key: `b-${t.id}` })),
  ];

  return (
    <section id="testimonials" className="relative py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
            Real Stories
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground">
            What Students{" "}
            <span className="gradient-text-orange">&amp; Parents Say</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Thousands of families have made confident college decisions with
            CollegeConnect.
          </p>
        </motion.div>
      </div>

      {/* Scrolling testimonials track */}
      <div className="relative overflow-hidden">
        {/* Left/right fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, oklch(0.09 0.01 265), transparent)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, oklch(0.09 0.01 265), transparent)",
          }}
        />

        <div className="testimonial-track px-0">
          {doubled.map((t) => (
            <TestimonialCard key={t.id + t.key} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
