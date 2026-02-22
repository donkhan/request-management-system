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
                  {canEdit && onEdit && (
                    <button
                      onClick={() => onEdit(request)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  )}

                  {!canEdit && onView && (
                    <button
                      onClick={() => onView(request)}
                      className="text-indigo-600 hover:underline"
                    >
                      View
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