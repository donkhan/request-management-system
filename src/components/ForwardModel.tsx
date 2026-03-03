import { useEffect, useState } from "react";
import { getSupabase } from "../supabase";
import { forwardRequestToUser } from "../services/requestService";

interface Props {
  requestId: string;
  currentUserEmail: string;
  department?: string;
  comment?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ForwardModal({
  requestId,
  currentUserEmail,
  department,
  comment,
  onClose,
  onSuccess,
}: Props) {
  const supabase = getSupabase();

  const [departments, setDepartments] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [mode, setMode] = useState<"HEAD" | "USER">("HEAD");

  useEffect(() => {
    supabase
      .from("department")
      .select("name")
      .then(({ data }) => {
        setDepartments(data?.map((d) => d.name) || []);
      });
  }, []);

  useEffect(() => {
    if (!selectedDept) return;

    supabase
      .from("employee")
      .select("email, name")
      .eq("department", selectedDept)
      .eq("status", "APPROVED")
      .then(({ data }) => setUsers(data || []));
  }, [selectedDept]);

  const handleForward = async () => {
    let targetEmail = selectedUser;
    if (!comment?.trim()) {
  alert("Comment is required");
  return;
}
    if (mode === "HEAD") {
      const { data } = await supabase
        .from("department")
        .select("head_email")
        .eq("name", selectedDept)
        .single();

      targetEmail = data?.head_email;
    }

    if (!targetEmail) {
      alert("Please select valid user");
      return;
    }

    await forwardRequestToUser({
      requestId,
      newApproverEmail: targetEmail,
      currentUserEmail,
      department,
      comment
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-[420px] space-y-4">

        <h2 className="text-lg font-semibold">Forward Request</h2>

        <select
          className="w-full border rounded-lg px-3 py-2"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              checked={mode === "HEAD"}
              onChange={() => setMode("HEAD")}
            />{" "}
            Department Head
          </label>

          <label>
            <input
              type="radio"
              checked={mode === "USER"}
              onChange={() => setMode("USER")}
            />{" "}
            Specific User
          </label>
        </div>

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

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleForward}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}