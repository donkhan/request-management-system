import { performApprovalAction } from "../services/requestService";
import {
  Check,
  ThumbsDown,
  Edit,
  Forward,
  Send,
  CheckCircle,
  FileX,
  Save,
  Upload
} from "lucide-react";

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
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-500 text-white rounded-xl"
          >
            <Save size={18} />
            Save Draft
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl"
          >
            <Upload size={18} />
            Submit
          </button>

          <button
            onClick={() => setShowSubmitForwardModal(true)}
            disabled={loading !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl"
          >
            <Forward size={18} />
            Assign
          </button>

          {canDiscard && (
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
            >
              <FileX size={18} />
              Discard Draft
            </button>
          )}

        </div>
      )}

      {/* APPROVAL / PROCESSING MODE */}
      {isApprovalMode && (
        <div className="grid grid-cols-3 gap-3 mb-8">

          {!isProcessingStage && (
            <>
              <button
                onClick={() => handleApprovalAction("APPROVED")}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl"
              >
                <Check size={18} />
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
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl"
              >
                <Send size={18} />
                Approve And Send to Processing
              </button>

              <button
                onClick={() => handleApprovalAction("REJECTED")}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl"
              >
                <ThumbsDown size={18} />
                Reject
              </button>

              <button
                onClick={() => handleApprovalAction("REJECTED_WITH_EDIT")}
                className="flex items-center gap-2 px-5 py-2.5 bg-yellow-600 text-white rounded-xl"
              >
                <Edit size={18} />
                Reject With Edit
              </button>
            </>
          )}

          <button
            onClick={() => handleApprovalAction("RECOMMENDED")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl"
          >
            <CheckCircle size={18} />
            Recommend
          </button>

          {!isProcessingStage && (
            <button
              onClick={() => setShowForwardModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl"
            >
              <Forward size={18} />
              Forward
            </button>
          )}

          {isProcessingStage && (
            <button
              onClick={() => handleApprovalAction("COMPLETED")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl"
            >
              <CheckCircle size={18} />
              Complete
            </button>
          )}

        </div>
      )}
    </div>
  );
}