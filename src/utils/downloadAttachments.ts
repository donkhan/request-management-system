import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getSupabase } from "../supabase";

interface Attachment {
  file_name: string;
  file_path: string;
}

export const downloadAttachmentsAsZip = async (
  requestId: string,
  requestTitle: string,
  attachments: Attachment[],
  bucketName: string = "request-documents"
) => {
  if (!attachments || attachments.length === 0) {
    throw new Error("No attachments available.");
  }

  const zip = new JSZip();

  for (const doc of attachments) {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(doc.file_path, 60);

    if (error || !data?.signedUrl) {
      console.error(
        "Failed to generate signed URL for",
        doc.file_name
      );
      continue;
    }

    const response = await fetch(data.signedUrl);
    const blob = await response.blob();

    // Sanitize filename for safe ZIP extraction
    const safeFileName = doc.file_name
      .normalize("NFC") // normalize unicode
      .replace(/[\\/:*?"<>|]/g, "") // remove invalid characters
      .replace(/[^\x20-\x7E]/g, "") // remove non-ASCII characters
      .replace(/\s+/g, "_"); // replace spaces with underscore

    zip.file(safeFileName || "file", blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const safeTitle = requestTitle
    .replace(/[\\/:*?"<>|]/g, "") // remove invalid characters
    .replace(/\s+/g, "_") // replace spaces with underscore
    .substring(0, 80); // limit length

  saveAs(
    zipBlob,
    `${safeTitle || `request-${requestId}`}.zip`
  );
};