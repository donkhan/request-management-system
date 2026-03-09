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

export default function RegistrationPage({ user, onRegistered }: Props) {
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  const [registrationType, setRegistrationType] = useState<
    "EMPLOYEE" | "DEPARTMENT_HEAD"
  >("EMPLOYEE");

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [parentDepartment, setParentDepartment] = useState("");
  const [isDeptHead, setIsDeptHead] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllDepartments().then(setDepartments);
    getAllRoles().then(setRoles);
  }, []);

  const handleSubmit = async () => {
    try {
      if (!selectedRole) {
        alert("Please select role");
        return;
      }

      if (registrationType === "EMPLOYEE" && !selectedDept) {
        alert("Please select department");
        return;
      }

      if (registrationType === "DEPARTMENT_HEAD") {
        if (!newDepartmentName || !parentDepartment) {
          alert("Please enter new department name and parent department");
          return;
        }
      }

      setLoading(true);

      // Department used for employee insertion (FK safe)
      const department =
        registrationType === "EMPLOYEE"
          ? selectedDept
          : parentDepartment;

      // Build structured description
      let description = "";

      if (registrationType === "EMPLOYEE") {
        description = `Department Type: EXISTING | Department: ${selectedDept} | Role: ${selectedRole}`;
      }

      if (registrationType === "DEPARTMENT_HEAD") {
        description =
          `Department Type: NEW | ` +
          `New Department: ${newDepartmentName} | ` +
          `Parent Department: ${parentDepartment} | ` +
          `Is Department Head: ${isDeptHead ? "YES" : "NO"} | ` +
          `Role: ${selectedRole}`;
      }

      await registerEmployee({
        email: user.email,
        name: user.name ?? user.email,
        department,
        role: selectedRole,
        description,
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
      <div className="bg-white p-10 rounded-3xl shadow-xl w-[420px] space-y-6">
        <h2 className="text-xl font-semibold text-center">
          Complete Registration
        </h2>

        {/* Registration Type */}
        <div className="space-y-2">
          <label className="font-medium text-sm">Registration Type</label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="EMPLOYEE"
              checked={registrationType === "EMPLOYEE"}
              onChange={() => setRegistrationType("EMPLOYEE")}
            />
            Employee of Existing Department
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="DEPARTMENT_HEAD"
              checked={registrationType === "DEPARTMENT_HEAD"}
              onChange={() => setRegistrationType("DEPARTMENT_HEAD")}
            />
            Register a New Department
          </label>
        </div>

        {/* Role Selection */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full border rounded-xl p-3"
        >
          <option value="">Select Role</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Existing Employee Flow */}
        {registrationType === "EMPLOYEE" && (
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full border rounded-xl p-3"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}

        {/* New Department Flow */}
        {registrationType === "DEPARTMENT_HEAD" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Department Name
              </label>

              <input
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="Enter new department name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Parent Department
              </label>

              <select
                value={parentDepartment}
                onChange={(e) => setParentDepartment(e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="">Select Parent Department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDeptHead}
                onChange={(e) => setIsDeptHead(e.target.checked)}
              />
              I will be the Head of this Department
            </label>
          </>
        )}

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