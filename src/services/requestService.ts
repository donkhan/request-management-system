import { supabase } from "../supabase";

// -----------------------------
// CREATE REQUEST
// -----------------------------
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
    if (!employee?.reports_to)
      throw new Error("No approver configured");

    approver = employee.reports_to;
    status = "PENDING";
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

  // 🔥 AUDIT LOG FOR SUBMIT
  if (submit) {
    await supabase.from("request_audit_logs").insert({
      request_id: data.id,
      action: "SUBMITTED",
      acted_by: userEmail,
      acted_to: approver,
      comment: "Request submitted",
    });
  }

  return data;
}

// -----------------------------
// UPLOAD DOCUMENTS
// -----------------------------
export async function uploadDocuments(
  files: File[],
  requestId: string
) {
  if (!files.length) return;

  const docsToInsert = [];

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
    .from("documents")
    .insert(docsToInsert);

  if (error) throw error;
}

// -----------------------------
// SAVE / EDIT REQUEST
// -----------------------------
export async function saveRequestWithDocuments({
  isEditMode,
  requestToEdit,
  title,
  description,
  files,
  existingDocs,
  deletedDocIds,
  submit,
}: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) throw new Error("User not authenticated");

  if (isEditMode) {
    let status = "DRAFT";
    let approver: string | null = null;

    if (submit) {
      const { data: employee } = await supabase
        .from("employees")
        .select("reports_to")
        .eq("email", user.email)
        .single();

      approver = employee?.reports_to || null;
      status = "PENDING";
    }

    // Update request
    const { data: updatedRequest, error } = await supabase
      .from("requests")
      .update({
        title,
        description,
        status,
        current_approver: approver,
      })
      .eq("id", requestToEdit.id)
      .select()
      .single();

    if (error) throw error;

    // 🔥 AUDIT LOG FOR RESUBMIT
    if (submit) {
      await supabase.from("request_audit_logs").insert({
        request_id: updatedRequest.id,
        action: "SUBMITTED",
        acted_by: user.email,
        acted_to: approver,
        comment: "Request resubmitted",
      });
    }

    // Delete removed docs
    if (deletedDocIds.length > 0) {
      const docsToDelete = existingDocs.filter((doc: any) =>
        deletedDocIds.includes(doc.id)
      );

      const paths = docsToDelete.map(
        (doc: any) => doc.file_path
      );

      if (paths.length) {
        await supabase.storage
          .from("request-documents")
          .remove(paths);
      }

      await supabase
        .from("documents")
        .delete()
        .in("id", deletedDocIds);
    }

    if (files.length) {
      await uploadDocuments(files, requestToEdit.id);
    }

    return updatedRequest;
  } else {
    const request = await createRequest({
      title,
      description,
      userEmail: user.email,
      submit,
    });

    if (files.length) {
      await uploadDocuments(files, request.id);
    }

    return request;
  }
}