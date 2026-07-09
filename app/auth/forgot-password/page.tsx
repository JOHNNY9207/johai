import { Suspense } from "react";
import AuthClient from "@/app/auth/AuthClient";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <AuthClient initialMode="forgot" />
    </Suspense>
  );
}
