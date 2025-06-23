import { Link } from "react-router";

export async function loader() {
  return null;
}

export default function RootPage() {
  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 text-gray-800">
      <div className="flex justify-center items-center max-w-5xl mx-auto mb-30">
        <div className="flex gap-6">
          <Link
            to="/employees"
            className="px-6 py-3 border border-green-700 text-green-700 rounded hover:bg-green-700 hover:text-white transition"
          >
            View Employees
          </Link>
          <Link
            to="/timesheets"
            className="px-6 py-3 border border-blue-700 text-blue-700 rounded hover:bg-blue-700 hover:text-white transition"
          >
            View Timesheets
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to the Timesheet Manager
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          This dashboard helps you manage your company's employees and track
          their working hours efficiently. It's a full-stack application built
          with modern technologies like React, React Router, and SQLite.
        </p>
        <ul className="list-disc text-left list-inside text-gray-700 space-y-3">
          <li>
            <strong>Employee Directory:</strong> Browse, view, and manage
            employee details, including uploaded CVs and profile photos.
          </li>
          <li>
            <strong>Timesheet System:</strong> Log working hours with accurate
            start/end times per employee.
          </li>
          <li>
            <strong>Dual View Mode:</strong> View timesheets in either table or
            calendar mode, with dynamic filtering by employee.
          </li>
          <li>
            <strong>Smart Filtering & Pagination:</strong> Easily find and
            navigate through records using filters and pagination controls.
          </li>
          <li>
            <strong>Clean UX:</strong> User-friendly interface for comfortable
            browsing.
          </li>
        </ul>
      </div>
    </div>
  );
}
