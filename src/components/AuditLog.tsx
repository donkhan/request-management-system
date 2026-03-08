import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../services/auditLogService";

interface Props {
  requestId: string;
  employeeMap: Record<string, string>;
}

interface AuditLogEntry {
  id: string;
  action: string;
  acted_by: string;
  acted_to: string | null;
  comment: string | null;
  created_at: string;
  department: string;
}

export default function AuditLog({ requestId, employeeMap }: Props) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      fetchLogs();
    }
  }, [requestId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const data = await fetchAuditLogs(requestId);

      const sortedLogs = [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setLogs(sortedLogs);
    } catch (err) {
      console.error("Audit fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const getName = (email?: string | null) => {
    if (!email) return "—";
    return employeeMap[email] ?? email;
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Loading audit timeline...</div>
    );
  }

  if (!logs.length) return null;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-4">Audit Timeline</h2>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-2 top-0 h-full w-[2px] bg-gray-200" />

        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-10">
              {/* Timeline Dot */}
              <div
                className={`absolute left-0 top-2 w-5 h-5 rounded-full ${getColor(
                  log.action,
                )}`}
              />

              {/* Event Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-1">
                  <div className="font-semibold text-gray-800 text-sm">
                    {log.action.replace(/_/g, " ")}
                  </div>

                  <div className="text-xs text-gray-400">
                    {formatDate(log.created_at)}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">From:</span>{" "}
                    {getName(log.acted_by)}
                  </div>

                  {log.department && (
                    <div>
                      <span className="font-medium">Dept:</span>{" "}
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-[2px] rounded-full text-xs font-semibold">
                        {log.department}
                      </span>
                    </div>
                  )}

                  {log.acted_to && (
                    <div>
                      <span className="font-medium">To:</span>{" "}
                      {getName(log.acted_to)}
                    </div>
                  )}

                  {/* Hide redundant comment for SUBMITTED */}
                  {log.comment && log.action !== "SUBMITTED" && (
                    <div className="text-gray-600 text-xs">{log.comment}</div>
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
