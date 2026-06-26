type StatusBadgeProps = {
  status: string;
};

const classes: Record<string, string> = {
  New: "bg-brand-50 text-brand-700",
  Open: "bg-mint-100 text-mint-600",
  Pending: "bg-amber-100 text-amber-700",
  Escalated: "bg-rose-100 text-rose-700",
  Resolved: "bg-slate-100 text-slate-600",
  Closed: "bg-slate-100 text-slate-600"
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${classes[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
