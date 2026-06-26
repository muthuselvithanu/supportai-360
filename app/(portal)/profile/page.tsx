import { currentUser } from "@/lib/mock-data";

export default function ProfilePage() {
  const initials = currentUser.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
        <div className="grid h-20 w-20 place-items-center rounded-lg bg-brand-600 text-2xl font-semibold text-white">
          {initials}
        </div>
        <h2 className="mt-5 text-xl font-semibold">{currentUser.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{currentUser.company}</p>
        <div className="mt-6 space-y-3 text-sm">
          <p className="flex justify-between gap-4">
            <span className="text-slate-500">Account</span>
            <span className="font-medium">{currentUser.accountNumber}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-slate-500">Preferred contact</span>
            <span className="font-medium">{currentUser.preferredContactMethod}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-slate-500">Timezone</span>
            <span className="font-medium">{currentUser.timezone}</span>
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
        <h2 className="text-lg font-semibold">Customer profile</h2>
        <form className="mt-6 grid gap-5 md:grid-cols-2">
          {[
            ["Full name", currentUser.name],
            ["Email", currentUser.email],
            ["Phone", currentUser.phone],
            ["Company", currentUser.company],
            ["Account number", currentUser.accountNumber],
            ["Preferred contact method", currentUser.preferredContactMethod],
            ["Timezone", currentUser.timezone]
          ].map(([label, value]) => (
            <label key={label} className="space-y-2 text-sm font-medium text-slate-700">
              <span>{label}</span>
              <input
                defaultValue={value}
                className="h-11 w-full rounded-md border border-line bg-slate-50 px-3 text-sm outline-none focus:border-brand-500"
              />
            </label>
          ))}
          <div className="md:col-span-2">
            <button
              type="button"
              className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Save profile
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
