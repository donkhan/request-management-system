import type { DecisionRow } from "../types";
import type { Request } from "../types";

interface Props {
  decisions: DecisionRow[];
  employeeMap: Record<string, string>;
  onView?: (request: Request) => void;
}

export default function DecisionHistoryTable({
  decisions,
  employeeMap,
  onView,
}: Props) {
  if (!decisions?.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-gray-500">
        No decision history yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 text-left text-sm text-gray-600 uppercase tracking-wide">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Origin</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4">Decision</th>
            <th className="px-6 py-4">Decision Date</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {decisions.map((row) => {
            const request = row.request;

            return (
              <tr key={row.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {request?.title ?? "Untitled"}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {request.created_by
                    ? (employeeMap[request.created_by] ?? request.created_by)
                    : "-"}
                </td>

                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                    {request?.department ?? "-"}
                  </span>
                </td>

                {/* Decision */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.action === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.action}
                  </span>
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-gray-600">
                  {new Date(row.created_at).toLocaleString()}
                </td>

                {/* View Button */}
                <td className="px-6 py-4 text-center">
                  {request && (
                    <button
                      onClick={() =>
                        onView?.({
                          id: request.id,
                          title: request.title,
                          description: request.description ?? "",
                          status: request.status,
                          department: request.department,
                          created_at: request.created_at ?? "",
                          created_by: request.created_by ?? null,
                          current_approver: request.current_approver ?? null,
                        })
                      }
                      title="View Request"
                      className="text-indigo-600 hover:text-indigo-800 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5
                               c4.477 0 8.268 2.943 9.542 7
                               -1.274 4.057-5.065 7-9.542 7
                               -4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
