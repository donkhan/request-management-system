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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const supabase = getSupabase();

  useEffect(() => {
    const load = async () => {
      const { data: deptData } = await supabase
        .from("department")
        .select("*");

      const { data: empData } = await supabase
        .from("employee")
        .select("email,name,department,role")
        .eq("status", "APPROVED");

      setDepartments(deptData || []);
      setEmployees(empData || []);
    };

    load();
  }, []);

  const toggle = (name: string) => {
    setExpanded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const renderDept = (dept: Department) => {
    const children = departments.filter(
      (d) => d.parent_department === dept.name
    );

    const deptEmployees = employees.filter(
      (e) => e.department === dept.name
    );

    return (
      <div key={dept.name} className="ml-8 mt-4">

        {/* Department Card */}
        <div
          className="bg-blue-100 border border-blue-300 rounded-xl p-4 shadow cursor-pointer hover:bg-blue-200 transition"
          onClick={() => toggle(dept.name)}
        >
          <div className="font-semibold text-lg">{dept.name}</div>

          {dept.head_email && (
            <div className="text-sm text-gray-600">
              Head: {dept.head_email}
            </div>
          )}
        </div>

        {/* Children */}
        {expanded[dept.name] && (
          <div className="ml-6 border-l-2 border-gray-300 pl-6">

            {/* Employees */}
            {deptEmployees.map((emp) => (
              <div
                key={emp.email}
                className="bg-green-100 border border-green-300 rounded-lg p-3 mt-3 shadow-sm"
              >
                <div className="font-medium">{emp.name}</div>
                <div className="text-xs text-gray-600">
                  {emp.role} • {emp.email}
                </div>
              </div>
            ))}

            {/* Child Departments */}
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
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8 text-center">
        University Hierarchy
      </h1>

      <div className="flex justify-center">
        <div className="bg-purple-100 border border-purple-300 rounded-2xl p-6 shadow-lg text-center font-semibold text-xl">
          CMR University
        </div>
      </div>

      <div className="mt-8">
        {rootDepartments.map(renderDept)}
      </div>

    </div>
  );
}