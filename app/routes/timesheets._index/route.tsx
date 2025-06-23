import {
  useLoaderData,
  Form,
  redirect,
  type ActionFunction,
} from "react-router";
import { useState, useEffect } from "react";
import { getDB } from "~/db/getDB";

import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
  createViewMonthAgenda,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "@schedule-x/theme-default/dist/index.css";

export async function loader() {
  const db = await getDB();
  const timesheetsAndEmployees = await db.all(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id
     FROM timesheets
     JOIN employees ON timesheets.employee_id = employees.id`
  );

  return { timesheetsAndEmployees };
}
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id");

  const db = await getDB();

  if (intent === "delete") {
    await db.run("DELETE FROM timesheets WHERE id = ?", id);
    return redirect("/timesheets");
  }

  if (intent === "edit") {
    const employee_id = formData.get("employee_id");
    const summary = formData.get("summary");

    const start_time =
      (formData.get("start_time") as string)?.replace("T", " ") + ":00";
    const end_time =
      (formData.get("end_time") as string)?.replace("T", " ") + ":00";

    await db.run(
      "UPDATE timesheets SET employee_id = ?, start_time = ?, end_time = ?, summary = ? WHERE id = ?",
      [employee_id, start_time, end_time, summary, id]
    );

    return redirect("/timesheets");
  }

  return new Response("Invalid intent", { status: 400 });
};

export default function TimesheetsPage() {
  const { timesheetsAndEmployees } = useLoaderData() as {
    timesheetsAndEmployees: any[];
  };

  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const filteredTimesheets = timesheetsAndEmployees.filter((timesheet) => {
    const employeeMatch = employeeFilter
      ? timesheet.full_name === employeeFilter
      : true;

    return employeeMatch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTimesheets.length / itemsPerPage)
  );

  const paginatedTimesheets = filteredTimesheets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [employeeFilter]);

  const formatTime = (timeStr: string) => {
    return timeStr.split(":").slice(0, 2).join(":");
  };

  const filteredEvents = filteredTimesheets.map((timesheet) => ({
    id: timesheet.id.toString(),
    title: `${timesheet.full_name} - ${timesheet.summary || "No summary"}`,
    start: formatTime(timesheet.start_time),
    end: formatTime(timesheet.end_time),
  }));

  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: [],
    plugins: [eventsService],
  });

  useEffect(() => {
    const existingEvents = eventsService.getAll();
    existingEvents.forEach((event) => {
      eventsService.remove(event.id);
    });

    filteredEvents.forEach((event) => {
      eventsService.add(event);
    });
  }, [eventsService, filteredEvents]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-12">
        <div className="flex gap-4">
          <a
            href="/timesheets/new"
            className="border border-green-700 text-green-700 font-semibold px-3 py-1 rounded hover:bg-green-700 hover:text-white transition cursor-pointer"
          >
            New Timesheet
          </a>
          <a
            href="/employees"
            className="border border-gray-700 text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-700 hover:text-white transition cursor-pointer"
          >
            Employees
          </a>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded border font-semibold transition cursor-pointer ${
              viewMode === "table"
                ? "bg-green-700 text-white border-green-700"
                : "border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded border font-semibold transition cursor-pointer ${
              viewMode === "calendar"
                ? "bg-gray-700 text-white border-gray-700"
                : "border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Calendar View
          </button>

          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Employees</option>
            {[...new Set(timesheetsAndEmployees.map((e) => e.full_name))]
              .filter(Boolean)
              .sort()
              .map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
          </select>
        </div>
      </header>

      {viewMode === "calendar" ? (
        <div className="w-full h-full max-w-full">
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {paginatedTimesheets.length === 0 ? (
              <p className="text-center text-gray-500">No timesheets found.</p>
            ) : (
              paginatedTimesheets.map((timesheet) => (
                <div
                  key={timesheet.id}
                  className="employee-card justify-between"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Timesheet #{timesheet.id}
                  </h2>
                  <ul className="text-gray-700 space-y-1">
                    <li>
                      <span className="font-bold">Employee: </span>
                      {timesheet.full_name} (ID: {timesheet.employee_id})
                    </li>
                    <li>
                      <span className="font-bold">Start Time: </span>
                      {timesheet.start_time}
                    </li>
                    <li>
                      <span className="font-bold">End Time: </span>
                      {timesheet.end_time}
                    </li>
                    <li>
                      <span className="font-bold">Summary: </span>
                      {timesheet.summary || "No summary provided"}
                    </li>
                  </ul>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <a
                      href={`/timesheets/${timesheet.id}`}
                      className="border border-blue-700 text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-700 hover:text-white transition"
                    >
                      View Timesheet
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

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
        </>
      )}
    </div>
  );
}
