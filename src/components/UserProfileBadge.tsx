interface Props {
  user: {
    email: string;
    name?: string;
    avatar?: string | null;
  };
  employeeProfile: any;
}

export default function UserProfileBadge({
  user,
  employeeProfile,
}: Props) {
  if (!user) return null;

  return (
    <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-2xl shadow-sm">

      {user.avatar ? (
        <img
          src={user.avatar}
          alt="Profile"
          className="w-9 h-9 rounded-full border object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="flex flex-col text-sm">
        <span className="font-semibold text-gray-800 leading-tight">
          {user.name}
        </span>

        <span className="text-gray-500 text-xs leading-tight">
          {employeeProfile?.role || "Role"}
        </span>

        <span className="text-gray-400 text-xs leading-tight">
          Dept: {employeeProfile?.dept_id || "-"}
        </span>
      </div>
    </div>
  );
}