import {
  useLoaderData,
  Form,
  redirect,
  useActionData,
  type ActionFunction,
} from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";

export async function loader() {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { employees };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time_raw = formData.get("start_time") as string;
  const end_time_raw = formData.get("end_time") as string;
  const summary = formData.get("summary");

  if (start_time_raw && end_time_raw) {
    const startDate = new Date(start_time_raw);
    const endDate = new Date(end_time_raw);

    if (startDate >= endDate) {
      return new Response(
        JSON.stringify({
          errors: { time_validation: "Start time must be before end time" },
        })
      );
    }
  }

  const db = await getDB();

  const formatDateTime = (dt: string) => dt.replace("T", " ") + ":00";

  const start_time = formatDateTime(start_time_raw);
  const end_time = formatDateTime(end_time_raw);

  await db.run(
    "INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)",
    [employee_id, start_time, end_time, summary]
  );

  return redirect("/timesheets");
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData() as {
    employees: { id: number; full_name: string }[];
  };
  const actionData = useActionData() as {
    errors?: { time_validation?: string };
  };

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateTimes = (start: string, end: string) => {
    if (!start || !end) {
      setValidationError("");
      return true;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      setValidationError("Start time must be before end time");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    validateTimes(newStartTime, endTime);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    validateTimes(startTime, newEndTime);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateTimes(startTime, endTime)) {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex gap-4 justify-center mb-10">
        <a
          href="/employees"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Employees
        </a>
        <a
          href="/timesheets"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Timesheets
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">
        Create New Timesheet
      </h1>

      <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="employee_id" className="block font-medium mb-1">
            Employee
          </label>
          <select
            id="employee_id"
            name="employee_id"
            required
            className="w-full border rounded px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Select an employee
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="start_time" className="block font-medium mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            name="start_time"
            id="start_time"
            required
            value={startTime}
            onChange={handleStartTimeChange}
            className={`w-full border rounded px-3 py-2 ${
              validationError || actionData?.errors?.time_validation
                ? "border-red-500"
                : ""
            }`}
          />
        </div>

        <div>
          <label htmlFor="end_time" className="block font-medium mb-1">
            End Time
          </label>
          <input
            type="datetime-local"
            name="end_time"
            id="end_time"
            required
            value={endTime}
            onChange={handleEndTimeChange}
            className={`w-full border rounded px-3 py-2 ${
              validationError || actionData?.errors?.time_validation
                ? "border-red-500"
                : ""
            }`}
          />
        </div>

        <div>
          <label htmlFor="summary" className="block font-medium mb-1">
            Summary
          </label>
          <textarea
            name="summary"
            id="summary"
            placeholder="Describe the work done during this timesheet period..."
            rows={4}
            className="w-full border rounded px-3 py-2 resize-vertical"
          />
        </div>

        {(validationError || actionData?.errors?.time_validation) && (
          <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded px-3 py-2">
            {validationError || actionData?.errors?.time_validation}
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={
              !!validationError || !!actionData?.errors?.time_validation
            }
            className={`px-4 py-2 rounded cursor-pointer font-medium ${
              validationError || actionData?.errors?.time_validation
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Create Timesheet
          </button>
        </div>
      </Form>
    </div>
  );
}
