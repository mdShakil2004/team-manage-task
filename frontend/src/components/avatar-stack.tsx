import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/api-types";
import { getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function AvatarStack({ users, max = 4, size = "sm" }: { users: User[]; max?: number; size?: "sm" | "md" }) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  const sz = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  return (
    <div className="flex -space-x-2">
      {shown.map((u) => {
        return (
          <Avatar key={u.id} className={cn(sz, "ring-2 ring-card")}>
            <AvatarFallback className="bg-accent text-accent-foreground font-medium">{getInitials(u.name)}</AvatarFallback>
          </Avatar>
        );
      })}
      {extra > 0 && (
        <div className={cn(sz, "ring-2 ring-card rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium")}>
          +{extra}
        </div>
      )}
    </div>
  );
}
