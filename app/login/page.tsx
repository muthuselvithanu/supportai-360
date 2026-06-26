import { Cloud } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cloud px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-7 shadow-panel">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white">
            S
          </span>
          <div>
            <h1 className="text-2xl font-semibold">SupportAI 360</h1>
            <p className="text-sm text-slate-500">Salesforce customer support portal</p>
          </div>
        </div>

        <a
          href="/api/auth/salesforce/login"
          className="mt-8 flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Cloud size={18} />
          Sign in with Salesforce
        </a>

        <p className="mt-5 text-sm leading-6 text-slate-500">
          Salesforce OAuth is the current sign-in method. App-specific email login can be added later if needed.
        </p>
      </section>
    </main>
  );
}
