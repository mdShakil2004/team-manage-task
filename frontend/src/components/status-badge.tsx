import { Badge } from "@/components/ui/badge";
import type { ProjectStatus, TaskPriority, TaskStatus } from "@/lib/api-types";
import { priorityLabel, projectStatusLabel, taskStatusLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-muted text-muted-foreground border-transparent",
  IN_PROGRESS: "bg-info/15 text-info border-transparent",
  REVIEW: "bg-warning/20 text-warning-foreground border-transparent",
  DONE: "bg-success/15 text-success border-transparent",
};

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-muted text-muted-foreground border-transparent",
  MEDIUM: "bg-info/15 text-info border-transparent",
  HIGH: "bg-warning/20 text-warning-foreground border-transparent",
  URGENT: "bg-destructive/15 text-destructive border-transparent",
};

const projectStatusStyles: Record<ProjectStatus, string> = {
  PLANNING: "bg-info/15 text-info border-transparent",
  ACTIVE: "bg-success/15 text-success border-transparent",
  ON_HOLD: "bg-warning/20 text-warning-foreground border-transparent",
  COMPLETED: "bg-muted text-muted-foreground border-transparent",
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", statusStyles[status], className)}>
      {taskStatusLabel[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", priorityStyles[priority], className)}>
      {priorityLabel[priority]}
    </Badge>
  );
}

export function ProjectStatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", projectStatusStyles[status], className)}>
      {projectStatusLabel[status]}
    </Badge>
  );
}
