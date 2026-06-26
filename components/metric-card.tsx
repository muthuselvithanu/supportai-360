import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "rose";
};

const tones = {
  blue: "bg-brand-50 text-brand-700",
  green: "bg-mint-100 text-mint-600",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700"
};

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "blue"
}: MetricCardProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-md ${tones[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </section>
  );
}
