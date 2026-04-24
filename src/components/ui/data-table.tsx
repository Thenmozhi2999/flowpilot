import { cn } from "@/lib/utils/cn";

type Column<T> = {
  key: keyof T;
  header: string;
  className?: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  rows: T[];
  className?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  className
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-[24px] border border-[var(--border)]", className)}>
      <table className="min-w-full divide-y divide-[var(--border)]">
        <thead className="bg-[rgba(255,255,255,0.03)]">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[rgba(6,11,20,0.48)]">
          {rows.map((row, index) => (
            <tr key={index} className="transition hover:bg-[rgba(255,255,255,0.03)]">
              {columns.map((column) => {
                const value = row[column.key];

                return (
                  <td
                    key={String(column.key)}
                    className={cn("px-4 py-4 align-top text-sm text-[var(--foreground)]", column.className)}
                  >
                    {column.render ? column.render(value, row) : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
