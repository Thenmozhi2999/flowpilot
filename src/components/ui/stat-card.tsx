import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { MetricCard } from "@/types/dashboard";

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus
} as const;

type StatCardProps = {
  metric: MetricCard;
};

export function StatCard({ metric }: StatCardProps) {
  const TrendIcon = trendIcon[metric.trend];

  return (
    <article className="rounded-[24px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-5">
      <p className="text-sm text-[var(--muted)]">{metric.label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-tight">{metric.value}</p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
            metric.trend === "up" && "bg-[rgba(124,224,195,0.12)] text-[var(--primary)]",
            metric.trend === "down" && "bg-[rgba(255,125,125,0.12)] text-[var(--danger)]",
            metric.trend === "neutral" && "bg-[rgba(255,255,255,0.06)] text-[var(--muted-foreground)]"
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {metric.delta}
        </span>
      </div>
    </article>
  );
}
