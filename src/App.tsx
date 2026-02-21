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
}

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [view, setView] = useState<"dashboard" | "create">("dashboard");

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
  // FETCH REQUESTS (when user changes)
  // ==========================
  useEffect(() => {
    if (!user?.email) {
      setRequests([]);
      return;
    }

    const fetchRequests = async () => {
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

    fetchRequests();
  }, [user]);

  // ==========================
  // LOGIN
  // ==========================
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
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
  };

  // ==========================
  // AUTH LOADING SCREEN
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
  // CREATE PAGE
  // ==========================
  if (view === "create") {
    return (
      <CreateRequestPage
        onBack={() => setView("dashboard")}
        onSuccess={() => setView("dashboard")}
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
          My Requests
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user.email}
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Your Requests
          </h2>

          <button
            onClick={() => setView("create")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Request
          </button>
        </div>

        {dataLoading ? (
          <div>Loading requests...</div>
        ) : (
          <RequestsTable requests={requests} />
        )}
      </main>
    </div>
  );
}