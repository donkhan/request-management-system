import { useEffect, useState } from "react";
import { getSupabase } from "../supabase";

interface Department {
  name: string;
  parent_department: string | null;
  head_email: string | null;
}

interface Employee {
  email: string;
  name: string;
  department: string;
  role: string;
}

export default function HierarchyPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const supabase = getSupabase();

  useEffect(() => {
    const load = async () => {
      const { data: deptData } = await supabase.from("department").select("*");

      const { data: empData } = await supabase
        .from("employee")
        .select("email,name,department,role")
        .eq("status", "APPROVED");

      setDepartments(deptData || []);
      setEmployees(empData || []);
    };

    load();
  }, []);

  const getEmployees = (dept: string) =>
    employees.filter((e) => e.department === dept);

  const getChildren = (dept: string) =>
    departments.filter((d) => d.parent_department === dept);

  const renderDept = (dept: Department) => {
    const children = getChildren(dept.name);
    const staff = getEmployees(dept.name);

    return (
      <div key={dept.name} className="flex flex-col items-center">

        {/* Department Box */}
        <div className="bg-blue-100 border border-blue-300 rounded-xl px-6 py-4 shadow text-center min-w-[180px]">
          <div className="font-semibold">{dept.name}</div>

          {dept.head_email && (
            <div className="text-xs text-gray-600 mt-1">
              👑 {dept.head_email}
            </div>
          )}
        </div>

        {/* Employees */}
        {staff.length > 0 && (
          <div className="flex gap-3 mt-3 flex-wrap justify-center">

            {staff.map((emp) => (
              <div
                key={emp.email}
                className="bg-green-100 border border-green-300 rounded-lg px-3 py-2 text-sm shadow"
              >
                {emp.name}
              </div>
            ))}

          </div>
        )}

        {/* Connector */}
        {children.length > 0 && (
          <div className="w-px h-8 bg-gray-300"></div>
        )}

        {/* Child Departments */}
        {children.length > 0 && (
          <div className="flex gap-10 mt-4">
            {children.map(renderDept)}
          </div>
        )}
      </div>
    );
  };

  const rootDepartments = departments.filter(
    (d) => !d.parent_department
  );

  return (
    <div className="p-10 overflow-auto">

      <h1 className="text-3xl font-bold text-center mb-10">
        University Org Chart
      </h1>

      {/* University Root */}
      <div className="flex justify-center mb-10">
        <div className="bg-purple-100 border border-purple-300 rounded-2xl px-10 py-6 shadow-lg text-xl font-semibold">
          🎓 CMR University
        </div>
      </div>

      {/* Root Departments */}
      <div className="flex justify-center gap-20">
        {rootDepartments.map(renderDept)}
      </div>

    </div>
  );
}