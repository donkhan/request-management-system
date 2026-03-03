import { getSupabase } from "../supabase";

/* =====================================================
   SHARED
===================================================== */

function db() {
  return getSupabase();
}

async function getCurrentUserEmail(): Promise<string> {
  const {
    data: { user },
  } = await db().auth.getUser();

  if (!user?.email) throw new Error("User not authenticated");

  return user.email;
}

async function requireComment(comment: string) {
  if (!comment.trim()) {
    throw new Error("Comment is mandatory.");
  }
}

export async function fetchEmployeeProfile(email: string) {
  const { data, error } = await db()
    .from("employee")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw error;

  return data ?? null;
}

async function getDepartmentHead(email: string) {
  const supabase = db();

  const { data: emp, error: empError } = await supabase
    .from("employee")
    .select("department")
    .eq("email", email)
    .single();

  if (empError || !emp?.department) {
    throw new Error("Employee department not found");
  }

  const { data: dept, error: deptError } = await supabase
    .from("department")
    .select("head_email")
    .eq("name", emp.department)
    .single();

  if (deptError || !dept?.head_email) {
    throw new Error("Department head not found");
  }

  return dept.head_email;
}

async function resolveWorkflow(userEmail: string, submit: boolean) {
  if (!submit) {
    return { status: "DRAFT", approver: null };
  }

  const approver = await getDepartmentHead(userEmail);

  return {
    status: "PENDING",
    approver,
  };
}

/* =====================================================
   REQUEST CRUD
===================================================== */

async function createRequest(
  title: string,
  description: string,
  userEmail: string,
  status: string,
  approver: string | null
) {
  const { data, error } = await db()
    .from("request")
    .insert({
      title,
      description,
      created_by: userEmail,
      status,
      current_approver: approver,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateRequest(
  requestId: string,
  title: string,
  description: string,
  status: string,
  approver: string | null
) {
  const { data, error } = await db()
    .from("request")
    .update({
      title,
      description,
      status,
      current_approver: approver,
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* =====================================================
   DOCUMENTS
===================================================== */

export async function fetchRequestDocuments(requestId: string) {
  const { data, error } = await db()
    .from("document")
    .select("*")
    .eq("request_id", requestId);

  if (error) throw error;
  return data ?? [];
}

async function deleteDocuments(
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

    const { error } = await supabase.storage
      .from("request-documents")
      .upload(filePath, file);

    if (error) throw error;

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
   SAVE REQUEST (CREATE OR UPDATE)
===================================================== */

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
  const userEmail = await getCurrentUserEmail();

  const { status, approver } = await resolveWorkflow(
    userEmail,
    submit
  );

  const request = isEditMode
    ? await updateRequest(
        requestToEdit.id,
        title,
        description,
        status,
        approver
      )
    : await createRequest(
        title,
        description,
        userEmail,
        status,
        approver
      );

  if (submit) {
    await db().from("audit_log").insert({
      request_id: request.id,
      action: "SUBMITTED",
      acted_by: userEmail,
      acted_to: approver,
      comment: "Request submitted",
    });
  }

  if (isEditMode) {
    await deleteDocuments(deletedDocIds, existingDocs);
  }

  await uploadDocuments(files, request.id);

  return request;
}

/* =====================================================
   APPROVAL ACTION
===================================================== */

function buildApprovalUpdate(
  action: "APPROVED" | "REJECTED" | "REJECTED_WITH_EDIT" | "FORWARDED",
  createdBy: string,
  nextApprover?: string | null
) {
  switch (action) {
    case "APPROVED":
      return { status: "APPROVED", current_approver: null };

    case "REJECTED":
      return { status: "REJECTED", current_approver: null };

    case "REJECTED_WITH_EDIT":
      return {
        status: "REJECTED_WITH_EDIT",
        current_approver: createdBy,
      };

    case "FORWARDED":
      return {
        status: "PENDING",
        current_approver: nextApprover ?? null,
      };
  }
}

export async function performApprovalAction({
  requestId,
  action,
  comment,
  currentUserEmail,
  createdBy,
}: {
  requestId: string;
  action: "APPROVED" | "REJECTED" | "REJECTED_WITH_EDIT" | "FORWARDED";
  comment: string;
  currentUserEmail: string;
  createdBy: string;
}) {
  await requireComment(comment);

  let nextApprover: string | null = null;

  if (action === "FORWARDED") {
    nextApprover = await getDepartmentHead(currentUserEmail);

    if (nextApprover === currentUserEmail) {
      throw new Error("Cannot forward to yourself.");
    }
  }

  const updateData = buildApprovalUpdate(
    action,
    createdBy,
    nextApprover
  );

  const supabase = db();

  const { error } = await supabase
    .from("request")
    .update(updateData)
    .eq("id", requestId);

  if (error) throw error;

  await supabase.from("audit_log").insert({
    request_id: requestId,
    action,
    acted_by: currentUserEmail,
    acted_to: updateData.current_approver,
    comment,
  });
}

/* =====================================================
   DASHBOARD
===================================================== */

export async function getDashboardData(email: string) {
  const supabase = db();

  const { data: myRequests, error: reqError } = await supabase
    .from("request")
    .select("*")
    .eq("created_by", email)
    .order("created_at", { ascending: false });

  if (reqError) throw reqError;

  const { data: myApprovals, error: apprError } = await supabase
    .from("request")
    .select("*")
    .eq("current_approver", email)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (apprError) throw apprError;

  return {
    myRequests: myRequests ?? [],
    myApprovals: myApprovals ?? [],
  };
}