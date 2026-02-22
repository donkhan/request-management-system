import { useEffect, useState } from "react";
import { supabase } from "../supabase";

interface Props {
  requestId: string;
}

interface AuditLog {
  id: string;
  action: string;
  acted_by: string;
  acted_to: string | null;
  comment: string | null;
  occurred_at: string;
}

export default function AuditLog({ requestId }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [requestId]);

  const fetchLogs = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from("request_audit_logs")
    .select("*")
    .eq("request_id", requestId)
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error("Audit log fetch error:", error);
    setLoading(false);
    return;
  }

  setLogs(data || []);
  setLoading(false);
};

  if (loading) {
    return <div className="text-sm text-gray-500">Loading audit trail...</div>;
  }

  if (!logs.length) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Audit Trail</h2>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="border rounded-xl p-4 bg-gray-50"
          >
            <div className="flex justify-between text-sm text-gray-600">
              <span className="font-semibold">{log.action}</span>
              <span>
                {new Date(log.occurred_at).toLocaleString()}
              </span>
            </div>

            <div className="mt-2 text-sm">
              <div>
                <span className="font-medium">By:</span>{" "}
                {log.acted_by}
              </div>

              {log.acted_to && (
                <div>
                  <span className="font-medium">To:</span>{" "}
                  {log.acted_to}
                </div>
              )}

              {log.comment && (
                <div className="mt-1">
                  <span className="font-medium">Comment:</span>{" "}
                  {log.comment}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}