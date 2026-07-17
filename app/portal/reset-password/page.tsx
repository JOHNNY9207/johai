import { PortalAuthProvider } from "@/components/portal/PortalAuthProvider";
import { PortalResetPassword } from "@/components/portal/PortalResetPassword";

export default function PortalResetPasswordPage() {
  return (
    <PortalAuthProvider>
      <PortalResetPassword />
    </PortalAuthProvider>
  );
}
