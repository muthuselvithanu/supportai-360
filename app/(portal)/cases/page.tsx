import Link from "next/link";
import { Filter, Plus, SlidersHorizontal } from "lucide-react";
import { CasesTable } from "@/components/cases-table";

export default function CasesPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold">Cases</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review your Salesforce support requests, priorities, and latest service updates
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700">
            <Filter size={17} />
            Filter
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-slate-700">
            <SlidersHorizontal size={17} />
            Columns
          </button>
          <Link
            href="/assistant"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-medium text-white"
          >
            <Plus size={17} />
            Case
          </Link>
        </div>
      </div>

      <CasesTable />
    </div>
  );
}
