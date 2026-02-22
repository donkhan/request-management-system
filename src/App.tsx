import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import RequestsTable from "./components/RequestsTable";
import CreateRequestPage from "./components/CreateRequestPage";
import UserProfileBadge from "./components/UserProfileBadge";

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  current_approver?: string | null;
  created_by: string;
}

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);

  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [myApprovals, setMyApprovals] = useState<Request[]>([]);

  const [view, setView] = useState<"dashboard" | "create">("dashboard");
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);

  // ==========================
  // FETCH EMPLOYEE PROFILE
  // ==========================
  const fetchEmployeeProfile = async (email: string) => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Employee fetch error:", error);
      setEmployeeProfile(null);
    } else {
      setEmployeeProfile(data);
    }
  };

  // ==========================
  // FETCH REQUEST DATA
  // ==========================
  const fetchAllData = async () => {
    if (!user?.email) {
      setMyRequests([]);
      setMyApprovals([]);
      return;
    }

    setDataLoading(true);

    // My Requests
    const { data: requestsData, error: requestsError } =
      await supabase
        .from("requests")
        .select("*")
        .eq("created_by", user.email)
        .order("created_at", { ascending: false });

    if (requestsError) {
      console.error("My Requests error:", requestsError);
    } else {
      setMyRequests(requestsData || []);
    }

    // My Approvals
    const { data: approvalsData, error: approvalsError } =
      await supabase
        .from("requests")
        .select("*")
        .eq("current_approver", user.email)
        .eq("status", "PENDING")
        .order("created_at", { ascending: false });

    if (approvalsError) {
      console.error("My Approvals error:", approvalsError);
    } else {
      setMyApprovals(approvalsData || []);
    }

    setDataLoading(false);
  };

  // ==========================
  // AUTH INIT
  // ==========================
  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const loggedUser = data.user ?? null;
      setUser(loggedUser);

      if (loggedUser?.email) {
        await fetchEmployeeProfile(loggedUser.email);
      }

      setAuthLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
  (_event, session) => {
    const loggedUser = session?.user ?? null;
    setUser(loggedUser);

    if (!loggedUser) {
      setEmployeeProfile(null);
    }
  }
);

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Refetch requests when user changes
  useEffect(() => {
    fetchAllData();
  }, [user]);

  // ==========================
  // LOGIN
  // ==========================
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  // ==========================
  // LOGOUT
  // ==========================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmployeeProfile(null);
    setMyRequests([]);
    setMyApprovals([]);
    setView("dashboard");
    setEditingRequest(null);
  };

  // ==========================
  // AUTH LOADING
  // ==========================
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );
  }

  // ==========================
  // LOGIN SCREEN
  // ==========================
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center">
          <h1 className="text-2xl font-bold mb-6">
            Request Management System
          </h1>

          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  // ==========================
  // CREATE / EDIT PAGE
  // ==========================
  if (view === "create") {
    return (
      <CreateRequestPage
        requestToEdit={editingRequest}
        onBack={() => {
          setEditingRequest(null);
          setView("dashboard");
        }}
        onSuccess={async () => {
          await fetchAllData();
          setEditingRequest(null);
          setView("dashboard");
        }}
      />
    );
  }

  // ==========================
  // DASHBOARD
  // ==========================
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
        {/* ===================== */}
        {/* MY REQUESTS */}
        {/* ===================== */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              My Requests
            </h2>

            <button
              onClick={() => {
                setEditingRequest(null);
                setView("create");
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + New Request
            </button>
          </div>

          {dataLoading ? (
            <div>Loading...</div>
          ) : (
            <RequestsTable
              requests={myRequests}
              onEdit={(req: Request) => {
                setEditingRequest(req);
                setView("create");
              }}
            />
          )}
        </section>

        {/* ===================== */}
        {/* MY APPROVALS */}
        {/* ===================== */}
        <section>
          <h2 className="text-lg font-semibold mb-6">
            My Approvals
          </h2>

          {dataLoading ? (
            <div>Loading...</div>
          ) : (
            <RequestsTable
              requests={myApprovals}
              onEdit={(req: Request) => {
                setEditingRequest(req);
                setView("create");
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
}