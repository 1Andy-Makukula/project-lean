"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Gift,
  Home,
  MessageSquareShare,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Shop", icon: Home },
  { href: "/send", label: "Send", icon: Gift },
  { href: "/pay", label: "Pay", icon: CreditCard },
  { href: "/confirmation", label: "Share", icon: MessageSquareShare },
];

export function SenderShell({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:grid lg:min-h-screen lg:grid-cols-[260px,1fr] lg:gap-6 lg:px-8 lg:py-6">
        <aside className="hidden rounded-[28px] bg-white p-6 shadow-card lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <BadgeCheck className="h-3.5 w-3.5" />
                KithLy
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Buy, send, and settle with confidence.
                </h1>
                <p className="text-sm leading-6 text-slate-500">
                  A minimal Sender flow for gifting real items that can be redeemed locally with one secure code.
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-4 transition",
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </span>
                    <span className={cn("text-xs", active ? "text-slate-300" : "text-slate-400")}>
                      0{index + 1}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Trust palette</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              White surfaces, slate typography, and one decisive action color keep every step calm and credible.
            </p>
          </div>
        </aside>

        <main className="space-y-6 rounded-[28px] bg-white shadow-card">
          <header className="border-b border-slate-100 px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {eyebrow}
                </p>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
                </div>
              </div>

              <div className="hidden lg:flex">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white">
                  Live sender prototype
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </header>

          <div className="px-6 pb-6">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition",
                  active ? "bg-slate-900 text-white" : "text-slate-500"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
