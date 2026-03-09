import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import RequestsTable from "./components/RequestsTable";
import RequestFormPage from "./components/RequestFormPage";
import UserProfileBadge from "./components/UserProfileBadge";
import { loginWithGoogle, logout } from "./services/authService";
import { fetchEmployeeProfile } from "./services/employeeService";
import LoginPage from "./components/LoginPage";
import HelpPage from "./components/HelpPage";
import HierarchyPage from "./components/HierarchyPage";
import {
  getDashboardData,
  getMyDecisionHistory,
} from "./services/requestService";
import DecisionHistoryTable from "./components/DecisionHistoryTable";
import RegistrationPage from "./components/RegistrationPage";
import type { Request } from "./types";

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
  const [myDecisions, setMyDecisions] = useState<any[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({});

  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);

  const filteredRequests = showOnlyPending
    ? myRequests.filter((r) => r.status === "PENDING")
    : myRequests;

  const [view, setView] = useState<
    "dashboard" | "create" | "approval" | "view"
  >("dashboard");

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadEmployeeProfile = async (email: string) => {
    const profile = await fetchEmployeeProfile(email);
    setEmployeeProfile(profile);
  };

  const fetchAllData = async (email: string) => {
    try {
      setIsRefreshing(true);

      const { myRequests, myApprovals } = await getDashboardData(email);

      const decisionHistory = await getMyDecisionHistory(email);

      setMyRequests(myRequests);
      setMyApprovals(myApprovals);
      setMyDecisions(decisionHistory);

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

  // --------------------------------------------------
  // Auto Refresh (30s)
  // --------------------------------------------------
  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchAllData(user.email);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // --------------------------------------------------
  // Visibility Reset (Demo Lock Fix)
  // --------------------------------------------------
  
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        console.warn("Tab resumed. Resetting Supabase state for demo.");

        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-")) {
            localStorage.removeItem(key);
          }
        });

        //sessionStorage.clear();
        //indexedDB.deleteDatabase("supabase.auth.token");
        //window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  

  // --------------------------------------------------
  // Auth Initialization
  // --------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabase();

    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (data.session?.user) {
        await handleUserLogin(data.session.user);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log("Auth Event:", event);

        if (event === "SIGNED_IN" && session?.user) {
          await handleUserLogin(session.user);
          return;
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          setEmployeeProfile(null);
          setMyRequests([]);
          setMyApprovals([]);
          setMyDecisions([]);
          setView("dashboard");
          setSelectedRequest(null);
          setLastUpdated(null);
        }
      },
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadEmployees = async () => {
      const supabase = getSupabase();

      const { data } = await supabase
        .from("employee")
        .select("email,name")
        .eq("status", "APPROVED");

      const map: Record<string, string> = {};

      data?.forEach((emp) => {
        map[emp.email] = emp.name;
      });

      setEmployeeMap(map);
    };

    loadEmployees();
  }, []);

  const handleLogin = async (email?: string) => {
    if (import.meta.env.DEV && email) {
      const fakeUser = {
        email,
        user_metadata: {
          name: email,
          full_name: email,
        },
      };

      await handleUserLogin(fakeUser);
      return;
    }

    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />

        <button
          onClick={() => setShowHelp(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-blue-700 z-40"
        >
          ❓
        </button>

        {showHelp && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white max-h-[90vh] overflow-auto rounded-2xl shadow-xl relative">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>

              <HelpPage />
            </div>
          </div>
        )}
      </>
    );
  }

  if (!employeeProfile) {
    return (
      <RegistrationPage
        user={user}
        onRegistered={async () => {
          if (user?.email) {
            await loadEmployeeProfile(user.email);
          }
        }}
      />
    );
  }

  if (employeeProfile.status === "PENDING") {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">Registration Under Review</h2>
        <p className="mt-2 text-gray-600">
          Your request has been sent to your department head. Please wait for
          approval.
        </p>
      </div>
    );
  }

  if (employeeProfile.status === "REJECTED") {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold text-red-600">
          Registration Rejected
        </h2>
        <p className="mt-2 text-gray-600">Please contact administrator.</p>
      </div>
    );
  }

  // --------------------------------------------------
  // Main Layout
  // --------------------------------------------------
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
            <div className="text-2xl font-semibold">CMR University</div>
            <div className="text-sm text-gray-500">
              Request Management System
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <UserProfileBadge user={user} employeeProfile={employeeProfile} />
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
                onClick={() => setShowHierarchy(true)}
                className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Hierarchy
              </button>

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
                <h2 className="text-lg font-semibold">My Requests</h2>

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

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOnlyPending}
                  onChange={(e) => setShowOnlyPending(e.target.checked)}
                />
                Show Only Pending
              </label>

              <RequestsTable
                requests={filteredRequests}
                employeeMap={employeeMap}
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
              <h2 className="text-lg font-semibold mb-6">My Approvals</h2>

              <RequestsTable
                requests={myApprovals}
                employeeMap={employeeMap}
                onView={(req) => {
                  setSelectedRequest(req);
                  setView("approval");
                }}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-6">
                My Decision History
              </h2>

              <DecisionHistoryTable
                decisions={myDecisions}
                employeeMap={employeeMap}
                onView={(req) => {
                  setSelectedRequest(req);
                  setView("view");
                }}
              />
            </section>
          </div>
        )}

        {(view === "create" || view === "approval" || view === "view") && (
          <RequestFormPage
            mode={view}
            requestToEdit={selectedRequest || undefined}
            currentUser={user}
            department={employeeProfile?.department}
            employeeMap={employeeMap}
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

      {/* Floating Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-blue-700 z-40"
      >
        ❓
      </button>

      {/* Help Popup */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white max-h-[90vh] overflow-auto rounded-2xl shadow-xl relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <HelpPage />
          </div>
        </div>
      )}

      {/* Hierarchy Popup */}
      {showHierarchy && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white max-h-[90vh] overflow-auto rounded-2xl shadow-xl relative w-[90%] max-w-6xl">
            <button
              onClick={() => setShowHierarchy(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <HierarchyPage />
          </div>
        </div>
      )}
    </div>
  );
}
