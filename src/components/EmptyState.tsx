import { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message?: string }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto size-14 rounded-full bg-muted grid place-items-center mb-3">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="font-semibold">{title}</div>
      {message && <div className="text-sm text-muted-foreground mt-1">{message}</div>}
    </div>
  );
}
