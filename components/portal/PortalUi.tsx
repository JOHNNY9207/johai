import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

export {
  formatPortalDate,
  getPortalLocale,
  getSafeTimeZone,
  portalDefaultLocale,
  portalDefaultTimeZone,
} from "@/app/lib/customer-portal-formatting";

export function PortalScreenLoader({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-950">
      <div className="text-center" role="status" aria-live="polite">
        <LoaderCircle className="mx-auto animate-spin text-cyan-700" aria-hidden="true" size={34} />
        <p className="mt-4 text-sm font-semibold text-slate-600">{label}</p>
      </div>
    </main>
  );
}

export function PortalPageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid gap-4" role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="h-28 animate-pulse rounded-[2rem] bg-white shadow-sm" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-[2rem] bg-white shadow-sm" />
        <div className="h-48 animate-pulse rounded-[2rem] bg-white shadow-sm" />
      </div>
    </div>
  );
}

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function PortalEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon aria-hidden="true" size={22} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PortalInlineError({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900" role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0" aria-hidden="true" size={18} />
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {retry ? (
            <button
              type="button"
              onClick={retry}
              className="mt-2 font-bold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Try again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PortalStatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone =
    normalized === "confirmed" || normalized === "resolved" || normalized === "completed"
      ? "bg-emerald-50 text-emerald-800"
      : normalized === "cancelled" || normalized === "closed" || normalized === "no_show"
        ? "bg-slate-100 text-slate-600"
        : "bg-amber-50 text-amber-800";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${tone}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function formatFileSize(value: number | null) {
  if (value === null || !Number.isFinite(value) || value < 0) return "Size unavailable";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function getSafeHttpsUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export const portalPrimaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-50";

export const portalSecondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-50";

export const portalInput =
  "min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100";
