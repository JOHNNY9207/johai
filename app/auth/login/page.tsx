import { Suspense } from "react";
import AuthClient from "@/app/auth/AuthClient";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthClient initialMode="login" />
    </Suspense>
  );
}
