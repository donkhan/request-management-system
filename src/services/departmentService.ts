// services/departmentService.ts
import { getSupabase } from "../supabase";

export async function getAllDepartments(): Promise<string[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("department")
    .select("name");

  if (error) throw error;

  return data?.map((d) => d.name) || [];
}

export async function getDepartmentHead(
  departmentName: string
): Promise<string | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("department")
    .select("head_email")
    .eq("name", departmentName)
    .single();

  if (error) throw error;

  return data?.head_email ?? null;
}