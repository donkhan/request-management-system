export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-6">
        Request Management System – Help
      </h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        1. Login
      </h2>
      <p>
        Click <b>Sign in with Google</b> on the login page. Use your
        official institutional Google account.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. Self Registration
      </h2>
      <p>
        If you are logging in for the first time, the system will ask you
        to complete your profile.
      </p>

      <ul className="list-disc ml-6 mt-2">
        <li>Select your Department</li>
        <li>Submit the form</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. Creating a Request
      </h2>
      <p>
        Click <b>Create Request</b> and fill the required details.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        4. Approval Workflow
      </h2>

      <ul className="list-disc ml-6">
        <li>Employee submits request</li>
        <li>Department Head reviews</li>
        <li>Admin processes the request</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Need Help?
      </h2>

      <p>
        Contact the system administrator (kamil.k@cmr.edu.in) if you face any issues.
      </p>

    </div>
  );
}