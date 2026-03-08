export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto p-10 space-y-12">

      {/* Top Support Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">

        <h2 className="text-xl font-semibold mb-2">
          Need Assistance?
        </h2>

        <p className="text-gray-600">
          If you need help using the Request Management System,
          please contact the project coordinator.
        </p>

        <div className="mt-3 font-semibold text-gray-800">
          Kamil Khan (SSCS)
        </div>

        <div className="text-blue-600">
          kamil.k@cmr.edu.in
        </div>

      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Request Management System
        </h1>
        <p className="text-gray-500 mt-2">
          Quick guide to submitting and tracking requests
        </p>
      </div>

      {/* Basic Steps */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white shadow-md rounded-2xl p-6 border">
          <div className="text-3xl mb-3">🔐</div>
          <h2 className="text-lg font-semibold mb-2">1. Login</h2>
          <p className="text-gray-600 text-sm">
            Click <b>Login with Google</b> and sign in using your
            institutional Google account.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6 border">
          <div className="text-3xl mb-3">📝</div>
          <h2 className="text-lg font-semibold mb-2">2. Self Registration</h2>
          <p className="text-gray-600 text-sm mb-2">
            First-time users must complete their profile.
          </p>
          <ul className="list-disc ml-5 text-sm text-gray-600">
            <li>Select your department</li>
            <li>Submit the registration form</li>
            <li>Wait for department approval</li>
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6 border">
          <div className="text-3xl mb-3">📄</div>
          <h2 className="text-lg font-semibold mb-2">3. Create Request</h2>
          <p className="text-gray-600 text-sm">
            Click <b>+ New Request</b> on the dashboard and fill the
            request form before submitting.
          </p>
        </div>

      </div>

      {/* Request Routing */}
      <div className="bg-yellow-50 p-8 rounded-2xl shadow-inner">

        <h2 className="text-2xl font-semibold text-center mb-8">
          Request Routing: Recommend & Assign
        </h2>

        <div className="grid md:grid-cols-3 gap-6 text-center">

          <div className="bg-white shadow rounded-xl p-6">
            <div className="text-3xl mb-2">👤</div>
            <h3 className="font-semibold mb-2">Requester</h3>
            <p className="text-sm text-gray-600">
              The employee who creates the request and submits it
              through the system.
            </p>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <div className="text-3xl mb-2">👍</div>
            <h3 className="font-semibold mb-2">Recommender</h3>
            <p className="text-sm text-gray-600">
              A supervisor or senior staff member who reviews the
              request and recommends whether it should proceed.
            </p>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <div className="text-3xl mb-2">👨‍💼</div>
            <h3 className="font-semibold mb-2">Approver / Assignee</h3>
            <p className="text-sm text-gray-600">
              The authority responsible for approving or rejecting
              the request and ensuring further processing.
            </p>
          </div>

        </div>

      </div>

      {/* Workflow */}
      <div className="bg-blue-50 p-8 rounded-2xl shadow-inner">

        <h2 className="text-2xl font-semibold text-center mb-8">
          Request Lifecycle
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-6 text-center">

          <div className="bg-white shadow rounded-xl p-5 w-48">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold">Create</div>
            <div className="text-sm text-gray-500">
              Request prepared by employee
            </div>
          </div>

          <div className="text-2xl text-gray-400">➡</div>

          <div className="bg-white shadow rounded-xl p-5 w-48">
            <div className="text-3xl mb-2">📤</div>
            <div className="font-semibold">Submit</div>
            <div className="text-sm text-gray-500">
              Request enters workflow
            </div>
          </div>

          <div className="text-2xl text-gray-400">➡</div>

          <div className="bg-white shadow rounded-xl p-5 w-48">
            <div className="text-3xl mb-2">👍</div>
            <div className="font-semibold">Recommend</div>
            <div className="text-sm text-gray-500">
              Supervisor review
            </div>
          </div>

          <div className="text-2xl text-gray-400">➡</div>

          <div className="bg-white shadow rounded-xl p-5 w-48">
            <div className="text-3xl mb-2">✔</div>
            <div className="font-semibold">Approve / Reject</div>
            <div className="text-sm text-gray-500">
              Final decision
            </div>
          </div>

          <div className="text-2xl text-gray-400">➡</div>

          <div className="bg-white shadow rounded-xl p-5 w-48">
            <div className="text-3xl mb-2">⚙</div>
            <div className="font-semibold">Processing</div>
            <div className="text-sm text-gray-500">
              Admin executes request
            </div>
          </div>

        </div>

      </div>

      {/* Dashboard Explanation */}
      <div className="bg-white p-8 rounded-2xl shadow">

        <h2 className="text-2xl font-semibold text-center mb-8">
          Understanding Your Dashboard
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>
            <h3 className="font-semibold mb-2">My Requests</h3>
            <p className="text-sm text-gray-600">
              Shows requests created by you and their current status.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">My Approvals</h3>
            <p className="text-sm text-gray-600">
              Displays requests awaiting your approval decision.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Decision History</h3>
            <p className="text-sm text-gray-600">
              Shows requests where you have previously made decisions.
            </p>
          </div>

        </div>

      </div>

      {/* Bottom Support */}
      <div className="bg-gray-100 rounded-2xl p-6 text-center">

        <h2 className="text-xl font-semibold mb-2">
          Need Assistance?
        </h2>

        <p className="text-gray-600">
          For any issues while using the Request Management System,
          please contact the project coordinator.
        </p>

        <div className="mt-3 font-semibold text-gray-800">
          Kamil Khan (SSCS)
        </div>

        <div className="text-blue-600">
          kamil.k@cmr.edu.in
        </div>

      </div>

    </div>
  );
}