interface Props {
  isApprovalMode: boolean
  isViewMode: boolean
  isEditMode: boolean
  requestToEdit?: any
}

export default function RequestHeader({
  isApprovalMode,
  isViewMode,
  isEditMode,
  requestToEdit,
}: Props) {

  const title =
    isApprovalMode
      ? "Approval View"
      : isViewMode
        ? "View Request"
        : isEditMode
          ? "Edit Request"
          : "Create New Request"

  return (
    <div className="mb-8">

      <h1 className="text-3xl font-bold text-gray-800">
        {title}
      </h1>

      {requestToEdit && (
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">

          
          {requestToEdit.status && (
            <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-semibold">
              {requestToEdit.status}
            </span>
          )}

        </div>
      )}

    </div>
  )
}