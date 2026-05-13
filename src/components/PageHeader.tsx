import { ReactNode } from "react";
import logo from "@/assets/logo.png";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 glass border-b border-border px-4 md:px-8 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={logo}
          alt="Pizzas Bien Criollo"
          className="size-10 md:size-12 rounded-full object-cover ring-2 ring-primary/40 shadow-glow shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
