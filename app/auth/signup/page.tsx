import { Suspense } from "react";
import AuthClient from "@/app/auth/AuthClient";

export default function SignupPage() {
  return (
    <Suspense>
      <AuthClient initialMode="signup" />
    </Suspense>
  );
}
