"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { I18nProvider } from "@/components/I18nProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCustomerPortal = pathname === "/portal" || pathname.startsWith("/portal/");
  const content = isCustomerPortal ? children : <AuthProvider>{children}</AuthProvider>;

  return <I18nProvider>{content}</I18nProvider>;
}
