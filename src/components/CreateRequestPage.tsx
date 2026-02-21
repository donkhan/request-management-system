import { useState, useRef } from "react";
import { supabase } from "../supabase";
import {
  createRequest,
  uploadDocuments,
} from "../services/requestService";

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export default function CreateRequestPage({ onBack, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<"draft" | "submit" | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) throw new Error("User not authenticated");

      // 1️⃣ Create request
      const request = await createRequest({
        title,
        description,
        userEmail: user.email,
        submit,
      });

      // 2️⃣ Upload documents if any
      if (files.length > 0) {
        await uploadDocuments(files, request.id);
      }

      onSuccess();
      onBack();
    } catch (err: any) {
      console.error("Create request error:", err);
      alert(err.message || "Operation failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Create New Request
        </h1>

        {/* TITLE */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            placeholder="Enter request title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="mb-8">
          <label className="block mb-2 font-medium text-gray-700">
            Description
          </label>
          <textarea
            rows={5}
            placeholder="Provide detailed information..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
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

            {files.length > 0 && (
              <p className="mt-4 text-sm text-blue-600 font-medium">
                {files.length} file(s) selected
              </p>
            )}
          </div>
        </div>

        {/* FILE PREVIEW GRID */}
        {files.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">
              Attached Files
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="relative bg-gray-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => setPreviewIndex(index)}
                >
                  {file.type.startsWith("image") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-500 text-sm text-center">
                      📄 {file.name}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            Back
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => handleAction(false)}
              disabled={loading !== null}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
            >
              {loading === "draft" ? "Saving..." : "Save Draft"}
            </button>

            <button
              onClick={() => handleAction(true)}
              disabled={loading !== null}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              {loading === "submit" ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* SLIDESHOW MODAL */}
      {previewIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full relative">
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute top-4 right-4 text-gray-600"
            >
              ✕
            </button>

            {files[previewIndex].type.startsWith("image") ? (
              <img
                src={URL.createObjectURL(files[previewIndex])}
                className="max-h-[70vh] mx-auto rounded-xl"
              />
            ) : (
              <div className="text-center text-lg text-gray-600">
                {files[previewIndex].name}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() =>
                  setPreviewIndex(
                    previewIndex === 0
                      ? files.length - 1
                      : previewIndex - 1
                  )
                }
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                ◀ Prev
              </button>

              <button
                onClick={() =>
                  setPreviewIndex(
                    previewIndex === files.length - 1
                      ? 0
                      : previewIndex + 1
                  )
                }
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}