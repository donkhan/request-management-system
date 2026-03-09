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
  description,
}: {
  email: string;
  name: string;
  department: string;
  role: string;
  description: string;
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
      description: description,
      created_by: email,
      current_approver: headEmail,
      status: "PENDING",
      department,
      type: "NEW_EMPLOYEE_REGISTRATION",
    });

  if (reqError) throw reqError;
}

export async function resolveApprover(userEmail: string): Promise<string | null> {
  const supabase = getSupabase();

  // 1️⃣ get employee department
  const { data: emp, error: empError } = await supabase
    .from("employee")
    .select("department")
    .eq("email", userEmail)
    .single();

  if (empError) throw empError;

  const departmentName = emp.department;

  // 2️⃣ get department
  const { data: dept, error: deptError } = await supabase
    .from("department")
    .select("head_email,parent_department")
    .eq("name", departmentName)
    .single();

  if (deptError) throw deptError;

  // 3️⃣ if user is NOT head → send to head
  if (dept.head_email !== userEmail) {
    return dept.head_email;
  }

  // 4️⃣ if user IS head → go to parent department
  if (!dept.parent_department) {
    return null;
  }

  const { data: parentDept, error: parentError } = await supabase
    .from("department")
    .select("head_email")
    .eq("name", dept.parent_department)
    .single();

  if (parentError) throw parentError;

  return parentDept.head_email;
}