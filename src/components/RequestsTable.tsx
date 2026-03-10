import { getWaitingInfo } from "../utils/timeUtils";
import {
  Check,
  ThumbsDown,
  Edit,
  Loader,
  CheckCircle,
  Eye
} from "lucide-react";

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
  employeeMap: Record<string, string>;
  onEdit?: (request: Request) => void;
  onView?: (request: Request) => void;
}

export default function RequestsTable({
  requests,
  employeeMap,
  onEdit,
  onView,
}: Props) {
  if (!requests || requests.length === 0) {
    return <div>No requests found.</div>;
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <Check size={14} />
            Approved
          </span>
        );

      case "REJECTED":
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <ThumbsDown size={14} />
            Rejected
          </span>
        );

      case "REJECTED_WITH_EDIT":
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
            <Edit size={14} />
            Reject With Edit
          </span>
        );

      case "PROCESSING":
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            <Loader size={14} />
            Approved & Being Processed
          </span>
        );

      case "COMPLETED":
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Approved & Processed
          </span>
        );

      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );

      case "DRAFT":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Draft
          </span>
        );

      default:
        return status;
    }
  };

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

            const isActive =
              request.status === "PENDING" || request.status === "PROCESSING";

            const waiting = isActive
              ? getWaitingInfo(request.created_at)
              : null;

            const approverName = request.current_approver
              ? (employeeMap[request.current_approver] ??
                request.current_approver)
              : "";

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
                  {request.created_by
                    ? (employeeMap[request.created_by] ?? request.created_by)
                    : "-"}
                </td>

                <td className="px-6 py-4 text-sm">
                  {renderStatus(request.status)}
                </td>

                <td className="px-6 py-4 text-sm">
                  {waiting ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Waiting with {approverName || "Approver"}
                      </span>

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
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-4 items-center">
                    {canEdit && onEdit && (
                      <button
                        onClick={() => onEdit(request)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit size={18} />
                      </button>
                    )}

                    {!canEdit && onView && (
                      <button
                        onClick={() => onView(request)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <Eye size={18} />
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