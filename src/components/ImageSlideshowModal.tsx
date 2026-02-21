import { supabase } from "../supabase";

interface Props {
  documents: any[];
  previewIndex: number | null;
  setPreviewIndex: (index: number | null) => void;
}

export default function ImageSlideshowModal({
  documents,
  previewIndex,
  setPreviewIndex,
}: Props) {
  if (previewIndex === null) return null;

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage
      .from("request-documents")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const isImageFile = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const currentDoc = documents[previewIndex];
  const publicUrl = getPublicUrl(currentDoc.file_path);
  const isImage = isImageFile(currentDoc.file_name);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={() => setPreviewIndex(null)}
    >
      <div
        className="relative bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setPreviewIndex(null)}
          className="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition"
        >
          ✕
        </button>

        {/* CONTENT */}
        {isImage ? (
          <img
            src={publicUrl}
            className="max-h-[75vh] mx-auto rounded-xl"
          />
        ) : (
          <div className="text-center text-lg text-gray-600 py-20">
            {currentDoc.file_name}
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() =>
              setPreviewIndex(
                previewIndex === 0
                  ? documents.length - 1
                  : previewIndex - 1
              )
            }
            className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            ◀ Prev
          </button>

          <button
            onClick={() =>
              setPreviewIndex(
                previewIndex === documents.length - 1
                  ? 0
                  : previewIndex + 1
              )
            }
            className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}