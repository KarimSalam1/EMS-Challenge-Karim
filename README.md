# Employee Management System (EMS)

A comprehensive employee management system built with React Router v7, featuring employee data management and timesheet tracking capabilities.

## 🚀 Features

### Employee Management

- **Create & Update Employees**: Complete CRUD operations for employee records
- **Comprehensive Employee Profiles**: Personal and professional information management
- **Employee Photo Upload**: Profile pictures with file system storage
- **Document Management**: User can upload their CV with file system storage
- **Form Validation**: Required fields, email/phone validation, and compliance checks
- **Search & Filter**: Find employees quickly with advanced filtering options
- **Pagination**: Organize large employee lists efficiently

### Timesheet Management

- **Time Tracking**: Create and manage employee timesheets
- **Calendar View**: Visual timesheet display using Schedule-X calendar component
- **Table View**: Traditional list view with sorting and filtering
- **Employee Assignment**: Link timesheets to specific employees
- **Time Validation**: Ensures logical start/end time relationships
- **Work Summaries**: Optional descriptions for timesheet entries

## 🛠️ Tech Stack

- **Frontend**: React 19 with React Router v7
- **Backend**: React Router loader and action functions
- **Database**: SQLite with custom schema
- **Styling**: Tailwind CSS
- **Calendar**: Schedule-X component library
- **File Storage**: Local file system for uploads

## 📋 Requirements Implemented

### Core Requirements (13/13) ✅

1. ✅ Personal employee fields (name, email, phone, DOB)
2. ✅ Professional fields (job title, department, salary, dates)
3. ✅ Form validation (required fields, email/phone validation)
4. ✅ Navigation between views
5. ✅ Employee list with individual employee links
6. ✅ Relevant columns display (max 5)
7. ✅ Navigation to new employee and timesheets
8. ✅ Timesheet start/end time fields
9. ✅ Employee dropdown selection
10. ✅ Timesheet navigation buttons
11. ✅ Calendar view with Schedule-X
12. ✅ Table view for timesheets
13. ✅ Toggle between calendar and table views

### Bonus Features (12/12) ✅

1. ✅ Employee photo upload and storage
2. ✅ Document upload (CV)
3. ✅ Compliance validation (age)
4. ✅ Additional relevant fields
5. ✅ Employee search functionality
6. ✅ Multi-field sorting
7. ✅ Advanced filtering options
8. ✅ Pagination for large datasets
9. ✅ Time validation (start before end)
10. ✅ Work summary text field
11. ✅ Timesheet search functionality
12. ✅ Filter timesheets by employee
13. Extra: ✅ Added simple UI implemented with tailwind (from another project I did)

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/KarimSalam1/EMS-Challenge-Karim.git
   cd EMS-Challenge-Karim
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   npm run setup_db
   ```

4. **Seed the database with sample data**

   ```bash
   npm run seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Visit the application**
   ```
   http://localhost:5173
   ```

### Production Build

To build and run the application in production mode:

```bash
npm run start
```

## 📁 Project Structure

```
├── app/
│   ├── routes/                 # React Router routes
│   │   ├── employees._index    # Employee list view
│   │   ├── employees.$employeeId._index  # Single employee view
│   │   ├── employees.new       # New employee form
│   │   ├── timesheets._index   # Timesheet list/calendar view
│   │   ├── timesheets.$timesheetId._index  # Single timesheet view
│   │   └── timesheets.new      # New timesheet form
│   ├── db/
│   │   └── setup.sql          # Database schema
│   │   └── getDB.ts          # Database Fetching
├── scripts/
│   ├── setup_db.js            # Database initialization
│   └── seed.js                # Sample data seeding
└── public/
    └── uploads/               # File upload storage
```

## 🗃️ Database Schema

### Employees Table

- Personal information (name, email, phone, DOB)
- Professional details (job title, department, salary)
- Employment dates (start/end dates)
- File paths (photo, documents)

### Timesheets Table

- Time tracking (start/end times)
- Employee association
- Work descriptions
- Timestamps

## 🎯 Key Features Breakdown

### Employee Management

- **Form Validation**: Comprehensive validation including age restrictions, salary minimums, and required document uploads
- **File Upload**: Secure file handling for photos and documents with organized storage
- **Search & Filter**: Real-time search with multiple filter criteria
- **Responsive Design**: Mobile-friendly interface with intuitive navigation

### Timesheet System

- **Dual View Modes**: Switch between calendar and table views
- **Time Validation**: Prevents invalid time entries
- **Employee Integration**: Seamlessly connects with employee records
- **Visual Calendar**: Interactive calendar interface using Schedule-X

## 🚀 Deployment

The application is **deployed on Render**:  
🔗 [https://ems-challenge-karim-1.onrender.com]

If you wish to deploy your own instance, it's configured for easy deployment to platforms like **Render**, **Vercel**, or **Heroku**:

- **Build Command**:
  ```bash
  npm run deploy
  npm start
  ```

## 🙏 Acknowledgments

- Schedule-X calendar component
- React Router v7 framework
- Tailwind CSS for styling

---

**Note**: This application was built as part of a technical challenge to demonstrate full-stack development capabilities with modern React patterns and database integration.

```

```
