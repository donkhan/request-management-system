import { performApprovalAction } from "../services/requestService";

interface Props {
  isApprovalMode: boolean;
  isViewMode: boolean;
  canDiscard: boolean;
  loading: "draft" | "submit" | null;

  handleSaveDraft: () => void;
  handleSubmit: () => void;
  handleDiscard: () => void;

  handleApprovalAction: (
    action:
      | "APPROVED"
      | "REJECTED"
      | "REJECTED_WITH_EDIT"
      | "RECOMMENDED"
      | "COMPLETED"
  ) => void;

  setShowForwardModal: (v: boolean) => void;
  setShowSubmitForwardModal: (v: boolean) => void;
  setShowProcessingModal: (v: boolean) => void;

  requestToEdit: any;
  currentUser: any;
  comment: string;
  department?: string;
}

export default function RequestActionButtons({
  isApprovalMode,
  isViewMode,
  canDiscard,
  loading,
  handleSaveDraft,
  handleSubmit,
  handleDiscard,
  handleApprovalAction,
  setShowForwardModal,
  setShowSubmitForwardModal,
  setShowProcessingModal,
  requestToEdit,
  currentUser,
  comment,
  department,
}: Props) {

  const status = requestToEdit?.status;
  const isProcessingStage = status === "PROCESSING";

  return (
    <div className="flex justify-between mb-8">

      {/* CREATE / EDIT MODE */}
      {!isApprovalMode && !isViewMode && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-gray-500 text-white rounded-xl"
          >
            Save Draft
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl"
          >
            Submit
          </button>

          <button
            onClick={() => setShowSubmitForwardModal(true)}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl"
          >
            Assign
          </button>

          {canDiscard && (
            <button
              onClick={handleDiscard}
              className="px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
            >
              Discard Draft
            </button>
          )}
        </div>
      )}

      {/* APPROVAL / PROCESSING MODE */}
      {isApprovalMode && (
        <div className="grid grid-cols-3 gap-3 mb-8">

          {/* APPROVAL BUTTONS (hidden during processing) */}
          {!isProcessingStage && (
            <>
              <button
                onClick={() => handleApprovalAction("APPROVED")}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl"
              >
                Approve
              </button>

              <button
                onClick={async () => {
                  try {
                    await performApprovalAction({
                      requestId: requestToEdit.id,
                      action: "APPROVED",
                      comment,
                      currentUserEmail: currentUser.email,
                      createdBy: requestToEdit.created_by,
                      department,
                    });

                    setShowProcessingModal(true);
                  } catch (err: any) {
                    alert(err.message || "Approval failed");
                  }
                }}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-xl"
              >
                Approve & Send to Processing
              </button>

              <button
                onClick={() => handleApprovalAction("REJECTED")}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl"
              >
                Reject
              </button>

              <button
                onClick={() => handleApprovalAction("REJECTED_WITH_EDIT")}
                className="px-5 py-2.5 bg-yellow-600 text-white rounded-xl"
              >
                Reject With Edit
              </button>
            </>
          )}

          {/* RECOMMEND */}
          <button
            onClick={() => handleApprovalAction("RECOMMENDED")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl"
          >
            Recommend
          </button>

          {/* FORWARD */}
          {!isProcessingStage && (
            <button
              onClick={() => setShowForwardModal(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl"
            >
              Forward
            </button>
          )}

          {/* COMPLETE */}
          {isProcessingStage && (
            <button
              onClick={() => handleApprovalAction("COMPLETED")}
              className="px-5 py-2.5 bg-gray-700 text-white rounded-xl"
            >
              Complete
            </button>
          )}

        </div>
      )}
    </div>
  );
}