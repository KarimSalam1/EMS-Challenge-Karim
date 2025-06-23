import {
  Form,
  useLoaderData,
  redirect,
  useNavigation,
  useActionData,
  type LoaderFunction,
  type ActionFunction,
} from "react-router";
import { useState, useEffect } from "react";
import { getDB } from "~/db/getDB";

export const loader: LoaderFunction = async ({ params }) => {
  const db = await getDB();
  const timesheet = await db.get(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id
     FROM timesheets
     JOIN employees ON timesheets.employee_id = employees.id
     WHERE timesheets.id = ?`,
    [params.timesheetId]
  );

  if (!timesheet) {
    throw new Response("Timesheet not found", { status: 404 });
  }

  const employees = await db.all(`SELECT id, full_name FROM employees`);

  return { timesheet, employees };
};

export const action: ActionFunction = async ({ request, params }) => {
  const db = await getDB();
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = params.timesheetId;

  if (intent === "delete") {
    await db.run("DELETE FROM timesheets WHERE id = ?", id);
    return redirect("/timesheets");
  }

  if (intent === "update") {
    const employee_id = formData.get("employee_id");
    const start_time_raw = formData.get("start_time") as string;
    const end_time_raw = formData.get("end_time") as string;

    if (start_time_raw && end_time_raw) {
      const startDate = new Date(start_time_raw);
      const endDate = new Date(end_time_raw);

      if (startDate >= endDate) {
        return {
          errors: { time_validation: "Start time must be before end time" },
        };
      }
    }

    const start_time = start_time_raw?.replace("T", " ") + ":00";
    const end_time = end_time_raw?.replace("T", " ") + ":00";
    await db.run(
      "UPDATE timesheets SET employee_id = ?, start_time = ?, end_time = ? WHERE id = ?",
      [employee_id, start_time, end_time, id]
    );

    return redirect(`/timesheets/${id}`);
  }

  return new Response("Invalid intent", { status: 400 });
};

export default function TimesheetPage() {
  const { timesheet, employees } = useLoaderData() as {
    timesheet: any;
    employees: { id: number; full_name: string }[];
  };
  const actionData = useActionData() as {
    errors?: { time_validation?: string };
  };
  const [editing, setEditing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (editing && navigation.state === "idle" && !actionData?.errors) {
      setEditing(false);
    }
  }, [navigation.state, actionData?.errors]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-center gap-4 mb-8">
        <a
          href="/timesheets"
          className="border border-green-700 text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-700 hover:text-white transition cursor-pointer"
        >
          Timesheets
        </a>
        <a
          href="/employees"
          className="border border-gray-700 text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-700 hover:text-white transition cursor-pointer"
        >
          Employees
        </a>
      </div>

      {!editing ? (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">
            Timesheet #{timesheet.id}
          </h1>
          <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm bg-white space-y-3">
            <p>
              <strong>Employee:</strong> {timesheet.full_name} (ID:{" "}
              {timesheet.employee_id})
            </p>
            <p>
              <strong>Start Time:</strong> {timesheet.start_time}
            </p>
            <p>
              <strong>End Time:</strong> {timesheet.end_time}
            </p>

            <div className=" flex flex-row gap-2  mt-6">
              <button
                onClick={() => setEditing(true)}
                className="border border-green-700 text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-700 hover:text-white transition cursor-pointer"
              >
                Edit
              </button>
              <Form
                method="post"
                onSubmit={(e) => {
                  if (
                    !confirm("Are you sure you want to delete this timesheet?")
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="intent" value="delete" />
                <button
                  type="submit"
                  className="border border-red-700 text-red-700 font-semibold px-3 py-1 rounded hover:bg-red-700 hover:text-white transition cursor-pointer"
                >
                  Delete
                </button>
              </Form>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">
            Edit Timesheet
          </h1>
          <Form
            method="post"
            className="space-y-4 border p-6 rounded-lg shadow-sm bg-white"
          >
            <input type="hidden" name="intent" value="update" />

            <label className="block font-medium">Employee</label>
            <select
              name="employee_id"
              defaultValue={timesheet.employee_id}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} (ID: {emp.id})
                </option>
              ))}
            </select>

            <label className="block font-medium">Start Time</label>
            <input
              name="start_time"
              type="datetime-local"
              defaultValue={timesheet.start_time.replace(" ", "T").slice(0, 16)}
              required
              className={`w-full border px-3 py-2 rounded ${
                actionData?.errors?.time_validation ? "border-red-500" : ""
              }`}
            />

            <label className="block font-medium">End Time</label>
            <input
              name="end_time"
              type="datetime-local"
              defaultValue={timesheet.end_time.replace(" ", "T").slice(0, 16)}
              required
              className={`w-full border px-3 py-2 rounded ${
                actionData?.errors?.time_validation ? "border-red-500" : ""
              }`}
            />
            {actionData?.errors?.time_validation && (
              <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded px-3 py-2">
                {actionData.errors.time_validation}
              </div>
            )}

            <div className="flex justify-center gap-4 mt-6">
              <button
                type="submit"
                className="border border-green-700 text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-700 hover:text-white transition cursor-pointer"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="border border-gray-700 text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-700 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
}
