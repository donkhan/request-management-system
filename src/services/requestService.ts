import { getSupabase } from "../supabase";
import { resolveApprover } from "./employeeService";
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

  const approver = await resolveApprover(userEmail);
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
      department: department,
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
  approver: string | null,
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
  currentUserEmail,
  isEditMode,
  requestToEdit,
  title,
  description,
  files,
  existingDocs,
  deletedDocIds,
  submit,
  department,
  nextApproverEmail,
}: any) {
  const userEmail = currentUserEmail;

  const workflow = await resolveWorkflow(userEmail, submit);

  let status = workflow.status;
  let approver = workflow.approver;

  // 👇 override if manually submitting
  if (submit && nextApproverEmail) {
    approver = nextApproverEmail;
  }

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
  action: "APPROVED" | "REJECTED" | "REJECTED_WITH_EDIT" | "RECOMMENDED" | "COMPLETED",
  createdBy: string,
  nextApprover?: string | null,
) {
  switch (action) {
    case "COMPLETED":
      return {
        status: "COMPLETED",
        current_approver: null,
      };
    case "APPROVED":
      return { status: "APPROVED", current_approver: null };

    case "REJECTED":
      return { status: "REJECTED", current_approver: null };

    case "REJECTED_WITH_EDIT":
      return {
        status: "REJECTED_WITH_EDIT",
        current_approver: createdBy,
      };

    case "RECOMMENDED":
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
  action: "APPROVED" | "REJECTED" | "REJECTED_WITH_EDIT" | "RECOMMENDED" | "COMPLETED";
  comment: string;
  currentUserEmail: string;
  createdBy: string;
  department?: string;
}) {
  await requireComment(comment);

  const supabase = db();

  // 🔹 1️⃣ Get request type first
  const { data: request, error: fetchError } = await supabase
    .from("request")
    .select("type, created_by,description")
    .eq("id", requestId)
    .single();

  if (fetchError) throw fetchError;

  let nextApprover: string | null = null;

  if (action === "RECOMMENDED") {
    nextApprover = await resolveApprover(currentUserEmail);

    if (!nextApprover) {
      throw new Error("No higher authority found.");
    }

    if (nextApprover === currentUserEmail) {
      throw new Error("Cannot recommend to yourself.");
    }
  }

  // 🔹 2️⃣ Special Logic for Registration Requests
  if (request.type === "NEW_EMPLOYEE_REGISTRATION") {

  const description = request.description || "";

  // helper to extract values from description
  const extract = (key: string) => {
    const match = description.match(new RegExp(`${key}:\\s*([^|]+)`));
    return match ? match[1].trim() : null;
  };

  const deptType = extract("Department Type");
  const newDept = extract("New Department");
  const parentDept = extract("Parent Department");
  const isHead = extract("Is Department Head");

  if (action === "APPROVED") {

    // approve employee first
    await supabase
      .from("employee")
      .update({ status: "APPROVED" })
      .eq("email", request.created_by);

    // if this is a new department request
    if (deptType === "NEW" && newDept && parentDept) {

      const headEmail = isHead === "YES" ? request.created_by : null;

      // create department
      await supabase
        .from("department")
        .insert({
          name: newDept,
          parent_department: parentDept,
          head_email: headEmail,
        });

      // move employee to new department
      await supabase
        .from("employee")
        .update({ department: newDept })
        .eq("email", request.created_by);
    }
  }

  if (action === "REJECTED") {
    await supabase
      .from("employee")
      .delete()
      .eq("email", request.created_by);
  }
}

  // 🔹 3️⃣ Normal Request Status Update
  const updateData = buildApprovalUpdate(action, createdBy, nextApprover);

  const { error } = await supabase
    .from("request")
    .update(updateData)
    .eq("id", requestId);

  if (error) throw error;

  // 🔹 4️⃣ Audit Log (unchanged)
  await supabase.from("audit_log").insert({
    request_id: requestId,
    action,
    acted_by: currentUserEmail,
    acted_to: updateData.current_approver,
    comment,
    department: department,
  });
}

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
    .select(
      `
      id,
      action,
      department,
      comment,
      created_at,
      request_id,
      request:request_id (
        id,
        title,
        description,
        department,
        created_by,
        status
      )
    `,
    )
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
  comment,
  action = "RECOMMENDED",
}: {
  requestId: string;
  newApproverEmail: string;
  currentUserEmail: string;
  department?: string;
  comment?: string;
  action?: "RECOMMENDED" | "PROCESSING";
}) {
  const supabase = getSupabase();

  let updateData;

if (action === "PROCESSING") {
  updateData = {
    status: "PROCESSING",
    current_approver: newApproverEmail,
  };
} else {
  updateData = {
    current_approver: newApproverEmail,
  };
}

const { error: updateError } = await supabase
  .from("request")
  .update(updateData)
  .eq("id", requestId);
  if (updateError) throw updateError;

  // Insert audit log
  const { error: logError } = await supabase.from("audit_log").insert({
    request_id: requestId,
    action: action,
    acted_by: currentUserEmail,
    acted_to: newApproverEmail,
    department: department,
    comment: comment,
  });

  if (logError) throw logError;
}

export async function deleteDraftRequest(
  requestId: string,
  attachments: { file_path: string }[],
) {
  const supabase = db();

  // 1. Delete files from storage
  if (attachments?.length) {
    const paths = attachments.map((f) => f.file_path);

    const { error: storageError } = await supabase.storage
      .from("request-documents")
      .remove(paths);

    if (storageError) throw storageError;
  }

  // 2. Delete document records
  const { error: docError } = await supabase
    .from("document")
    .delete()
    .eq("request_id", requestId);

  if (docError) throw docError;

  // 3. Delete audit logs (safety)
  await supabase.from("audit_log").delete().eq("request_id", requestId);

  // 4. Delete request itself
  const { error: reqError } = await supabase
    .from("request")
    .delete()
    .eq("id", requestId);

  if (reqError) throw reqError;
}
