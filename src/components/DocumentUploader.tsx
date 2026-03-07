import { RefObject } from "react";

interface Props {
  canUpload: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  openFileDialog: () => void;
}

export default function DocumentUploader({
  canUpload,
  fileInputRef,
  handleFileChange,
  handleDrop,
  openFileDialog,
}: Props) {
  if (!canUpload) return null;

  return (
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
  );
}