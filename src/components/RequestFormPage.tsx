import { useEffect, useState, useRef } from "react";
import {
  saveRequestWithDocuments,
  performApprovalAction,
  fetchRequestDocuments,
} from "../services/requestService";
import ImageSlideshowModal from "../components/ImageSlideshowModal";
import AuditLog from "../components/AuditLog";

interface Props {
  mode?: "create" | "edit" | "approval" | "view";
  requestToEdit?: any;
  currentUser: {
    email: string;
    name?: string;
    role?: string;
  };
  onBack: () => void;
  onSuccess: () => void;
}

export default function RequestFormPage({
  mode = "create",
  requestToEdit,
  currentUser,
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  if (!requestToEdit) return;

  setTitle(requestToEdit.title);
  setDescription(requestToEdit.description);

  fetchRequestDocuments(requestToEdit.id)
    .then(setExistingDocs)
    .catch((err) => {
      console.error("Failed to fetch documents", err);
    });
}, [requestToEdit]);

  

  const isImageFile = (fileName: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

  // ----------------------------------------
  // FILE HANDLING
  // ----------------------------------------
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

  const handleAction = async (submit: boolean) => {
    try {
      setLoading(submit ? "submit" : "draft");

      await saveRequestWithDocuments({
        isEditMode,
        requestToEdit,
        title,
        description,
        files,
        existingDocs,
        deletedDocIds,
        submit,
        userEmail: currentUser.email,
      });

      onSuccess();
      onBack();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Operation failed");
    } finally {
      setLoading(null);
    }
  };

  
  const handleApprovalAction = async (
    action: "APPROVED" | "REJECTED" | "REJECTED_WITH_EDIT" | "FORWARDED"
  ) => {
    try {
      await performApprovalAction({
        requestId: requestToEdit.id,
        action,
        comment,
        currentUserEmail: currentUser.email,
        createdBy: requestToEdit.created_by,
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
          <label className="block mb-2 font-medium text-gray-700">
            Title
          </label>
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
        {!isApprovalMode && !isViewMode && (
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
              <p className="text-sm text-gray-500 mt-2">
                or click to browse
              </p>
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
                        (d) => d.id === item.id
                      );
                      if (existingIndex !== -1) {
                        setPreviewIndex(existingIndex);
                      }
                    }
                  }}
                >
                  {item.type === "new" ? (
                    <>
                      {item.file.type.startsWith("image") ? (
                        <img
                          src={URL.createObjectURL(item.file)}
                          className="h-32 w-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-32 flex items-center justify-center text-gray-600 text-sm text-center">
                          📄 {item.file.name}
                        </div>
                      )}

                      {!isApprovalMode && !isViewMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(item.index);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md"
                        >
                          ✕
                        </button>
                      )}
                    </>
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

        {/* BUTTONS */}
        <div className="flex justify-between mb-8">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 rounded-xl"
          >
            Back
          </button>

          {!isApprovalMode && !isViewMode && (
            <div className="flex gap-4">
              <button
                onClick={() => handleAction(false)}
                disabled={loading !== null}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl"
              >
                Save Draft
              </button>

              <button
                onClick={() => handleAction(true)}
                disabled={loading !== null}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl"
              >
                Submit
              </button>
            </div>
          )}

          {isApprovalMode && (
            <div className="flex gap-3">
              <button
                onClick={() => handleApprovalAction("APPROVED")}
                className="px-4 py-2 bg-green-600 text-white rounded-xl"
              >
                Approve
              </button>
              <button
                onClick={() => handleApprovalAction("REJECTED")}
                className="px-4 py-2 bg-red-600 text-white rounded-xl"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprovalAction("REJECTED_WITH_EDIT")}
                className="px-4 py-2 bg-yellow-600 text-white rounded-xl"
              >
                Reject With Edit
              </button>
              <button
                onClick={() => handleApprovalAction("FORWARDED")}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl"
              >
                Forward
              </button>
            </div>
          )}
        </div>

        {requestToEdit && <AuditLog requestId={requestToEdit.id} />}
      </div>

      <ImageSlideshowModal
        documents={existingDocs}
        previewIndex={previewIndex}
        setPreviewIndex={setPreviewIndex}
      />
    </div>
  );
}