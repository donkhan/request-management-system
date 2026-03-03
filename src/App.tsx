import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import RequestsTable from "./components/RequestsTable";
import RequestFormPage from "./components/RequestFormPage";
import UserProfileBadge from "./components/UserProfileBadge";
import { loginWithGoogle, logout } from "./services/authService";

import {
  fetchEmployeeProfile,
  getDashboardData,
} from "./services/requestService";

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

  const loadEmployeeProfile = async (email: string) => {
    const profile = await fetchEmployeeProfile(email);
    setEmployeeProfile(profile);
  };

  const fetchAllData = async (email: string) => {
    try {
      setIsRefreshing(true);
      const { myRequests, myApprovals } =
        await getDashboardData(email);
      setMyRequests(myRequests);
      setMyApprovals(myApprovals);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to refresh data", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUserLogin = async (sessionUser: any) => {
    const email = sessionUser.email;
    const normalizedUser: NormalizedUser = {
      email,
      name:
        sessionUser.user_metadata?.full_name ??
        sessionUser.user_metadata?.name ??
        email,
      avatar:
        sessionUser.user_metadata?.avatar_url ??
        sessionUser.user_metadata?.picture ??
        null,
    };
    setUser(normalizedUser);
    await loadEmployeeProfile(email);
    await fetchAllData(email);
  };

  useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      console.warn("Tab resumed. Resetting Supabase state for demo.");
      // Clear Supabase-related storage only
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      indexedDB.deleteDatabase("supabase.auth.token");
      // Force full reload (releases lock)
      window.location.reload();
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);

  // ---------------- AUTH INITIALIZATION ----------------
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const { data } = await getSupabase().auth.getSession();
      if (!isMounted) return;
      if (data.session?.user) {
        await handleUserLogin(data.session.user);
      }
    };
    initAuth();
    const { data: listener } = getSupabase().auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          await handleUserLogin(session.user);
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
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  
  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
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