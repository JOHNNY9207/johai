import { connection } from "next/server";
import { PortalAuthProvider } from "@/components/portal/PortalAuthProvider";
import { PortalProvider } from "@/components/portal/PortalProvider";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function ProtectedPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const referenceTime = new Date().toISOString();

  return (
    <PortalAuthProvider>
      <PortalProvider referenceTime={referenceTime}>
        <PortalShell>{children}</PortalShell>
      </PortalProvider>
    </PortalAuthProvider>
  );
}
