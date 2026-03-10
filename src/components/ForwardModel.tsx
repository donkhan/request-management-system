import { useEffect, useState } from "react";
import {
  getAllDepartments,
  getDepartmentHead,
} from "../services/departmentService";
import { getApprovedEmployeesByDepartment } from "../services/employeeService";
import { forwardRequestToUser } from "../services/requestService";

interface Props {
  requestId: string;
  currentUserEmail: string;
  department?: string;
  comment?: string;
  action?: "RECOMMENDED" | "PROCESSING";
  onClose: () => void;
  onSuccess: (email?: string) => void;
}

export default function ForwardModal({
  requestId,
  currentUserEmail,
  department,
  comment,
  action = "RECOMMENDED",
  onClose,
  onSuccess,
}: Props) {
  const [departments, setDepartments] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [mode, setMode] = useState<"HEAD" | "USER">("HEAD");

  useEffect(() => {
    getAllDepartments().then(setDepartments).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDept) return;

    getApprovedEmployeesByDepartment(selectedDept)
      .then(setUsers)
      .catch(console.error);
  }, [selectedDept]);

  const handleForward = async () => {
    let targetEmail: string | null = selectedUser;

    if (mode === "HEAD") {
      targetEmail = await getDepartmentHead(selectedDept);
    }

    if (!targetEmail) {
      alert("Please select a valid user");
      return;
    }

    // SUBMIT FLOW
    if (!requestId) {
      onSuccess(targetEmail);
      onClose();
      return;
    }

    // APPROVAL FLOW
    if (!comment?.trim()) {
      alert("Comment is required");
      return;
    }

    await forwardRequestToUser({
      requestId,
      newApproverEmail: targetEmail,
      currentUserEmail,
      department,
      comment,
      action,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-[420px] space-y-4">
        <h2 className="text-lg font-semibold">Forward Request</h2>

        {/* Department Dropdown */}
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Mode Selection */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === "HEAD"}
              onChange={() => setMode("HEAD")}
            />
            Department Head
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === "USER"}
              onChange={() => setMode("USER")}
            />
            Specific User
          </label>
        </div>

        {/* User Dropdown */}
        {mode === "USER" && (
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.email} value={u.email}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleForward}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
