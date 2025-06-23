import { useLoaderData } from "react-router";
import { getDB } from "~/db/getDB";
import { useState, useEffect } from "react";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT * FROM employees;");
  return { employees };
}

export default function EmployeesPage() {
  const { employees } = useLoaderData() as { employees: any[] };

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [salaryFilter, setSalaryFilter] = useState(10000);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const filteredEmployees = employees.filter((employee) => {
    const nameMatch = employee.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const departmentMatch = departmentFilter
      ? employee.department === departmentFilter
      : true;

    const salaryMatch =
      employee.salary === null || employee.salary <= salaryFilter;

    return nameMatch && departmentMatch && salaryMatch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / itemsPerPage)
  );

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, salaryFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 mb-10">
        <div className="flex gap-4">
          <a
            href="/employees/new"
            className="border border-green-700 text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-700 hover:text-white transition"
          >
            New Employee
          </a>
          <a
            href="/timesheets"
            className="border border-gray-700 text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-700 hover:text-white transition"
          >
            Timesheets
          </a>
        </div>

        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {[...new Set(employees.map((e) => e.department))]
            .filter(Boolean)
            .sort()
            .map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
        </select>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <label
            htmlFor="salaryRange"
            className="text-sm font-medium text-gray-700"
          >
            Salary
          </label>
          <input
            id="salaryRange"
            type="range"
            min="0"
            max="10000"
            step="1000"
            value={salaryFilter}
            onChange={(e) => setSalaryFilter(Number(e.target.value))}
            className="w-full sm:w-40 accent-emerald-500"
          />
          <span className="text-sm text-gray-700">
            ${salaryFilter.toLocaleString()}
          </span>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Employee List</h1>

      {paginatedEmployees.length === 0 ? (
        <p className="text-center text-gray-500">No employees found.</p>
      ) : (
        <div className="grid gap-6">
          {paginatedEmployees.map((employee) => (
            <div key={employee.id} className="employee-card">
              <img
                src={
                  employee.photo_path || "/public/uploads/photos/default.png"
                }
                alt={employee.full_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
              />

              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="employee-info">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {employee.full_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">Job Title: </span>
                    {employee.job_title}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">Department: </span>
                    {employee.department}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">Email: </span>
                    {employee.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">Phone: </span>
                    {employee.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold">Salary: </span>$
                    {employee.salary}
                  </p>

                  {employee.document_path && (
                    <a
                      href={employee.document_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View CV
                    </a>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <a
                    href={`/employees/${employee.id}`}
                    className="border border-blue-700 text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-700 hover:text-white transition"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-green-700 text-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 hover:text-white transition cursor-pointer"
        >
          Previous
        </button>

        <span className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-green-700 text-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 hover:text-white transition cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
