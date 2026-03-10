import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getSignedDownloadUrl } from "../services/downloadService";

interface Attachment {
  file_name: string;
  file_path: string;
}

export const downloadAttachmentsAsZip = async (
  requestId: string,
  fileName: string,
  attachments: Attachment[],
  bucketName: string = "request-documents"
) => {
  if (!attachments || attachments.length === 0) {
    throw new Error("No attachments available.");
  }

  const zip = new JSZip();

  for (const doc of attachments) {
    const signedUrl = await getSignedDownloadUrl(
      doc.file_path,
      bucketName
    );

    if (!signedUrl) {
      console.error("Failed to download", doc.file_name);
      continue;
    }

    const response = await fetch(signedUrl);
    const blob = await response.blob();

    const safeFileName = doc.file_name
      .normalize("NFC")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/\s+/g, "_");

    zip.file(safeFileName || "file", blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const safeTitle = fileName
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 80);

  saveAs(
    zipBlob,
    `${safeTitle || `request-${requestId}`}.zip`
  );
};