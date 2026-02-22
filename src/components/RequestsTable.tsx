interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  created_by?: string | null;
  current_approver?: string | null;
}

interface Props {
  requests: Request[];
  onEdit?: (request: Request) => void;
  onView?: (request: Request) => void;
}

export default function RequestsTable({
  requests,
  onEdit,
  onView,
}: Props) {
  if (!requests || requests.length === 0) {
    return <div>No requests found.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              Title
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              Origin
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              Current Approver
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => {
            const canEdit =
              request.status === "DRAFT" ||
              request.status === "REJECTED_WITH_EDIT";

            return (
              <tr
                key={request.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-sm">
                  {request.title}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {request.created_by || "-"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {request.current_approver || "-"}
                </td>

                <td className="px-6 py-4 text-sm">
                  {request.status}
                </td>

                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-4 items-center">

                    {/* EDIT ICON */}
                    {canEdit && onEdit && (
                      <button
                        onClick={() => onEdit(request)}
                        title="Edit Request"
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        {/* Pencil Icon */}
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

                    {/* VIEW ICON */}
                    {!canEdit && onView && (
                      <button
                        onClick={() => onView(request)}
                        title="View Request"
                        className="text-indigo-600 hover:text-indigo-800 transition"
                      >
                        {/* Eye Icon */}
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