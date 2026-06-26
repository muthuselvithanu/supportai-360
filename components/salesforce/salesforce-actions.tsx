"use client";

import { useEffect, useState } from "react";
import { Cloud } from "lucide-react";

type SalesforceStatus = {
  connected: boolean;
  instanceUrl: string | null;
  message: string;
};

export function SalesforceActions() {
  const [status, setStatus] = useState<SalesforceStatus | null>(null);

  async function loadStatus() {
    const response = await fetch("/api/salesforce/status", { cache: "no-store" });
    const data = (await response.json()) as SalesforceStatus;
    setStatus(data);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStatus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const isConnected = Boolean(status?.connected);

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Salesforce</h2>
          <p className="mt-1 text-sm text-slate-500">
            {status?.message ?? "Checking Salesforce connection..."}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold ${
            isConnected ? "bg-mint-100 text-mint-600" : "bg-amber-100 text-amber-700"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {isConnected ? "Connected" : "Not connected"}
        </span>
      </div>

      <a
        href="/api/auth/salesforce/login"
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Cloud size={17} />
        Sign in with Salesforce
      </a>

      {status?.instanceUrl && (
        <p className="mt-3 truncate text-xs text-slate-500">Instance: {status.instanceUrl}</p>
      )}
    </section>
  );
}
