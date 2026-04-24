import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      tone: {
        neutral: "border-[var(--border)] bg-[rgba(255,255,255,0.04)] text-[var(--muted-foreground)]",
        success: "border-[rgba(124,224,195,0.3)] bg-[rgba(124,224,195,0.12)] text-[var(--primary)]",
        warning: "border-[rgba(255,200,107,0.35)] bg-[rgba(255,200,107,0.12)] text-[var(--accent)]",
        danger: "border-[rgba(255,125,125,0.3)] bg-[rgba(255,125,125,0.12)] text-[var(--danger)]"
      }
    },
    defaultVariants: {
      tone: "neutral"
    }
  }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
