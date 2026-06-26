"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { CasesTable } from "@/components/cases-table";
import { MetricCard } from "@/components/metric-card";
import type { SupportCase } from "@/lib/types";

type CasesResponse = {
  data: SupportCase[];
};

export default function DashboardPage() {
  const [cases, setCases] = useState<SupportCase[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetch("/api/cases", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) {
            setCases([]);
            return;
          }

          const body = (await response.json()) as CasesResponse;
          setCases(body.data);
        })
        .catch(() => setCases([]));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const metrics = useMemo(() => {
    const openCases = cases.filter((supportCase) =>
      !["Closed", "Resolved"].includes(supportCase.status)
    );
    const priorityCases = cases.filter((supportCase) =>
      ["High", "Urgent"].includes(supportCase.priority)
    );
    const resolvedCases = cases.filter((supportCase) =>
      ["Closed", "Resolved"].includes(supportCase.status)
    );

    return {
      open: openCases.length,
      priority: priorityCases.length,
      resolved: resolvedCases.length,
      latest: cases[0]?.updatedAt ?? "None"
    };
  }, [cases]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Open cases"
          value={String(metrics.open)}
          detail="Loaded from Salesforce"
          icon={MessageSquareText}
        />
        <MetricCard
          title="Priority cases"
          value={String(metrics.priority)}
          detail="High or urgent priority"
          icon={AlertTriangle}
          tone="rose"
        />
        <MetricCard
          title="Latest update"
          value={metrics.latest}
          detail="Most recent Salesforce activity"
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          title="Resolved"
          value={String(metrics.resolved)}
          detail="Closed or resolved cases"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Recent cases</h2>
              <p className="text-sm text-slate-500">Your latest Salesforce support requests</p>
            </div>
            <Link
              href="/cases"
              className="rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View all
            </Link>
          </div>
          <CasesTable limit={4} />
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-semibold">Support experience</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Case updates", "Track status changes and next steps from Salesforce", "Active"],
              ["Account context", "Keep contact and preference details ready for service", "Ready"],
              ["AI assistance", "Create Salesforce cases through guided chat", "Preview"]
            ].map(([title, detail, state]) => (
              <div key={title} className="rounded-md border border-line p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{title}</p>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {state}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
