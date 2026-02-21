import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import { saveRequestWithDocuments } from "../services/requestService";
import ImageSlideshowModal from "../components/ImageSlideshowModal";

interface Props {
  requestToEdit?: any;
  onBack: () => void;
  onSuccess: () => void;
}

export default function CreateRequestPage({
  requestToEdit,
  onBack,
  onSuccess,
}: Props) {
  const isEditMode = !!requestToEdit;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [deletedDocIds, setDeletedDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<"draft" | "submit" | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================
  // LOAD EXISTING DATA
  // ============================
  useEffect(() => {
    if (requestToEdit) {
      setTitle(requestToEdit.title);
      setDescription(requestToEdit.description);
      fetchExistingDocuments(requestToEdit.id);
    }
  }, [requestToEdit]);

  const fetchExistingDocuments = async (requestId: string) => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("request_id", requestId);

    setExistingDocs(data || []);
  };

  const isImageFile = (fileName: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

  // ============================
  // FILE HANDLERS
  // ============================
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

  // ============================
  // SAVE / SUBMIT
  // ============================
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
      });

      setFiles([]);
      setDeletedDocIds([]);
      setPreviewIndex(null);

      onSuccess();
      onBack();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Operation failed");
    } finally {
      setLoading(null);
    }
  };

  // ============================
  // COMBINED DOCUMENTS
  // ============================
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
          {isEditMode ? "Edit Request" : "Create New Request"}
        </h1>

        {/* TITLE */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
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
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-xl p-4"
          />
        </div>

        {/* UPLOAD AREA */}
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

        {/* DOCUMENTS PREVIEW */}
        {combinedDocs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">
              Documents
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {combinedDocs.map((item: any, index: number) => (
                <div
                  key={index}
                  className="relative bg-gray-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    if (
                      item.type === "existing" &&
                      isImageFile(item.file_name)
                    ) {
                      setPreviewIndex(index);
                    }
                  }}
                >
                  {/* EXISTING FILE */}
                  {item.type === "existing" && (
                    <>
                      <div className="h-32 flex items-center justify-center text-gray-600 text-sm text-center">
                        📄 {item.file_name}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletedDocIds((prev) => [
                            ...prev,
                            item.id,
                          ]);
                          setExistingDocs((prev) =>
                            prev.filter((d) => d.id !== item.id)
                          );
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md"
                      >
                        ✕
                      </button>
                    </>
                  )}

                  {/* NEW FILE */}
                  {item.type === "new" && (
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(item.index);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 rounded-xl"
          >
            Back
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => handleAction(false)}
              disabled={loading !== null}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl"
            >
              {loading === "draft" ? "Saving..." : "Save Draft"}
            </button>

            <button
              onClick={() => handleAction(true)}
              disabled={loading !== null}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl"
            >
              {loading === "submit"
                ? "Submitting..."
                : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* SLIDESHOW FOR EXISTING DOCS ONLY */}
      <ImageSlideshowModal
        documents={existingDocs}
        previewIndex={previewIndex}
        setPreviewIndex={setPreviewIndex}
      />
    </div>
  );
}