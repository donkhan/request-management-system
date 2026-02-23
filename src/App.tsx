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

interface NormalizedUser {
  email: string;
  name?: string;
  avatar?: string | null;
}

export default function App() {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);

  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [myApprovals, setMyApprovals] = useState<Request[]>([]);

  const [view, setView] = useState<
    "dashboard" | "create" | "approval" | "view"
  >("dashboard");

  const [selectedRequest, setSelectedRequest] =
    useState<Request | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ---------------- FETCH EMPLOYEE PROFILE ----------------
  const fetchEmployeeProfile = async (email: string) => {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .single();

    setEmployeeProfile(data || null);
  };

  // ---------------- FETCH REQUESTS ----------------
  const fetchAllData = async (email: string) => {
    try {
      setIsRefreshing(true);

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

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to refresh data", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ---------------- INITIAL SESSION CHECK ----------------
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user?.email) {
        const email = data.session.user.email;

        const normalizedUser: NormalizedUser = {
          email,
          name:
            data.session.user.user_metadata?.full_name ??
            data.session.user.user_metadata?.name ??
            email,
          avatar:
            data.session.user.user_metadata?.avatar_url ??
            data.session.user.user_metadata?.picture ??
            null,
        };

        setUser(normalizedUser);

        await fetchEmployeeProfile(email);
        await fetchAllData(email);
      }
    };

    checkSession();
  }, []);

  // ---------------- AUTH LISTENER ----------------
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user?.email) {
          const email = session.user.email;

          const normalizedUser: NormalizedUser = {
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
        } else {
          setUser(null);
          setEmployeeProfile(null);
          setMyRequests([]);
          setMyApprovals([]);
          setView("dashboard");
          setSelectedRequest(null);
          setLastUpdated(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ---------------- AUTO REFRESH (30s) ----------------
  useEffect(() => {
    if (!user?.email) return;
    if (view !== "dashboard") return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchAllData(user.email);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.email, view]);

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setEmployeeProfile(null);
    setMyRequests([]);
    setMyApprovals([]);
    setView("dashboard");
    setSelectedRequest(null);
    setLastUpdated(null);
  };

  // ---------------- LOGIN PAGE ----------------
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

  // ---------------- MAIN LAYOUT ----------------
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <img
            src="/cmr-logo.png"
            alt="CMR University"
            className="h-14 w-auto object-contain"
          />
          <div>
            <div className="text-2xl font-semibold">
              CMR University
            </div>
            <div className="text-sm text-gray-500">
              Request Management System
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <UserProfileBadge
            user={user}
            employeeProfile={employeeProfile}
          />
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        {view === "dashboard" && (
          <div className="space-y-12">

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {lastUpdated &&
                  `Last Updated: ${lastUpdated.toLocaleTimeString()}`}
              </div>

              <button
                onClick={() => user && fetchAllData(user.email)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                {isRefreshing && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <path
                      fill="white"
                      opacity="0.75"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                Refresh
              </button>
            </div>

            {/* Tables remain unchanged */}
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

          </div>
        )}

        {(view === "create" ||
          view === "approval" ||
          view === "view") && (
          <RequestFormPage
            mode={view}
            requestToEdit={selectedRequest || undefined}
            currentUser={user}
            onBack={() => {
              setView("dashboard");
              setSelectedRequest(null);
            }}
            onSuccess={async () => {
              if (user?.email) {
                await fetchAllData(user.email);
              }
              setView("dashboard");
              setSelectedRequest(null);
            }}
          />
        )}
      </main>
    </div>
  );
}