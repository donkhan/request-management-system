interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface Props {
  requests: Request[];
  onEdit: (request: Request) => void;
}

export default function RequestsTable({
  requests,
  onEdit,
}: Props) {
  if (!requests || requests.length === 0) {
    return <div>No requests found.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
              Title
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
              Status
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
              Created At
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => {
            const isEditable =
              request.status === "DRAFT";

            return (
              <tr
                key={request.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-sm">
                  {request.title}
                </td>

                <td className="px-6 py-4 text-sm">
                  {request.status}
                </td>

                <td className="px-6 py-4 text-sm">
                  {new Date(
                    request.created_at
                  ).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-sm">
                  {isEditable && (
                    <button
                      onClick={() => onEdit(request)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
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