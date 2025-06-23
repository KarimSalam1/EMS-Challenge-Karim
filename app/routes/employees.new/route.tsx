import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  type ActionFunction,
} from "react-router";
import { getDB } from "~/db/getDB";
import fs from "fs/promises";
import path from "path";
import { uploadToImgur, uploadToCatbox } from "~/utils/hybridUpload";
import { LoadingSpinner } from "~/utils/loading";

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
    if (process.env.NODE_ENV === "production") {
      try {
        photo_path = await uploadToImgur(photoFile);
      } catch (err) {
        console.error("Photo upload error:", err);
        return {
          errors: {
            photo_file: "Failed to upload photo to UploadThing.",
          },
        };
      }
    } else {
      const photoBuffer = Buffer.from(await photoFile.arrayBuffer());
      const devPhotoDir = path.join("public", "uploads", "photos");
      await fs.mkdir(devPhotoDir, { recursive: true });
      const photoName = `${Date.now()}_${photoFile.name}`;
      const photoDest = path.join(devPhotoDir, photoName);
      await fs.writeFile(photoDest, photoBuffer);
      photo_path = `/uploads/photos/${photoName}`;
    }
  }

  if (docFile && docFile.name) {
    if (docFile && docFile.name) {
      if (process.env.NODE_ENV === "production") {
        try {
          document_path = await uploadToCatbox(docFile);
        } catch (error) {
          console.error("Document upload error:", error);
          return { errors: { doc_file: "Failed to upload document." } };
        }
      }
    } else {
      const docBuffer = Buffer.from(await docFile.arrayBuffer());
      const devDocDir = path.join("public", "uploads", "docs");
      await fs.mkdir(devDocDir, { recursive: true });
      const docName = `${Date.now()}_${docFile.name}`;
      const docDest = path.join(devDocDir, docName);
      await fs.writeFile(docDest, docBuffer);
      document_path = `/uploads/docs/${docName}`;
    }
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
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  console.log("Running in", process.env.NODE_ENV, "mode");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {isSubmitting && <LoadingSpinner />}

      <div className="flex gap-4 justify-center mb-10">
        <a
          href="/"
          className="border border-black text-black font-semibold px-3 py-1 rounded hover:bg-black hover:text-white transition"
        >
          Home
        </a>
        <a
          href="/employees"
          className="border border-blue-700 text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-700 hover:text-white transition"
        >
          Employees
        </a>
        <a
          href="/timesheets"
          className="border border-gray-700 text-gray-700 font-semibold px-3 py-1 rounded hover:bg-gray-700 hover:text-white transition"
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
            disabled={isSubmitting}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            disabled={isSubmitting}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            required
            disabled={isSubmitting}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            required
            disabled={isSubmitting}
            className={`w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              actionData?.errors?.date_of_birth ? "border-red-500" : ""
            }`}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Job Title</label>
          <input
            name="job_title"
            required
            disabled={isSubmitting}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Department</label>
          <input
            name="department"
            required
            disabled={isSubmitting}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Salary</label>
          <input
            type="number"
            name="salary"
            min="0"
            required
            disabled={isSubmitting}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="start_date"
            required
            disabled={isSubmitting}
            className={`w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              actionData?.errors?.date_range ? "border-red-500" : ""
            }`}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Date</label>
          <input
            type="date"
            name="end_date"
            disabled={isSubmitting}
            className={`w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
            className={`inline-block cursor-pointer bg-blue-100 text-blue-700 border border-blue-300 px-4 py-2 rounded hover:bg-blue-200 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Upload Photo
          </label>
          <input
            id="photo_file"
            type="file"
            name="photo_file"
            accept="image/*"
            disabled={isSubmitting}
            className="hidden"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Document (optional)</label>
          <label
            htmlFor="doc_file"
            className={`inline-block cursor-pointer bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded hover:bg-green-200 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Upload Document
          </label>
          <input
            id="doc_file"
            type="file"
            name="doc_file"
            accept=".pdf,.doc,.docx"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center cursor-pointer"
          >
            Create Employee
          </button>
        </div>
      </Form>
    </div>
  );
}
