import { useState } from "react";

interface Props {
  onLogin: (email?: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const isDev = import.meta.env.DEV;
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LEFT SIDE – Branding */}
      <div className="hidden md:flex flex-col items-center justify-center bg-blue-600 text-white p-12">

        <img
          src="/cmr-logo.png"
          alt="CMR University"
          className="h-20 mb-6"
        />

        <h1 className="text-3xl font-bold mb-4 text-center">
          CMR University
        </h1>

        <p className="text-lg text-center opacity-90 max-w-md">
          Request Management System
        </p>

        <p className="mt-4 text-sm opacity-80 text-center max-w-md">
          Digitizing internal approvals and administrative workflows across departments.
        </p>

      </div>

      {/* RIGHT SIDE – Login */}
      <div className="flex items-center justify-center bg-gray-100">

        <div className="bg-white p-12 rounded-3xl shadow-xl text-center space-y-6 w-[420px]">

          <h2 className="text-2xl font-semibold">
            Sign in
          </h2>

          {isDev ? (
            <>
              <p className="text-gray-500 text-sm">
                DEV Mode – Enter Email
              </p>

              <input
                type="email"
                placeholder="Enter email"
                className="border px-4 py-2 rounded-lg w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                onClick={() => onLogin(email)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Login (DEV)
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 text-sm">
                Use your institutional Google account
              </p>

              <button
                onClick={() => onLogin()}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Login with Google
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  );
}