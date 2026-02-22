interface Props {
  user: any;
  employeeProfile: any;
}

export default function UserProfileBadge({
  user,
  employeeProfile,
}: Props) {
  if (!user) return null;

  return (
    <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-2xl shadow-sm">
      {user.user_metadata?.avatar_url && (
        <img
          src={user.user_metadata.avatar_url}
          alt="Profile"
          className="w-9 h-9 rounded-full border"
        />
      )}

      <div className="flex flex-col text-sm">
        <span className="font-semibold text-gray-800 leading-tight">
          {user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "User"}
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