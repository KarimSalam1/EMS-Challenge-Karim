import {
  Form,
  redirect,
  useActionData,
  type ActionFunction,
} from "react-router";
import { getDB } from "~/db/getDB";
import fs from "fs/promises";
import path from "path";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const dateOfBirth = formData.get("date_of_birth") as string;
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

  const photoFile = formData.get("photo_file") as File;
  const docFile = formData.get("doc_file") as File;

  let photo_path = null;
  let document_path = null;

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

  const employeeData = {
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

  const requiredFields = [
    "full_name",
    "email",
    "phone",
    "date_of_birth",
    "job_title",
    "department",
    "salary",
    "start_date",
  ];

  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

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

  const missingFields = requiredFields.filter((field) => {
    const value = formData.get(field);
    return !value || value.toString().trim() === "";
  });

  if (missingFields.length > 0) {
    return new Response(
      `Missing required fields: ${missingFields.join(", ")}`,
      {
        status: 400,
      }
    );
  }

  const db = await getDB();

  await db.run(
    `INSERT INTO employees (
      full_name, email, phone, date_of_birth,
      job_title, department, salary, start_date, end_date,
      photo_path, document_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    Object.values(employeeData)
  );

  return redirect("/employees");
};

export default function NewEmployeePage() {
  const actionData = useActionData() as {
    errors?: { date_of_birth?: string; date_range?: string };
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
        Create New Employee
      </h1>

      <Form method="post" encType="multipart/form-data" className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input
            name="full_name"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            required
            className={`w-full border rounded px-3 py-2 ${
              actionData?.errors?.date_of_birth ? "border-red-500" : ""
            }`}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Job Title</label>
          <input
            name="job_title"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Department</label>
          <input
            name="department"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Salary</label>
          <input
            type="number"
            name="salary"
            min="0"
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="start_date"
            required
            className={`w-full border rounded px-3 py-2 ${
              actionData?.errors?.date_range ? "border-red-500" : ""
            }`}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Date</label>
          <input
            type="date"
            name="end_date"
            className={`w-full border rounded px-3 py-2 ${
              actionData?.errors?.date_range ? "border-red-500" : ""
            }`}
          />
          {actionData?.errors?.date_range && (
            <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded px-3 py-2">
              {actionData.errors.date_range}
            </p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Photo (optional)</label>
          <label
            htmlFor="photo_file"
            className="inline-block cursor-pointer bg-blue-100 text-blue-700 border border-blue-300 px-4 py-2 rounded hover:bg-blue-200 transition"
          >
            Upload Photo
          </label>
          <input
            id="photo_file"
            type="file"
            name="photo_file"
            accept="image/*"
            className="hidden"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Document (optional)</label>
          <label
            htmlFor="doc_file"
            className="inline-block cursor-pointer bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded hover:bg-green-200 transition"
          >
            Upload Document
          </label>
          <input
            id="doc_file"
            type="file"
            name="doc_file"
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
        </div>
        {actionData?.errors?.date_of_birth && (
          <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded px-3 py-2">
            {actionData.errors.date_of_birth}
          </p>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            Create Employee
          </button>
        </div>
      </Form>
    </div>
  );
}
