import { format, formatDistanceToNowStrict } from "date-fns";

export function formatRelativeTime(input: Date) {
  return `${formatDistanceToNowStrict(input, { addSuffix: true })}`;
}

export function formatDuration(startedAt: Date | null, completedAt: Date | null) {
  if (!startedAt) {
    return "Not started";
  }

  const end = completedAt ?? new Date();
  const diffMs = Math.max(end.getTime() - startedAt.getTime(), 0);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }

  return `${seconds}s`;
}

export function formatTimestamp(input: Date) {
  return format(input, "yyyy-MM-dd HH:mm 'ET'");
}

export function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
