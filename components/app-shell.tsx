"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserRound
} from "lucide-react";
import { SalesforceConnectionStatus } from "@/components/salesforce/salesforce-connection-status";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: BriefcaseBusiness },
  { name: "Assistant", href: "/assistant", icon: Bot },
  { name: "Profile", href: "/profile", icon: UserRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title =
    navigation.find((item) => pathname.startsWith(item.href))?.name ??
    "SupportAI 360";

  return (
    <div className="min-h-screen bg-cloud text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-line bg-white px-5 py-6 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white">
            S
          </span>
          <span>
            <span className="block text-lg font-semibold">SupportAI 360</span>
            <span className="text-sm text-slate-500">Customer portal</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 rounded-md border border-line bg-slate-50 p-4">
          <p className="text-sm font-medium">Salesforce connection</p>
          <SalesforceConnectionStatus />
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-slate-600 lg:hidden"
                aria-label="Open navigation"
                title="Open navigation"
              >
                <Menu size={18} />
              </button>
              <div>
                <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
                <p className="hidden text-sm text-slate-500 sm:block">
                  Manage your support requests and account details
                </p>
              </div>
            </div>

            <div className="hidden h-10 min-w-64 items-center gap-2 rounded-md border border-line bg-slate-50 px-3 text-sm text-slate-500 md:flex">
              <Search size={17} />
              <span>Search cases and account activity</span>
            </div>

            <Link
              href="/api/auth/logout"
              className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white text-slate-600"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}


