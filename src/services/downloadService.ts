import { getSupabase } from "../supabase";

export const getSignedDownloadUrl = async (
  filePath: string,
  bucketName: string = "request-documents"
): Promise<string | null> => {
  const supabase = getSupabase();

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 60);

  if (error || !data?.signedUrl) {
    console.error("Failed to generate signed URL:", filePath);
    return null;
  }

  return data.signedUrl;
};