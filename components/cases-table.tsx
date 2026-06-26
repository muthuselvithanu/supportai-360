"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import type { SupportCase } from "@/lib/types";

type CasesResponse = {
  data: SupportCase[];
  message?: string;
  error?: string;
  salesforceConnected: boolean;
};

export function CasesTable({ limit }: { limit?: number }) {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [message, setMessage] = useState("Loading Salesforce cases...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetch("/api/cases", { cache: "no-store" })
        .then(async (response) => {
          const body = (await response.json()) as CasesResponse;

          if (!response.ok) {
            setCases([]);
            setMessage(body.message ?? body.error ?? "Unable to load Salesforce cases.");
            return;
          }

          setCases(body.data);
          setMessage(body.data.length ? "" : "No Salesforce cases found.");
        })
        .catch(() => {
          setCases([]);
          setMessage("Unable to reach the Salesforce cases endpoint.");
        })
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const rows = typeof limit === "number" ? cases.slice(0, limit) : cases;

  if (isLoading || !rows.length) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-slate-500 shadow-panel">
        {isLoading ? "Loading Salesforce cases..." : message}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Case</th>
              <th className="px-5 py-3 font-semibold">Priority</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((supportCase) => (
              <tr key={supportCase.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link
                    href={`/cases/${supportCase.id}`}
                    className="block rounded-md outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <p className="font-semibold text-brand-700">{supportCase.number}</p>
                    <p className="mt-1 max-w-xs truncate text-slate-500">{supportCase.subject}</p>
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-700">{supportCase.priority}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={supportCase.status} />
                </td>
                <td className="px-5 py-4 text-slate-700">
                  {supportCase.contactName || supportCase.contactEmail || "Customer"}
                </td>
                <td className="px-5 py-4 text-slate-500">{supportCase.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
