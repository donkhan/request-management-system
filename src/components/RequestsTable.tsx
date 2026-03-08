import { getWaitingInfo } from "../utils/timeUtils";

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  department: string;
  created_at: string;
  created_by?: string | null;
  current_approver?: string | null;
}

interface Props {
  requests: Request[];
  onEdit?: (request: Request) => void;
  onView?: (request: Request) => void;
}

function getDisplayStatus(status: string) {
  switch (status) {
    case "PROCESSING":
      return "APPROVED (PROCESSING)";
    case "COMPLETED":
      return "APPROVED (PROCESSED)";
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "PROCESSING":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-gray-200 text-gray-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "DRAFT":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function RequestsTable({ requests, onEdit, onView }: Props) {
  if (!requests || requests.length === 0) {
    return <div>No requests found.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              TITLE
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              DEPARTMENT
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              ORIGIN
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              CURRENT APPROVER
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              STATUS
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              WAITING
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              ACTION
            </th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => {
            const canEdit =
              request.status === "DRAFT" ||
              request.status === "REJECTED_WITH_EDIT";

            const waiting = getWaitingInfo(request.created_at);

            return (
              <tr
                key={request.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-sm">{request.title}</td>

                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                    {request.department}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {request.created_by || "-"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {request.current_approver || "-"}
                </td>

                {/* STATUS */}
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {getDisplayStatus(request.status)}
                  </span>
                </td>

                {/* WAITING */}
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-2 w-fit ${
                      waiting.level === 0
                        ? "bg-green-100 text-green-700"
                        : waiting.level === 1
                          ? "bg-emerald-100 text-emerald-700"
                          : waiting.level === 2
                            ? "bg-cyan-100 text-cyan-700"
                            : waiting.level === 3
                              ? "bg-blue-100 text-blue-700"
                              : waiting.level === 4
                                ? "bg-yellow-100 text-yellow-700"
                                : waiting.level === 5
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full ${
                        waiting.level === 0
                          ? "bg-green-600"
                          : waiting.level === 1
                            ? "bg-emerald-600"
                            : waiting.level === 2
                              ? "bg-cyan-600"
                              : waiting.level === 3
                                ? "bg-blue-600"
                                : waiting.level === 4
                                  ? "bg-yellow-500"
                                  : waiting.level === 5
                                    ? "bg-orange-500"
                                    : "bg-red-600"
                      }`}
                    ></span>

                    {waiting.label}
                  </span>
                </td>

                {/* ACTION */}
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-4 items-center">
                    {canEdit && onEdit && (
                      <button
                        onClick={() => onEdit(request)}
                        title="Edit Request"
                        className="text-blue-600 hover:text-blue-800 transition"
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
                            d="M11 5h2M12 20h9M4 20h4l10-10-4-4L4 16v4z"
                          />
                        </svg>
                      </button>
                    )}

                    {!canEdit && onView && (
                      <button
                        onClick={() => onView(request)}
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}