"use client";

import { useEffect, useState } from "react";

type SalesforceStatusResponse = {
  connected: boolean;
};

export function SalesforceConnectionStatus() {
  const [connected, setConnected] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/salesforce/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: SalesforceStatusResponse) => {
        if (isMounted) {
          setConnected(Boolean(data.connected));
          setLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
      <span className={`h-2 w-2 rounded-full ${connected ? "bg-mint-600" : "bg-amber-700"}`} />
      {loaded && connected ? "Connected" : "Pending authorization"}
    </div>
  );
}
