export interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  created_by?: string | null;
  current_approver?: string | null;
}


export interface DecisionRow {
  id: string;
  action: "APPROVED" | "REJECTED";
  created_at: string;
  request_id: string;
  request: Request;
}