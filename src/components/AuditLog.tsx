import { useEffect, useState } from "react";
import { supabase } from "../supabase";

interface Props {
  requestId: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  acted_by: string;
  acted_to: string | null;
  comment: string | null;
  occurred_at: string;
}

export default function AuditLog({ requestId }: Props) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      fetchLogs();
    }
  }, [requestId]);

  const fetchLogs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("request_audit_logs")
      .select("*")
      .eq("request_id", requestId)
      .order("occurred_at", { ascending: true });

    if (error) {
      console.error("Audit fetch error:", error);
    }

    setLogs(data || []);
    setLoading(false);
  };

  // 🔥 Safe Date Formatter (Browser Compatible)
  const formatDate = (dateValue?: string) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return dateValue;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
};

  const getColor = (action: string) => {
    switch (action) {
      case "APPROVED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      case "REJECTED_WITH_EDIT":
        return "bg-yellow-500";
      case "FORWARD":
        return "bg-blue-500";
      case "RESUBMITTED":
        return "bg-indigo-500";
      case "SUBMITTED":
        return "bg-purple-500";
      default:
        return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="mt-8 text-sm text-gray-500">
        Loading audit timeline...
      </div>
    );
  }

  if (!logs.length) return null;

  return (
    <div className="mt-14">
      <h2 className="text-xl font-semibold mb-8">
        Audit Timeline
      </h2>

      <div className="relative">

        {/* Vertical Line */}
        <div className="absolute left-4 top-0 h-full w-[2px] bg-gray-200" />

        <div className="space-y-12">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-14">

              {/* Timeline Dot */}
              <div
                className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${getColor(
                  log.action
                )}`}
              >
                ●
              </div>

              {/* Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">

                <div className="flex justify-between items-start">
                  <div className="font-semibold text-gray-800 tracking-wide">
                    {log.action.replace(/_/g, " ")}
                  </div>

                  <div className="text-xs text-gray-400">
                    {formatDate(log.occurred_at)}
                   </div>
                </div>

                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">From:</span>{" "}
                    {log.acted_by}
                  </div>

                  {log.acted_to && (
                    <div>
                      <span className="font-medium">To:</span>{" "}
                      {log.acted_to}
                    </div>
                  )}

                  {log.comment && (
                    <div className="mt-2 text-gray-600">
                      <span className="font-medium">Comment:</span>{" "}
                      {log.comment}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}