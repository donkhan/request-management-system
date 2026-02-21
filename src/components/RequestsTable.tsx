interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface Props {
  requests: Request[];
}

export default function RequestsTable({ requests }: Props) {
  if (requests.length === 0) {
    return (
      <div className="bg-white shadow rounded-2xl p-6 text-center text-gray-500">
        No requests created yet.
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-2xl overflow-hidden">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-sm font-medium text-gray-600">
              Title
            </th>
            <th className="px-6 py-3 text-sm font-medium text-gray-600">
              Status
            </th>
            <th className="px-6 py-3 text-sm font-medium text-gray-600">
              Created At
            </th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr
              key={req.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="px-6 py-4">
                <div className="font-medium">{req.title}</div>
                <div className="text-sm text-gray-500">
                  {req.description}
                </div>
              </td>

              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : req.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {req.status}
                </span>
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(req.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}