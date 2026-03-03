import { getSupabase } from "../supabase";

function db() {
  return getSupabase();
}

/* =====================================================
   FETCH DOCUMENTS
===================================================== */

export async function fetchRequestDocuments(requestId: string) {
  const { data, error } = await db()
    .from("document")
    .select("*")
    .eq("request_id", requestId);

  if (error) throw error;
  return data ?? [];
}

/* =====================================================
   UPLOAD DOCUMENTS
===================================================== */

export async function uploadDocuments(
  files: File[],
  requestId: string
) {
  if (!files?.length) return;

  const supabase = db();
  const docsToInsert: any[] = [];

  for (const file of files) {
    const safeName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `${requestId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("request-documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    docsToInsert.push({
      request_id: requestId,
      file_name: file.name,
      file_path: filePath,
    });
  }

  const { error } = await supabase
    .from("document")
    .insert(docsToInsert);

  if (error) throw error;
}

/* =====================================================
   DELETE DOCUMENTS
===================================================== */

export async function deleteDocuments(
  deletedDocIds: string[],
  existingDocs: any[]
) {
  if (!deletedDocIds?.length) return;

  const supabase = db();

  const docsToDelete = existingDocs.filter((doc) =>
    deletedDocIds.includes(doc.id)
  );

  const paths = docsToDelete.map((doc) => doc.file_path);

  if (paths.length) {
    await supabase.storage
      .from("request-documents")
      .remove(paths);
  }

  await supabase
    .from("document")
    .delete()
    .in("id", deletedDocIds);
}