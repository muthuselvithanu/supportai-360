"use client";

import Link from "next/link";
import { useState } from "react";
import { BriefcaseBusiness, CalendarClock, MessageSquarePlus, UserRoundPen } from "lucide-react";
import { ChatPanel } from "@/components/chat-panel";
import { SalesforceActions } from "@/components/salesforce/salesforce-actions";

export default function AssistantPage() {
  const [caseFlowToken, setCaseFlowToken] = useState(0);
  const [contactFlowToken, setContactFlowToken] = useState(0);
  const [callbackFlowToken, setCallbackFlowToken] = useState(0);

  function startCaseFlow() {
    setCaseFlowToken((current) => current + 1);
  }

  function startContactFlow() {
    setContactFlowToken((current) => current + 1);
  }

  function startCallbackFlow() {
    setCallbackFlowToken((current) => current + 1);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <ChatPanel
        startCaseFlowToken={caseFlowToken}
        startContactFlowToken={contactFlowToken}
        startCallbackFlowToken={callbackFlowToken}
      />

      <aside className="space-y-4">
        <SalesforceActions />

        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <div className="mt-4 grid gap-3">
            <Link
              href="/cases"
              className="flex h-11 items-center gap-3 rounded-md border border-line px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <BriefcaseBusiness size={17} />
              Show my cases
            </Link>
            <button
              type="button"
              onClick={startCaseFlow}
              className="flex h-11 items-center gap-3 rounded-md border border-line px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <MessageSquarePlus size={17} />
              Create Case
            </button>
            <button
              type="button"
              onClick={startContactFlow}
              className="flex h-11 items-center gap-3 rounded-md border border-line px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <UserRoundPen size={17} />
              Update Contact
            </button>
            <button
              type="button"
              onClick={startCallbackFlow}
              className="flex h-11 items-center gap-3 rounded-md border border-line px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <CalendarClock size={17} />
              Request Callback
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-semibold">Suggested prompts</h2>
          <div className="mt-4 space-y-3">
            {[
              ["I need to create a billing case", startCaseFlow],
              ["Update a contact phone number", startContactFlow],
              ["Request a callback", startCallbackFlow]
            ].map(([label, handler]) => (
              <button
                key={label as string}
                type="button"
                onClick={handler as () => void}
                className="w-full rounded-md border border-line px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {label as string}
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
