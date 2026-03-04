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


export async function getEmployeeByEmail(email: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("employee")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;

  return data;
}


export async function registerEmployee({
  email,
  name,
  department,
  role,
}: {
  email: string;
  name: string;
  department: string;
  role: string;
}) {
  const supabase = getSupabase();

  // 1️⃣ Insert employee
  const { error: empError } = await supabase
    .from("employee")
    .insert({
      email,
      name,
      department,
      role,
      status: "PENDING",
    });

  if (empError) throw empError;

  // 2️⃣ Find department head
  const { data: dept } = await supabase
    .from("department")
    .select("head_email")
    .eq("name", department)
    .single();

  const headEmail = dept?.head_email;

  if (!headEmail) {
    throw new Error("Department head not configured.");
  }

  // 3️⃣ Create request
  const { error: reqError } = await supabase
    .from("request")
    .insert({
      title: `New Employee Registration - ${name}`,
      description: `Department: ${department} | Role: ${role}`,
      created_by: email,
      current_approver: headEmail,
      status: "PENDING",
      department,
      type: "NEW_EMPLOYEE_REGISTRATION",
    });

  if (reqError) throw reqError;
}