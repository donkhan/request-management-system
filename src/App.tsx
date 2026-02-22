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
  created_by?: string | null;
  current_approver?: string | null;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);

  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [myApprovals, setMyApprovals] = useState<Request[]>([]);

  const [view, setView] = useState<
    "dashboard" | "create" | "approval"
  >("dashboard");

  const [selectedRequest, setSelectedRequest] =
    useState<Request | null>(null);

  const fetchEmployeeProfile = async (email: string) => {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .single();

    setEmployeeProfile(data || null);
  };

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

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user?.email) {
          setUser(session.user);
          await fetchEmployeeProfile(session.user.email);
          await fetchAllData(session.user.email);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleDevLogin = async (email: string) => {
    const fakeUser = {
      email,
      user_metadata: {
        full_name: email.split("@")[0],
      },
    };

    setUser(fakeUser);
    await fetchEmployeeProfile(email);
    await fetchAllData(email);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmployeeProfile(null);
    setMyRequests([]);
    setMyApprovals([]);
    setView("dashboard");
    setSelectedRequest(null);
  };

  // ======================
  // LOGIN SCREEN
  // ======================
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center space-y-6">
          <h1 className="text-2xl font-bold">
            Request Management System
          </h1>

          <select
            onChange={(e) => handleDevLogin(e.target.value)}
            className="w-full border rounded-xl p-3"
            defaultValue=""
          >
            <option value="" disabled>
              Select Dev User
            </option>
            <option value="kamil.k@cmr.edu.in">
              kamil.k@cmr.edu.in
            </option>
            <option value="ashokkumar.t@cmr.edu.in">
              ashokkumar.t@cmr.edu.in
            </option>
            <option value="provc.praveen@cmr.edu.in">
              provc.praveen@cmr.edu.in
            </option>
          </select>

          <div className="text-gray-400">OR</div>

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

  // ======================
  // CREATE / EDIT PAGE
  // ======================
  if (view === "create") {
    return (
      <CreateRequestPage
        mode={selectedRequest ? "edit" : "create"}
        requestToEdit={selectedRequest || undefined}
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

  // ======================
  // APPROVAL PAGE
  // ======================
  if (view === "approval" && selectedRequest) {
    return (
      <CreateRequestPage
        mode="approval"
        requestToEdit={selectedRequest}
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

  // ======================
  // DASHBOARD
  // ======================
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
      </main>
    </div>
  );
}