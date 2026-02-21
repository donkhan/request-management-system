import { supabase } from "../supabase";

// ==========================================
// CREATE REQUEST (DRAFT or SUBMIT)
// ==========================================
export async function createRequest({
  title,
  description,
  userEmail,
  submit,
}: {
  title: string;
  description: string;
  userEmail: string;
  submit: boolean;
}) {
  let status = "DRAFT";
  let approver: string | null = null;

  if (submit) {
    const { data: employee, error } = await supabase
      .from("employees")
      .select("reports_to")
      .eq("email", userEmail)
      .single();

    if (error) throw error;

    if (!employee?.reports_to) {
      throw new Error("No approver configured for this user");
    }

    approver = employee.reports_to;
    status = "Pending";
  }

  const { data, error } = await supabase
    .from("requests")
    .insert([
      {
        title,
        description,
        created_by: userEmail,
        current_approver: approver,
        status,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

// ==========================================
// UPLOAD DOCUMENTS
// ==========================================
export async function uploadDocuments(
  files: File[],
  requestId: string
) {
  if (!files || files.length === 0) return;

  const documentsToInsert = [];

  for (const file of files) {
    const safeName = file.name
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `${requestId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("request-documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    documentsToInsert.push({
      request_id: requestId,
      file_name: file.name,
      file_path: filePath,
    });
  }

  const { error: insertError } = await supabase
    .from("documents")
    .insert(documentsToInsert);

  if (insertError) throw insertError;
}