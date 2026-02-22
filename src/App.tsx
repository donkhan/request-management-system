import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import RequestsTable from "./components/RequestsTable";
import RequestFormPage from "./components/RequestFormPage";
import UserProfileBadge from "./components/UserProfileBadge";

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  created_by?: string | null;
  current_approver?: string | null;
}

/*
  🔥 DEVELOPMENT EMAIL MAPPING
  Google Gmail → Institutional Email
  REMOVE or empty this in production.
*/
const DEV_EMAIL_MAP: Record<string, string> = {
  "routetokamil@gmail.com": "ashokkumar.t@cmr.edu.in",
  "23f3004493@ds.study.iitm.ac.in": "provc.praveen@cmr.edu.in",
  "kamil.k@cmr.edu.in": "kamil.k@cmr.edu.in",
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);

  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [myApprovals, setMyApprovals] = useState<Request[]>([]);

  // ✅ Added "view" mode
  const [view, setView] = useState<
    "dashboard" | "create" | "approval" | "view"
  >("dashboard");

  const [selectedRequest, setSelectedRequest] =
    useState<Request | null>(null);

  // 🔹 Fetch employee profile
  const fetchEmployeeProfile = async (email: string) => {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .single();

    setEmployeeProfile(data || null);
  };

  // 🔹 Fetch all requests + approvals
  const fetchAllData = async (email: string) => {
    const { data: requestsData } = await supabase
      .from("requests")
      .select("*")
      .eq("created_by", email)
      .order("created_at", { ascending: false });

    setMyRequests(requestsData || []);

    const { data: approvalsData } = await supabase
      .from("requests")
      .select("*")
      .eq("current_approver", email)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    setMyApprovals(approvalsData || []);
  };

  // 🔹 Auth Listener
  useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session?.user?.email) {
        const email = session.user.email;

        const normalizedUser = {
          email,
          name:
            session.user.user_metadata?.full_name ??
            session.user.user_metadata?.name ??
            email,
          avatar:
            session.user.user_metadata?.avatar_url ??
            session.user.user_metadata?.picture ??
            null,
        };

        setUser(normalizedUser);

        await fetchEmployeeProfile(email);
        await fetchAllData(email);
      }
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

  // 🔹 Google Login
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  // 🔹 Logout (non-blocking)
  const handleLogout = () => {
    supabase.auth.signOut().catch((err) =>
      console.error("SignOut error:", err)
    );

    setUser(null);
    setEmployeeProfile(null);
    setMyRequests([]);
    setMyApprovals([]);
    setView("dashboard");
    setSelectedRequest(null);
  };

  // 🔹 Not Logged In
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center space-y-6">
          <h1 className="text-2xl font-bold">
            Request Management System
          </h1>

          <button
            onClick={handleGoogleLogin}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition w-full"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  // 🔹 Create / Edit
  if (view === "create") {
    return (
      <RequestFormPage
        mode={selectedRequest ? "edit" : "create"}
        requestToEdit={selectedRequest || undefined}
        currentUser={user}
        onBack={() => {
          setView("dashboard");
          setSelectedRequest(null);
        }}
        onSuccess={async () => {
          await fetchAllData(user.email);
          setView("dashboard");
          setSelectedRequest(null);
        }}
      />
    );
  }

  // 🔹 View Mode (NEW)
  if (view === "view" && selectedRequest) {
    return (
      <RequestFormPage
        mode="view"
        requestToEdit={selectedRequest}
        currentUser={user}
        onBack={() => {
          setView("dashboard");
          setSelectedRequest(null);
        }}
        onSuccess={async () => {
          await fetchAllData(user.email);
          setView("dashboard");
          setSelectedRequest(null);
        }}
      />
    );
  }

  // 🔹 Approval
  if (view === "approval" && selectedRequest) {
    return (
      <RequestFormPage
        mode="approval"
        requestToEdit={selectedRequest}
        currentUser={user}
        onBack={() => {
          setView("dashboard");
          setSelectedRequest(null);
        }}
        onSuccess={async () => {
          await fetchAllData(user.email);
          setView("dashboard");
          setSelectedRequest(null);
        }}
      />
    );
  }

  // 🔹 Dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Request Management System
        </h1>

        <div className="flex items-center gap-4">
          <UserProfileBadge
            user={user}
            employeeProfile={employeeProfile}
          />

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8 space-y-12">
        {/* My Requests */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              My Requests
            </h2>

            <button
              onClick={() => {
                setSelectedRequest(null);
                setView("create");
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + New Request
            </button>
          </div>

          <RequestsTable
            requests={myRequests}
            onEdit={(req) => {
              setSelectedRequest(req);
              setView("create");
            }}
            onView={(req) => {
              setSelectedRequest(req);
              setView("view");
            }}
          />
        </section>

        {/* My Approvals */}
        <section>
          <h2 className="text-lg font-semibold mb-6">
            My Approvals
          </h2>

          <RequestsTable
            requests={myApprovals}
            onView={(req) => {
              setSelectedRequest(req);
              setView("approval");
            }}
          />
        </section>
      </main>
    </div>
  );
}