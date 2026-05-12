import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export function KpiCard({
  label, value, icon: Icon, accent = "primary", hint,
}: { label: string; value: string | number; icon: LucideIcon; accent?: "primary" | "secondary" | "success" | "warning"; hint?: string }) {
  const accentMap = {
    primary: "from-primary/20 to-transparent text-primary",
    secondary: "from-secondary/30 to-transparent text-secondary-foreground",
    success: "from-success/20 to-transparent text-success",
    warning: "from-warning/20 to-transparent text-warning",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5 shadow-card"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-60 pointer-events-none`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1.5 text-2xl md:text-3xl font-bold">{value}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className={`size-10 rounded-lg grid place-items-center bg-background/40 ${accentMap[accent].split(" ").pop()}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </motion.div>
  );
}
