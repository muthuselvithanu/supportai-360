import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, CalendarDays } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import {
  SALESFORCE_ACCESS_TOKEN_COOKIE,
  SALESFORCE_INSTANCE_URL_COOKIE
} from "@/services/salesforceOAuth";
import { getSalesforceCaseById } from "@/services/salesforceCases";

export default async function CaseDetailPage({
  params
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SALESFORCE_ACCESS_TOKEN_COOKIE)?.value;
  const instanceUrl = cookieStore.get(SALESFORCE_INSTANCE_URL_COOKIE)?.value;

  if (!accessToken || !instanceUrl) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center shadow-panel">
        <h2 className="text-xl font-semibold">Salesforce sign-in required</h2>
        <p className="mt-2 text-sm text-slate-500">Connect Salesforce to view case details.</p>
        <Link
          href="/assistant"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Go to Assistant
        </Link>
      </div>
    );
  }

  const supportCase = await getSalesforceCaseById(instanceUrl, accessToken, caseId);

  if (!supportCase) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-ink">
        <ArrowLeft size={17} />
        Cases
      </Link>

      <div className="flex flex-col justify-between gap-4 rounded-lg border border-line bg-white p-6 shadow-panel lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold">{supportCase.number}</h2>
            <StatusBadge status={supportCase.status} />
          </div>
          <p className="mt-2 max-w-3xl text-slate-600">{supportCase.subject}</p>
        </div>
        <Link
          href={`/assistant?case=${supportCase.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Bot size={17} />
          Ask AI about this case
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold">Case details</h3>
          <p className="mt-4 leading-7 text-slate-600">{supportCase.description}</p>
          <div className="mt-6 rounded-md border border-line bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Next step</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{supportCase.nextStep}</p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <h3 className="text-lg font-semibold">Summary</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Priority</dt>
                <dd className="font-medium">{supportCase.priority}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Contact</dt>
                <dd className="font-medium">{supportCase.contactName || "Customer"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium">{supportCase.contactEmail || "Not provided"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Created</dt>
                <dd className="font-medium">{supportCase.createdAt}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays size={18} />
              Activity
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="rounded-md border border-line p-3">Updated {supportCase.updatedAt}</p>
              <p className="rounded-md border border-line p-3">Open Salesforce for comments, owner, and full activity history.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
