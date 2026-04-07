import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Advisor } from "../backend.d";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export default function Advisors({
  advisors,
  onFiltered,
}: {
  advisors: Advisor[];
  onFiltered: (filtered: Advisor[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [college, setCollege] = useState<string>("all");
  const [branch, setBranch] = useState<string>("all");

  const debouncedQuery = useDebouncedValue(query, 200);

  const colleges = useMemo(
    () => uniqueSorted(advisors.map((a) => a.college ?? "")),
    [advisors],
  );
  const branches = useMemo(
    () => uniqueSorted(advisors.map((a) => a.branch ?? "")),
    [advisors],
  );

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return advisors.filter((a) => {
      const c = (a.college ?? "").toLowerCase();
      const b = (a.branch ?? "").toLowerCase();
      if (college !== "all" && a.college !== college) return false;
      if (branch !== "all" && a.branch !== branch) return false;
      if (!q) return true;
      return c.includes(q) || b.includes(q);
    });
  }, [advisors, branch, college, debouncedQuery]);

  useEffect(() => {
    onFiltered(filtered);
  }, [filtered, onFiltered]);

  const showClear = query.trim().length > 0;

  return (
    <div className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        className="mt-6"
      >
        {/* Search Input */}
        <div className="mx-auto w-full max-w-xl">
          <div
            className={`relative glass rounded-2xl transition-all duration-300 ${
              focused ? "neon-border-teal" : "border border-border"
            }`}
          >
            <Search
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                focused ? "text-neon-teal" : "text-muted-foreground"
              }`}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search colleges or branches..."
              className="bg-transparent border-0 pl-11 pr-12 py-4 h-14 text-base rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              data-ocid="advisors.search_input"
              aria-label="Search colleges or branches"
            />
            {showClear && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
          <div className="w-full sm:w-60">
            <Select value={college} onValueChange={setCollege}>
              <SelectTrigger className="glass rounded-xl border border-border hover:border-neon-teal/40 transition-colors">
                <SelectValue placeholder="College" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All colleges</SelectItem>
                {colleges.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-60">
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="glass rounded-xl border border-border hover:border-neon-teal/40 transition-colors">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>
    </div>
  );
}