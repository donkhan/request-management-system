import { useEffect, useState } from "react";
import { getAllDepartments } from "../services/departmentService";
import { getAllRoles } from "../services/roleService";
import { registerEmployee } from "../services/employeeService";

interface Props {
  user: {
    email: string;
    name?: string;
  };
  onRegistered: () => void;
}

export default function RegistrationPage({
  user,
  onRegistered,
}: Props) {
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllDepartments().then(setDepartments);
    getAllRoles().then(setRoles);
  }, []);

  const handleSubmit = async () => {
    if (!selectedDept || !selectedRole) {
      alert("Please select department and role");
      return;
    }

    try {
      setLoading(true);

      await registerEmployee({
        email: user.email,
        name: user.name ?? user.email,
        department: selectedDept,
        role: selectedRole,
      });

      await onRegistered();
    } catch (err: any) {
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-[400px] space-y-6">
        <h2 className="text-xl font-semibold text-center">
          Complete Registration
        </h2>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full border rounded-xl p-3"
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full border rounded-xl p-3"
        >
          <option value="">Select Role</option>
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}