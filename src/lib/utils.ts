import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Priority, Status } from "@/types/task";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDueDate(dateString?: string | null): {
  text: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  formattedDate: string;
} {
  if (!dateString) {
    return { text: "No due date", isOverdue: false, isDueSoon: false, formattedDate: "" };
  }

  const dueDate = new Date(dateString);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = dueDate.toLocaleDateString("en-US", options);

  if (diffMs < 0) {
    const absDays = Math.abs(diffDays);
    return {
      text: absDays === 0 ? "Overdue today" : `Overdue by ${absDays} day${absDays > 1 ? "s" : ""}`,
      isOverdue: true,
      isDueSoon: false,
      formattedDate,
    };
  } else if (diffHours <= 24) {
    const hours = Math.max(1, Math.round(diffHours));
    return {
      text: `Due in ${hours} hour${hours > 1 ? "s" : ""}`,
      isOverdue: false,
      isDueSoon: true,
      formattedDate,
    };
  } else if (diffDays <= 3) {
    return {
      text: `Due in ${diffDays} days`,
      isOverdue: false,
      isDueSoon: true,
      formattedDate,
    };
  }

  return {
    text: formattedDate,
    isOverdue: false,
    isDueSoon: false,
    formattedDate,
  };
}

export const priorityConfig: Record<
  Priority,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  urgent: {
    label: "Urgent",
    bg: "bg-rose-500/10 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
    dot: "bg-rose-500",
  },
  high: {
    label: "High",
    bg: "bg-amber-500/10 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  medium: {
    label: "Medium",
    bg: "bg-blue-500/10 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  low: {
    label: "Low",
    bg: "bg-slate-500/10 dark:bg-slate-800/40",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
  },
};

export const statusConfig: Record<
  Status,
  { label: string; bg: string; text: string; border: string }
> = {
  todo: {
    label: "To Do",
    bg: "bg-slate-800/50",
    text: "text-slate-300",
    border: "border-slate-700",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-blue-900/30",
    text: "text-blue-400",
    border: "border-blue-700/50",
  },
  done: {
    label: "Done",
    bg: "bg-emerald-900/30",
    text: "text-emerald-400",
    border: "border-emerald-700/50",
  },
};
