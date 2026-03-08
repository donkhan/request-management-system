import ImageSlideshowModal from "../components/ImageSlideshowModal";
import ForwardModal from "../components/ForwardModel";
import { saveRequestWithDocuments } from "../services/requestService";

interface Props {
  existingDocs: any[];
  previewIndex: number | null;
  setPreviewIndex: (v: number | null) => void;

  showForwardModal: boolean;
  showSubmitForwardModal: boolean;
  showProcessingModal: boolean;

  setShowForwardModal: (v: boolean) => void;
  setShowSubmitForwardModal: (v: boolean) => void;
  setShowProcessingModal: (v: boolean) => void;

  requestToEdit: any;
  currentUser: any;
  department?: string;
  comment: string;

  onSuccess: () => void;
  onBack: () => void;

  setLoading: (v: "draft" | "submit" | null) => void;

  isEditMode: boolean;
  title: string;
  description: string;
  files: any[];
  existingDocsState: any[];
  deletedDocIds: string[];
}

export default function RequestModals({
  existingDocs,
  previewIndex,
  setPreviewIndex,

  showForwardModal,
  showSubmitForwardModal,
  showProcessingModal,

  setShowForwardModal,
  setShowSubmitForwardModal,
  setShowProcessingModal,

  requestToEdit,
  currentUser,
  department,
  comment,

  onSuccess,
  onBack,

  setLoading,

  isEditMode,
  title,
  description,
  files,
  existingDocsState,
  deletedDocIds,
}: Props) {

  return (
    <>
      <ImageSlideshowModal
        documents={existingDocs}
        previewIndex={previewIndex}
        setPreviewIndex={setPreviewIndex}
      />

      {showForwardModal && requestToEdit && (
        <ForwardModal
          requestId={requestToEdit.id}
          currentUserEmail={currentUser.email}
          department={department}
          comment={comment}
          action="RECOMMENDED"
          onClose={() => setShowForwardModal(false)}
          onSuccess={() => {
            onSuccess();
            onBack();
          }}
        />
      )}

      {showSubmitForwardModal && (
        <ForwardModal
          requestId={requestToEdit?.id}
          currentUserEmail={currentUser.email}
          department={department}
          comment={comment}
          onClose={() => setShowSubmitForwardModal(false)}
          onSuccess={async (targetEmail: string) => {
            try {
              setLoading("submit");

              await saveRequestWithDocuments({
                isEditMode,
                requestToEdit,
                title,
                description,
                files,
                existingDocs: existingDocsState,
                deletedDocIds,
                submit: true,
                department,
                nextApproverEmail: targetEmail,
              });

              onSuccess();
              onBack();

            } catch (err: any) {
              alert(err.message || "Submit To failed");
            } finally {
              setLoading(null);
            }
          }}
        />
      )}

      {showProcessingModal && requestToEdit && (
        <ForwardModal
          requestId={requestToEdit.id}
          currentUserEmail={currentUser.email}
          department={department}
          comment={comment}
          action="PROCESSING"
          onClose={() => setShowProcessingModal(false)}
          onSuccess={() => {
            onSuccess();
            onBack();
          }}
        />
      )}
    </>
  );
}