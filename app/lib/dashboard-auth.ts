import "server-only";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const dashboardCookieName = "johai_dashboard_auth";

function getDashboardPassword() {
  return process.env.DASHBOARD_PASSWORD?.trim() ?? "";
}

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function isDashboardPasswordConfigured() {
  return Boolean(getDashboardPassword());
}

export function getDashboardSetupError() {
  return "Dashboard access is not configured. Add DASHBOARD_PASSWORD to your environment variables, then restart the Next.js server.";
}

export async function isDashboardAuthenticated() {
  const password = getDashboardPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(dashboardCookieName)?.value;

  if (!authCookie) {
    return false;
  }

  const expectedHash = hashPassword(password);
  const received = Buffer.from(authCookie);
  const expected = Buffer.from(expectedHash);

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

export async function authenticateDashboard(password: string) {
  const configuredPassword = getDashboardPassword();

  if (!configuredPassword) {
    return {
      ok: false,
      reason: "missing-password" as const,
    };
  }

  const received = Buffer.from(password);
  const expected = Buffer.from(configuredPassword);
  const passwordMatches =
    received.length === expected.length && timingSafeEqual(received, expected);

  if (!passwordMatches) {
    return {
      ok: false,
      reason: "invalid-password" as const,
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(dashboardCookieName, hashPassword(configuredPassword), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/dashboard",
    maxAge: 60 * 60 * 8,
  });

  return {
    ok: true,
    reason: "authenticated" as const,
  };
}

export async function clearDashboardSession() {
  const cookieStore = await cookies();

  cookieStore.delete(dashboardCookieName);
}
