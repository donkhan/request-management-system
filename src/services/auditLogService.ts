import { getSupabase } from "../supabase";

function db() {
  return getSupabase();
}

export async function fetchAuditLogs(requestId: string) {
  const { data, error } = await db()
    .from("audit_log")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}