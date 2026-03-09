import { useEffect, useState, useRef } from "react";
import { downloadAttachmentsAsZip } from "../utils/downloadAttachments";
import RequestActionButtons from "../components/RequestActionButtons";
import DocumentUploader from "../components/DocumentUploader";
import DocumentPreviewGrid from "../components/DocumentPreviewGrid";
import RequestModals from "../components/RequestModals";
import RequestBasicFields from "../components/RequestBasicFields";
import RequestHeader from "../components/RequestHeader";

import {
  saveRequestWithDocuments,
  performApprovalAction,
  deleteDraftRequest,
} from "../services/requestService";

import { fetchRequestDocuments } from "../services/documentService";
import AuditLog from "../components/AuditLog";

interface Props {
  mode?: "create" | "edit" | "approval" | "view";
  requestToEdit?: any;
  currentUser: {
    email: string;
    name?: string;
    role?: string;
  };
  department?: string;
  employeeMap: Record<string, string>;
  onBack: () => void;
  onSuccess: () => void;
}

export default function RequestFormPage({
  mode = "create",
  requestToEdit,
  currentUser,
  department,
  employeeMap,
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
        currentUserEmail: currentUser.email,
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

      onSuccess();
      onBack();
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
        currentUserEmail: currentUser.email,
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
        {/* TOP BACK */}
        <div className="flex justify-start mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            ← Back
          </button>
        </div>

        <RequestHeader
          isApprovalMode={isApprovalMode}
          isViewMode={isViewMode}
          isEditMode={isEditMode}
          requestToEdit={requestToEdit}
        />

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE - FORM */}
          <div className="lg:col-span-2">
            <RequestBasicFields
              title={title}
              description={description}
              setTitle={setTitle}
              setDescription={setDescription}
              isReadOnly={isApprovalMode || isViewMode}
            />

            <DocumentUploader
              canUpload={canUpload}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              handleDrop={handleDrop}
              openFileDialog={openFileDialog}
            />

            <DocumentPreviewGrid
              combinedDocs={combinedDocs}
              existingDocs={existingDocs}
              canUpload={canUpload}
              canDeleteExisting={canDeleteExisting}
              removeFile={removeFile}
              setDeletedDocIds={setDeletedDocIds}
              setExistingDocs={setExistingDocs}
              setPreviewIndex={setPreviewIndex}
              isImageFile={isImageFile}
            />

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
            <div className="relative z-10">
            <RequestActionButtons
              isApprovalMode={isApprovalMode}
              isViewMode={isViewMode}
              canDiscard={canDiscard}
              loading={loading}
              handleDownloadAll={handleDownloadAll}
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
              isDownloading={isDownloading}
              existingDocs={existingDocs}
            />
            </div>
          </div>

          {/* RIGHT SIDE - AUDIT LOG */}
          <div className="lg:col-span-1">
            {requestToEdit && (
                <div className="bg-gray-50 rounded-2xl p-4 border sticky top-6 pointer-events-auto">
              <h2 className="text-lg font-semibold mb-4">Audit Log</h2>
                <AuditLog
                  requestId={requestToEdit.id}
                  employeeMap={employeeMap}
                />
              </div>
            )}
          </div>
        </div>

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

      <RequestModals
        existingDocs={existingDocs}
        previewIndex={previewIndex}
        setPreviewIndex={setPreviewIndex}
        showForwardModal={showForwardModal}
        showSubmitForwardModal={showSubmitForwardModal}
        showProcessingModal={showProcessingModal}
        setShowForwardModal={setShowForwardModal}
        setShowSubmitForwardModal={setShowSubmitForwardModal}
        setShowProcessingModal={setShowProcessingModal}
        requestToEdit={requestToEdit}
        currentUser={currentUser}
        department={department}
        comment={comment}
        onSuccess={onSuccess}
        onBack={onBack}
        setLoading={setLoading}
        isEditMode={isEditMode}
        title={title}
        description={description}
        files={files}
        existingDocsState={existingDocs}
        deletedDocIds={deletedDocIds}
      />
    </div>
  );
}
