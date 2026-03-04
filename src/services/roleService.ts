import { getSupabase } from "../supabase";

export async function getAllRoles(): Promise<string[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("role")
    .select("name")
    .order("name");

  if (error) throw error;

  return data?.map((r) => r.name) ?? [];
}