import { Suspense } from "react";
import { PortalAuthProvider } from "@/components/portal/PortalAuthProvider";
import { PortalLogin } from "@/components/portal/PortalLogin";
import { PortalScreenLoader } from "@/components/portal/PortalUi";

export default function PortalLoginPage() {
  return (
    <PortalAuthProvider>
      <Suspense fallback={<PortalScreenLoader label="Preparing secure sign-in" />}>
        <PortalLogin />
      </Suspense>
    </PortalAuthProvider>
  );
}
