import { getSupabase } from "../supabase";

interface Props {
  combinedDocs: any[];
  existingDocs: any[];
  canUpload: boolean;
  canDeleteExisting: boolean;
  removeFile: (index: number) => void;
  setDeletedDocIds: React.Dispatch<React.SetStateAction<string[]>>;
  setExistingDocs: React.Dispatch<React.SetStateAction<any[]>>;
  setPreviewIndex: (index: number | null) => void;
  isImageFile: (fileName: string) => boolean;
}

export default function DocumentPreviewGrid({
  combinedDocs,
  existingDocs,
  canUpload,
  canDeleteExisting,
  removeFile,
  setDeletedDocIds,
  setExistingDocs,
  setPreviewIndex,
  isImageFile,
}: Props) {
  const supabase = getSupabase();

  if (combinedDocs.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold mb-4">Documents</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {combinedDocs.map((item: any, index: number) => (
          <div
            key={index}
            className="relative bg-gray-100 rounded-xl p-4 cursor-pointer"
            onClick={() => {
              if (item.type === "existing" && isImageFile(item.file_name)) {
                const existingIndex = existingDocs.findIndex(
                  (d) => d.id === item.id
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
                    prev.filter((doc) => doc.id !== item.id)
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
  );
}