import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCustomerPortalDemoAvailable } from "@/app/lib/customer-portal-demo-guard";
import { PortalDemoProvider } from "@/components/portal/PortalDemoProvider";
import { PortalShell } from "@/components/portal/PortalShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fictional Customer Portal Demo | JOHAI",
  description: "Development-only fictional Customer Portal pilot.",
  robots: { index: false, follow: false },
};

export default function PortalDemoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!isCustomerPortalDemoAvailable()) notFound();

  return (
    <PortalDemoProvider>
      <PortalShell>{children}</PortalShell>
    </PortalDemoProvider>
  );
}
