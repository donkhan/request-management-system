import { useEffect, useState, useRef } from "react";
import { downloadAttachmentsAsZip } from "../utils/downloadAttachments";
import RequestActionButtons from "../components/RequestActionButtons";

import {
  saveRequestWithDocuments,
  performApprovalAction,
  deleteDraftRequest,
} from "../services/requestService";

import { fetchRequestDocuments } from "../services/documentService";
import ImageSlideshowModal from "../components/ImageSlideshowModal";
import ForwardModal from "./ForwardModel";
import AuditLog from "../components/AuditLog";
import { getSupabase } from "../supabase";

interface Props {
  mode?: "create" | "edit" | "approval" | "view";
  requestToEdit?: any;
  currentUser: {
    email: string;
    name?: string;
    role?: string;
  };
  department?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function RequestFormPage({
  mode = "create",
  requestToEdit,
  currentUser,
  department,
  onBack,
  onSuccess,
}: Props) {
  const isEditMode = !!requestToEdit;
  const isApprovalMode = mode === "approval";
  const isViewMode = mode === "view";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [deletedDocIds, setDeletedDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<"draft" | "submit" | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showSubmitForwardModal, setShowSubmitForwardModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabase();

  const status = requestToEdit?.status?.toUpperCase();

  const isOriginator =
    requestToEdit?.created_by?.toLowerCase() ===
    currentUser.email?.toLowerCase();

  const isNewRequest = !requestToEdit;

  const isEditableState = status === "DRAFT" || status === "REJECTED_WITH_EDIT";

  const canUpload =
    !isApprovalMode &&
    !isViewMode &&
    (isNewRequest || (isOriginator && isEditableState));

  const canDeleteExisting = isOriginator && isEditableState;
  const canDiscard = isEditMode && requestToEdit?.status === "DRAFT";

  useEffect(() => {
    if (!requestToEdit) return;

    setTitle(requestToEdit.title);
    setDescription(requestToEdit.description);

    fetchRequestDocuments(requestToEdit.id)
      .then(setExistingDocs)
      .catch((err) => console.error("Failed to fetch documents", err));
  }, [requestToEdit]);

  const handleDownloadAll = async () => {
    if (!requestToEdit) return;

    try {
      setIsDownloading(true);
      await downloadAttachmentsAsZip(requestToEdit.id, title, existingDocs);
    } catch (err: any) {
      alert(err.message || "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const isImageFile = (fileName: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSaveDraft = async () => {
    try {
      setLoading("draft");

      await saveRequestWithDocuments({
        isEditMode,
        requestToEdit,
        title,
        description,
        files,
        existingDocs,
        deletedDocIds,
        submit: false,
        userEmail: currentUser.email,
        department,
      });

      onSuccess();
      onBack();
    } catch (err: any) {
      alert(err.message || "Save draft failed");
    } finally {
      setLoading(null);
    }
  };

  const handleDiscard = async () => {
    const confirmed = confirm(
      "Discard this draft? All uploaded documents will be deleted.",
    );

    if (!confirmed) return;

    try {
      await deleteDraftRequest(requestToEdit.id, existingDocs || []);

      onSuccess(); // refresh dashboard
      onBack(); // go back
    } catch (err: any) {
      alert(err.message || "Failed to discard draft");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading("submit");
      if (!title.trim()) {
        alert("Title is required.");
        return;
      }

      if (!description.trim()) {
        alert("Description is required.");
        return;
      }
      await saveRequestWithDocuments({
        isEditMode,
        requestToEdit,
        title,
        description,
        files,
        existingDocs,
        deletedDocIds,
        submit: true,
        userEmail: currentUser.email,
        department,
      });

      onSuccess();
      onBack();
    } catch (err: any) {
      alert(err.message || "Submit failed");
    } finally {
      setLoading(null);
    }
  };

  const handleApprovalAction = async (
    action: "APPROVED" | "REJECTED" | "REJECTED_WITH_EDIT" | "RECOMMENDED",
  ) => {
    try {
      await performApprovalAction({
        requestId: requestToEdit.id,
        action,
        comment,
        currentUserEmail: currentUser.email,
        createdBy: requestToEdit.created_by,
        department,
      });

      onSuccess();
      onBack();
    } catch (err: any) {
      alert(err.message || "Approval action failed");
    }
  };

  const combinedDocs = [
    ...existingDocs.map((doc) => ({
      type: "existing",
      id: doc.id,
      file_name: doc.file_name,
      file_path: doc.file_path,
    })),
    ...files.map((file, index) => ({
      type: "new",
      file,
      index,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        {/* Download Button */}
        {requestToEdit && existingDocs.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              {isDownloading
                ? "Preparing Download..."
                : "Download All Attachments"}
            </button>
          </div>
        )}

        {/* TOP BACK */}
        <div className="flex justify-start mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          {isApprovalMode
            ? "Approval View"
            : isViewMode
              ? "View Request"
              : isEditMode
                ? "Edit Request"
                : "Create New Request"}
        </h1>

        {/* TITLE */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            readOnly={isApprovalMode || isViewMode}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-xl p-4"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-8">
          <label className="block mb-2 font-medium text-gray-700">
            Description
          </label>
          <textarea
            rows={5}
            value={description}
            readOnly={isApprovalMode || isViewMode}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-xl p-4"
          />
        </div>

        {/* FILE UPLOAD */}
        {canUpload && (
          <div className="mb-10">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={openFileDialog}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-5xl mb-4">📎</div>
              <p className="text-lg font-semibold text-gray-700">
                Drag & Drop files here
              </p>
              <p className="text-sm text-gray-500 mt-2">or click to browse</p>
            </div>
          </div>
        )}

        {/* DOCUMENT PREVIEW */}
        {combinedDocs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {combinedDocs.map((item: any, index: number) => (
                <div
                  key={index}
                  className="relative bg-gray-100 rounded-xl p-4 cursor-pointer"
                  onClick={() => {
                    if (
                      item.type === "existing" &&
                      isImageFile(item.file_name)
                    ) {
                      const existingIndex = existingDocs.findIndex(
                        (d) => d.id === item.id,
                      );
                      if (existingIndex !== -1) {
                        setPreviewIndex(existingIndex);
                      }
                    }
                  }}
                >
                  {/* DELETE BUTTON FOR NEW FILES */}
                  {item.type === "new" && canUpload && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(item.index);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}

                  {/* DELETE BUTTON FOR EXISTING FILES */}
                  {item.type === "existing" && canDeleteExisting && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletedDocIds((prev) => [...prev, item.id]);
                        setExistingDocs((prev) =>
                          prev.filter((doc) => doc.id !== item.id),
                        );
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  )}

                  {/* FILE PREVIEW */}
                  {item.type === "new" ? (
                    item.file.type.startsWith("image") ? (
                      <img
                        src={URL.createObjectURL(item.file)}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-32 flex items-center justify-center text-gray-600 text-sm text-center">
                        📄 {item.file.name}
                      </div>
                    )
                  ) : isImageFile(item.file_name) ? (
                    <img
                      src={
                        supabase.storage
                          .from("request-documents")
                          .getPublicUrl(item.file_path).data.publicUrl
                      }
                      className="h-32 w-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-600 text-sm text-center">
                      📄 {item.file_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPROVAL COMMENT */}
        {isApprovalMode && (
          <div className="mb-8">
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-xl p-4"
              placeholder="Enter mandatory comment..."
            />
          </div>
        )}

        <RequestActionButtons
          isApprovalMode={isApprovalMode}
          isViewMode={isViewMode}
          canDiscard={canDiscard}
          loading={loading}
          handleSaveDraft={handleSaveDraft}
          handleSubmit={handleSubmit}
          handleDiscard={handleDiscard}
          handleApprovalAction={handleApprovalAction}
          setShowForwardModal={setShowForwardModal}
          setShowSubmitForwardModal={setShowSubmitForwardModal}
          setShowProcessingModal={setShowProcessingModal}
          requestToEdit={requestToEdit}
          currentUser={currentUser}
          comment={comment}
          department={department}
        />

        {requestToEdit && <AuditLog requestId={requestToEdit.id} />}

        {/* BOTTOM BACK */}
        <div className="flex justify-start mt-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            ← Back
          </button>
        </div>
      </div>

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
          comment={comment} // 👈 PASS THIS
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
                existingDocs,
                deletedDocIds,
                submit: true,
                department,
                nextApproverEmail: targetEmail, // 👈 KEY PART
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
          onClose={() => setShowProcessingModal(false)}
          onSuccess={() => {
            onSuccess();
            onBack();
          }}
        />
      )}
    </div>
  );
}
