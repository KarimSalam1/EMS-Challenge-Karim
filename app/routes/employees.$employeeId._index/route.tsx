import {
  Form,
  useLoaderData,
  redirect,
  useActionData,
  useNavigation,
  type LoaderFunction,
  type ActionFunction,
} from "react-router";
import { getDB } from "~/db/getDB";
import { useState, useEffect } from "react";
import fs from "fs/promises";
import path from "path";

export const loader: LoaderFunction = async ({ params }) => {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [
    params.employeeId,
  ]);

  if (!employee) {
    throw new Response("Employee not found", { status: 404 });
  }

  return { employee };
};

export const action: ActionFunction = async ({ request, params }) => {
  const db = await getDB();
  const formData = await request.formData();
  const intent = formData.get("intent");
  const employeeId = params.employeeId;

  if (intent === "delete") {
    await db.run("DELETE FROM employees WHERE id = ?", employeeId);
    return redirect("/employees");
  }

  if (intent === "update") {
    const photoFile = formData.get("photo_file") as File;
    const docFile = formData.get("doc_file") as File;

    const dateOfBirth = formData.get("date_of_birth") as string;
    const startDate = formData.get("start_date") as string;
    const endDate = formData.get("end_date") as string;

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();

      const isUnder18 =
        age < 18 ||
        (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

      if (isUnder18) {
        return {
          errors: { date_of_birth: "Employee must be at least 18 years old." },
        };
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return {
          errors: {
            date_range: "Start date must be before or equal to end date",
          },
        };
      }
    }

    const existingEmployee = await db.get(
      "SELECT photo_path, document_path FROM employees WHERE id = ?",
      employeeId
    );

    let photo_path = existingEmployee.photo_path;
    let document_path = existingEmployee.document_path;

    try {
      if (photoFile && photoFile.name) {
        const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
        const photoName = `${Date.now()}_${photoFile.name}`;
        const photoDest = path.join("public", "uploads", "photos", photoName);
        await fs.writeFile(photoDest, photoBuffer);
        photo_path = `/uploads/photos/${photoName}`;
      }

      if (docFile && docFile.name) {
        const docBuffer = Buffer.from(await docFile.arrayBuffer());
        const docName = `${Date.now()}_${docFile.name}`;
        const docDest = path.join("public", "uploads", "docs", docName);
        await fs.writeFile(docDest, docBuffer);
        document_path = `/uploads/docs/${docName}`;
      }
    } catch (err) {
      console.error("File upload failed:", err);
      return new Response(
        JSON.stringify({ error: "File upload failed. Please try again." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const updated = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      date_of_birth: formData.get("date_of_birth"),
      job_title: formData.get("job_title"),
      department: formData.get("department"),
      salary: formData.get("salary"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      photo_path,
      document_path,
    };

    await db.run(
      `UPDATE employees SET 
        full_name = ?, email = ?, phone = ?, date_of_birth = ?, 
        job_title = ?, department = ?, salary = ?, start_date = ?, end_date = ?,
        photo_path = ?, document_path = ?
      WHERE id = ?`,
      [...Object.values(updated), employeeId]
    );

    return redirect(`/employees/${employeeId}`);
  }

  return null;
};

export default function EmployeePage() {
  const actionData = useActionData() as {
    error?: string;
    errors?: {
      date_of_birth?: string;
      date_range?: string;
    };
  };
  const navigation = useNavigation();

  const { employee } = useLoaderData() as { employee: any };
  const [editing, setEditing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(employee.photo_path || null);
  const [docName, setDocName] = useState(employee.document_path || null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(employee.photo_path || null);
    }
  }

  function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setDocName(file.name);
    } else {
      setDocName(null);
    }
  }

  useEffect(() => {
    if (editing && navigation.state === "idle" && !actionData?.errors) {
      setEditing(false);
    }
  }, [navigation.state, actionData?.errors]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex gap-4 justify-center mb-10">
        <a
          href="/employees"
          className="border border-blue-700 text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-700 hover:text-white transition"
        >
          Employees
        </a>
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

      {!editing ? (
        <>
          <h1 className="text-3xl font-bold mb-6 text-center">
            Employee Details
          </h1>

          <div className="flex flex-col items-center gap-6 border border-gray-300 rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
            <div className="w-[90px] h-[90px]">
              <img
                src={employee.photo_path || "https://i.imgur.com/gSb4Uy4.png"}
                alt={employee.full_name}
                className="w-full h-full rounded-full object-cover border-2 border-green-500"
              />
            </div>

            <div className="flex flex-col flex-1 justify-between items-center sm:items-start gap-4">
              <div className="flex-1 min-w-[180px] text-left">
                <h2 className="text-lg font-semibold underline text-green-600 mb-1">
                  {employee.full_name}
                </h2>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>
                    <span className="font-bold">Email:</span> {employee.email}
                  </li>
                  <li>
                    <span className="font-bold">Phone:</span> {employee.phone}
                  </li>
                  <li>
                    <span className="font-bold">Date of Birth:</span>{" "}
                    {employee.date_of_birth}
                  </li>
                  <li>
                    <span className="font-bold">Job Title:</span>{" "}
                    {employee.job_title}
                  </li>
                  <li>
                    <span className="font-bold">Department:</span>{" "}
                    {employee.department}
                  </li>
                  <li>
                    <span className="font-bold">Salary:</span> $
                    {employee.salary}
                  </li>
                  <li>
                    <span className="font-bold">Start Date:</span>{" "}
                    {employee.start_date}
                  </li>
                  <li>
                    <span className="font-bold">End Date:</span>{" "}
                    {employee.end_date || "N/A"}
                  </li>
                  <li>
                    <span className="font-bold">Document:</span>{" "}
                    {employee.document_path ? (
                      <a
                        href={employee.document_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View Document
                      </a>
                    ) : (
                      "No Document"
                    )}
                  </li>
                </ul>
              </div>

              <div className="flex flex-row gap-2">
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
                      !confirm("Are you sure you want to delete this employee?")
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="intent" value="delete" />
                  <button
                    type="submit"
                    className="border border-red-600 text-red-600 font-semibold px-3 py-1 rounded hover:bg-red-600 hover:text-white transition cursor-pointer"
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6 text-center">Edit Employee</h1>

          <Form
            method="post"
            className="space-y-4 border border-gray-300 p-6 rounded-lg shadow-sm"
            encType="multipart/form-data"
          >
            <input type="hidden" name="intent" value="update" />
            <div className="flex flex-col items-center mb-8">
              <img
                src={photoPreview || "https://i.imgur.com/gSb4Uy4.png"}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover border-2 border-green-500 mb-2"
              />

              <label
                htmlFor="photo_file"
                className="inline-block cursor-pointer bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded hover:bg-green-200 transition"
              >
                Change Photo
              </label>
              <input
                id="photo_file"
                type="file"
                name="photo_file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <input
                name="full_name"
                type="text"
                defaultValue={employee.full_name || ""}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={employee.email || ""}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <input
                name="phone"
                type="text"
                defaultValue={employee.phone || ""}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Date of Birth</label>
              <input
                name="date_of_birth"
                type="date"
                defaultValue={employee.date_of_birth || ""}
                className={`w-full border rounded px-3 py-2 ${
                  actionData?.errors?.date_of_birth ? "border-red-500" : ""
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Job Title</label>
              <input
                name="job_title"
                type="text"
                defaultValue={employee.job_title || ""}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Department</label>
              <input
                name="department"
                type="text"
                defaultValue={employee.department || ""}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Salary</label>
              <input
                name="salary"
                type="number"
                defaultValue={employee.salary || ""}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                name="start_date"
                type="date"
                defaultValue={employee.start_date || ""}
                className={`w-full border rounded px-3 py-2 ${
                  actionData?.errors?.date_range ? "border-red-500" : ""
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">End Date</label>
              <input
                name="end_date"
                type="date"
                defaultValue={employee.end_date || ""}
                className={`w-full border rounded px-3 py-2 ${
                  actionData?.errors?.date_range ? "border-red-500" : ""
                }`}
              />
            </div>

            <div>
              <label className="mb-1 mr-1 font-medium ">Document: </label>
              {employee.document_path ? (
                <a
                  href={employee.document_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mb-2 inline-block"
                >
                  View Current Document
                </a>
              ) : (
                <p className="text-gray-500 mb-2">No document uploaded</p>
              )}
            </div>

            <label
              htmlFor="doc_file"
              className="inline-block cursor-pointer bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded hover:bg-green-200 transition"
            >
              {docName ? "Change Document" : "Upload Document"}
            </label>
            <input
              id="doc_file"
              type="file"
              name="doc_file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleDocChange}
            />
            {(actionData?.errors?.date_of_birth ||
              actionData?.errors?.date_range) && (
              <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded px-3 py-2">
                {actionData?.errors?.date_of_birth ||
                  actionData?.errors?.date_range}
              </div>
            )}

            <div className="flex gap-4 mt-6 justify-center">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer "
              >
                Save Changes
              </button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
}
