import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, "../database.yaml");
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, "utf8"));

const { sqlite_path: sqlitePath } = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    full_name: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    date_of_birth: "1990-01-01",
    job_title: "Software Engineer",
    department: "Engineering",
    salary: 6000,
    start_date: "2020-01-01",
    end_date: null,
    photo_path: "/uploads/photos/john.jpg",
    document_path: "/uploads/docs/john_cv.pdf",
  },
  {
    full_name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "9876543210",
    date_of_birth: "1992-03-15",
    job_title: "Product Manager",
    department: "Product",
    salary: 7500,
    start_date: "2019-06-10",
    end_date: null,
    photo_path: "/uploads/photos/jane.jpg",
    document_path: "/uploads/docs/jane_cv.pdf",
  },
  {
    full_name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "1234567890",
    date_of_birth: "1988-11-25",
    job_title: "Designer",
    department: "Design",
    salary: 5000,
    start_date: "2021-04-20",
    end_date: null,
    photo_path: "/uploads/photos/alice.jpg",
    document_path: "/uploads/docs/alice_cv.pdf",
  },
  {
    full_name: "Brayden Watkins",
    email: "brayden.watkins@example.com",
    phone: "1234567890",
    date_of_birth: "1988-11-25",
    job_title: "Software Engineer",
    department: "Engineering",
    salary: 7000,
    start_date: "2021-06-20",
    end_date: null,
    photo_path: "/uploads/photos/brayden.jpg",
    document_path: "/uploads/docs/brayden_cv.pdf",
  },
  {
    full_name: "Leta Nelson",
    email: "leta.nelson@example.com",
    phone: "1234567890",
    date_of_birth: "1998-11-25",
    job_title: "Product Manager",
    department: "Product",
    salary: 4000,
    start_date: "2021-05-20",
    end_date: null,
    photo_path: "/uploads/photos/leta.jpg",
    document_path: "/uploads/docs/leta_cv.pdf",
  },
  {
    full_name: "Scott George",
    email: "scott.george@example.com",
    phone: "1234567890",
    date_of_birth: "1988-12-25",
    job_title: "Product Manager",
    department: "Product",
    salary: 8000,
    start_date: "2021-05-20",
    end_date: null,
    photo_path: "/uploads/photos/scott.jpg",
    document_path: "/uploads/docs/scott_cv.pdf",
  },
];

const timesheets = [
  {
    employee_id: 1,
    start_time: "2025-06-23 08:00:00",
    end_time: "2025-06-23 17:00:00",
    summary: "Worked on user authentication system and fixed login bugs",
  },
  {
    employee_id: 2,
    start_time: "2025-06-23 17:00:00",
    end_time: "2025-06-23 22:00:00",
    summary: "Product roadmap planning and stakeholder meetings",
  },
  {
    employee_id: 3,
    start_time: "2025-06-24 08:00:00",
    end_time: "2025-06-24 17:00:00",
    summary: "UI/UX design for new dashboard components",
  },
  {
    employee_id: 4,
    start_time: "2025-06-24 17:00:00",
    end_time: "2025-06-24 22:00:00",
    summary: "Code review and database optimization tasks",
  },
  {
    employee_id: 5,
    start_time: "2025-06-25 08:00:00",
    end_time: "2025-06-25 17:00:00",
    summary: "Market research and competitive analysis",
  },
  {
    employee_id: 6,
    start_time: "2025-06-25 17:00:00",
    end_time: "2025-06-25 22:00:00",
    summary: "Team management and sprint planning activities",
  },
];

const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(", ");
  const placeholders = Object.keys(data[0])
    .map(() => "?")
    .join(", ");

  const insertStmt = db.prepare(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
  );

  data.forEach((row) => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  insertData("employees", employees);
  insertData("timesheets", timesheets);
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Database seeded successfully.");
  }
});
