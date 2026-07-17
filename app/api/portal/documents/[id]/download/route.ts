import "server-only";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AuthorizedDocument = {
  id: string;
  business_id: string;
  customer_profile_id: string;
  title: string;
};

type TrustedDocument = AuthorizedDocument & {
  storage_bucket: string;
  storage_path: string;
  revoked_at: string | null;
};

function json(body: Record<string, string>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function canonicalStoragePath(value: string) {
  if (
    !value ||
    value.startsWith("/") ||
    value.includes("\\") ||
    value.includes("%") ||
    /[\u0000-\u001f\u007f?#]/.test(value)
  ) {
    return null;
  }

  const segments = value.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return null;
  return segments.join("/") === value ? value : null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!uuidPattern.test(id)) return json({ error: "Document unavailable." }, 404);

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return json({ error: "Sign-in required." }, 401);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const allowedBuckets = new Set(
    (process.env.CUSTOMER_PORTAL_DOCUMENT_BUCKETS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );

  if (!supabaseUrl || !anonKey || !serviceRoleKey || allowedBuckets.size === 0) {
    return json({ error: "Secure downloads are not configured." }, 503);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser(token);
  if (userError || !user) return json({ error: "Sign-in required." }, 401);

  const { data, error } = await callerClient
    .from("customer_portal_documents")
    .select("id,business_id,customer_profile_id,title")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return json({ error: "Document unavailable." }, 404);
  const authorized = data as AuthorizedDocument;

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const { data: trustedData, error: trustedError } = await serviceClient
    .from("customer_portal_documents")
    .select("id,business_id,customer_profile_id,title,storage_bucket,storage_path,revoked_at")
    .eq("id", authorized.id)
    .eq("business_id", authorized.business_id)
    .eq("customer_profile_id", authorized.customer_profile_id)
    .maybeSingle();

  if (trustedError || !trustedData) {
    return json({ error: "Document unavailable." }, 404);
  }

  const document = trustedData as TrustedDocument;
  const tupleMatches =
    document.id === authorized.id &&
    document.business_id === authorized.business_id &&
    document.customer_profile_id === authorized.customer_profile_id;
  const storagePath = canonicalStoragePath(document.storage_path);
  const requiredPrefix = `${authorized.business_id}/${authorized.customer_profile_id}/`;

  if (
    !tupleMatches ||
    document.revoked_at !== null ||
    !storagePath ||
    !allowedBuckets.has(document.storage_bucket) ||
    !storagePath.startsWith(requiredPrefix)
  ) {
    return json({ error: "Document unavailable." }, 404);
  }

  const filename = authorized.title.replace(/[^a-z0-9._ -]/gi, "").trim() || "document";
  const { data: signed, error: signedError } = await serviceClient.storage
    .from(document.storage_bucket)
    .createSignedUrl(storagePath, 60, { download: filename });

  if (signedError || !signed?.signedUrl) {
    return json({ error: "Document unavailable." }, 404);
  }

  return NextResponse.json(
    { url: signed.signedUrl },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
