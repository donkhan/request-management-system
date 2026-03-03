import { getSupabase } from "../supabase";

function db() {
  return getSupabase();
}

export async function fetchEmployeeProfile(email: string) {
  const { data, error } = await db()
    .from("employee")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw error;
  return data ?? null;
}

export async function getDepartmentHead(email: string) {
  const supabase = db();
  const { data: emp, error: empError } = await supabase
    .from("employee")
    .select("department")
    .eq("email", email)
    .single();

  if (empError || !emp?.department) {
    throw new Error("Employee department not found");
  }

  const { data: dept, error: deptError } = await supabase
    .from("department")
    .select("head_email")
    .eq("name", emp.department)
    .single();

  if (deptError || !dept?.head_email) {
    throw new Error("Department head not found");
  }

  return dept.head_email;
}


export async function getApprovedEmployeesByDepartment(
  departmentName: string
) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("employee")
    .select("email, name")
    .eq("department", departmentName)
    .eq("status", "APPROVED");

  if (error) throw error;

  return data || [];
}