import { getSupabase } from "../supabase";
import { getDepartmentHead } from "./employeeService";
import { deleteDocuments, uploadDocuments } from "./documentService";


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


async function createRequest(
  title: string,
  description: string,
  userEmail: string,
  status: string,
  approver: string | null,
  department: string,
) {
  const { data, error } = await db()
    .from("request")
    .insert({
      title,
      description,
      created_by: userEmail,
      status,
      current_approver: approver,
      department : department
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


export async function saveRequestWithDocuments({
  isEditMode,
  requestToEdit,
  title,
  description,
  files,
  existingDocs,
  deletedDocIds,
  submit,
  department,
}: any) {
  const userEmail = await getCurrentUserEmail();

  const { status, approver } = await resolveWorkflow(
    userEmail,
    submit
  );
  if (!isEditMode && !department) {
   throw new Error("Department missing while creating request.");
  }
  const request = isEditMode
    ? await updateRequest(
        requestToEdit.id,
        title,
        description,
        status,
        approver,
      )
    : await createRequest(
        title,
        description,
        userEmail,
        status,
        approver,
        department,
      );

  if (submit) {
    const truncatedDescription =
      description.length > 500
      ? description.substring(0, 500) + "..."
      : description;

    const auditComment = `Title: ${title}
    Description: ${truncatedDescription}`;
    await db().from("audit_log").insert({
      request_id: request.id,
      action: "SUBMITTED",
      acted_by: userEmail,
      acted_to: approver,
      comment: auditComment,
      department: department,
    });
  }

  if (isEditMode) {
    await deleteDocuments(deletedDocIds, existingDocs);
  }

  await uploadDocuments(files, request.id);

  return request;
}


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
  department,
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
    department: department,
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


export async function getMyDecisionHistory(email: string) {
  const supabase = db();

  const { data, error } = await supabase
    .from("audit_log")
    .select(`
      id,
      action,
      department,
      comment,
      created_at,
      request_id,
      request:request_id (
        id,
        title,
        department,
        created_by,
        status
      )
    `)
    .eq("acted_by", email)
    .in("action", ["APPROVED", "REJECTED"])
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}


export async function forwardRequestToUser({
  requestId,
  newApproverEmail,
  currentUserEmail,
  department,
  comment
}: {
  requestId: string;
  newApproverEmail: string;
  currentUserEmail: string;
  department?: string;
}) {
  const supabase = getSupabase();

  // Update current approver
  const { error: updateError } = await supabase
    .from("request")
    .update({ current_approver: newApproverEmail })
    .eq("id", requestId);

  if (updateError) throw updateError;

  // Insert audit log
  const { error: logError } = await supabase
    .from("audit_log")
    .insert({
      request_id: requestId,
      action: "FORWARDED",
      acted_by: currentUserEmail,
      acted_to: newApproverEmail,
      department: department,
      comment: comment,
    });

  if (logError) throw logError;
}