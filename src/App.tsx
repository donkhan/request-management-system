import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import RequestsTable from "./components/RequestsTable";
import CreateRequestPage from "./components/CreateRequestPage";

interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  current_approver?: string | null;
}

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [view, setView] = useState<"dashboard" | "create">("dashboard");
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);

  // ==========================
  // AUTH INIT
  // ==========================
  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setAuthLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ==========================
  // FETCH REQUESTS (GLOBAL)
  // ==========================
  const fetchRequests = async () => {
    if (!user?.email) {
      setRequests([]);
      return;
    }

    setDataLoading(true);

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("created_by", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
    } else {
      setRequests(data || []);
    }

    setDataLoading(false);
  };

  // Fetch whenever user changes
  useEffect(() => {
    fetchRequests();
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
    setRequests([]);
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
          await fetchRequests();
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
        <h1 className="text-xl font-semibold">My Requests</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-2xl shadow-sm">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-9 h-9 rounded-full border"
              />
            )}

            <div className="flex flex-col text-sm">
              <span className="font-semibold text-gray-800 leading-tight">
                {user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  "User"}
              </span>
              <span className="text-gray-500 text-xs leading-tight">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Your Requests</h2>

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
          <div>Loading requests...</div>
        ) : (
          <RequestsTable
            requests={requests}
            onEdit={(req: Request) => {
              setEditingRequest(req);
              setView("create");
            }}
          />
        )}
      </main>
    </div>
  );
}