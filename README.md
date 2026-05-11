# Employee Attendance Management System

A full‑stack **Employee Attendance Management System** built to manage employee authentication, attendance tracking, leave requests, salary calculation, and administrative monitoring.

The system provides a centralized platform where employees can securely access their dashboard, mark attendance using punch‑in and punch‑out functionality, apply for leave, and view salary information. Administrators can manage employee data, monitor attendance records, and maintain organizational workflow efficiently.

---

# System Architecture

The application follows a **3‑Tier Architecture** to ensure clean separation between interface, logic, and data layers.

## Presentation Layer (Frontend)

Responsible for user interaction and UI rendering.

Features:
- Employee Dashboard
- Login & Registration Interface
- Attendance Management
- Leave Request Interface
- Admin Dashboard

Technologies:

HTML5  
CSS3  
JavaScript  

---

## Application Layer (Backend)

Handles business logic and API processing.

Responsibilities include:

- User authentication
- Attendance tracking logic
- Leave management
- Salary calculation
- API request validation
- Admin operations

Technologies:

Node.js  
Express.js  

---

## Data Layer (Database)

Responsible for persistent data storage.

Data stored includes:

- Employee records
- Attendance logs
- Leave history
- Authentication data
- Salary information

Technology:

MongoDB

---

# 🧠 ER Diagram

The database structure of the system is defined using an **Entity Relationship Diagram (ERD)** which models the relationships between employees, attendance records, leave requests, and salary data.

![ER Diagram](https://github.com/user-attachments/assets/3e3fde00-7e88-4089-b42b-9bac882d8bc0)

---

# 🛠 Technology Stack

| Category | Technologies |
|----------|-------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JSON Web Token (JWT) |
| API Communication | REST APIs, JSON |
| Version Control | Git, GitHub |
| API Testing | Swagger |
| Deployment | Render |

---

# Key Features

### Employee Authentication
Secure login and registration system allowing employees and administrators to access the system.

### Attendance Tracking
Employees can mark daily attendance using **Punch In** and **Punch Out** functionality.

### Leave Management
Employees can apply for leave and view leave history.

### Salary Calculation
Automated salary calculation based on attendance records.

### Employee Dashboard
Employees can view attendance, leave history, and system information.

### Admin Dashboard
Administrators can monitor employee records and attendance activities.

---

# User Interface

### Register Page
![Register Page](https://github.com/user-attachments/assets/c6a5dc93-aa67-48d6-b50b-de6b892d2ac6)

### Login Page
![Login Page](https://github.com/user-attachments/assets/ee20ae3f-d3ec-462a-acb3-4bdf53c8bd65)

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/f3c3fd1b-8478-470b-b168-7648d9551cff)

### Attendance Page
![Attendance](https://github.com/user-attachments/assets/d646f5b5-5872-4944-88c3-ed820954a83e)

### Leave Management
![Leave](https://github.com/user-attachments/assets/ffbc0c8d-3e3f-45d5-a443-7d81c7d36ebb)

### Salary Module
![Salary](https://github.com/user-attachments/assets/7197a19d-c665-457c-9e9e-0225dcce97c2)

### Profile Page
![Profile](https://github.com/user-attachments/assets/203e82a8-244f-45f9-b752-9c7a540b268d)

### Admin Dashboard
![Admin Dashboard](https://github.com/user-attachments/assets/4c439151-6848-4ce5-94a5-34d9699a31ce)

---

# 📂 Project Structure

```
SmartAttend/
│
├── backend
│   │
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   │   ├── attendance.controller.js
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   └── leaveRequest.controller.js
│   │
│   ├── middleware
│   │   └── auth_middleware.js
│   │
│   ├── models
│   │   ├── attendance.js
│   │   ├── employee.js
│   │   ├── leaveRequest.js
│   │   ├── leaveType.js
│   │   └── user.js
│   │
│   ├── routes
│   │   ├── attendance.routes.js
│   │   ├── auth.routes.js
│   │   ├── dashboard.js
│   │   ├── employee.routes.js
│   │   ├── leave.routes.js
│   │   ├── leaveType.routes.js
│   │   └── reports.js
│   │
│   ├── server.js
│   ├── swagger.js
│   ├── seed.js
│   └── package.json
│
├── frontend
│   │
│   ├── admin
│   │   ├── add-employee.html
│   │   ├── attendance.html
│   │   ├── dashboard.html
│   │   ├── employees.html
│   │   ├── leaves.html
│   │   ├── reports.html
│   │   └── salary.html
│   │
│   ├── css
│   │   └── style.css
│   │
│   ├── employee
│   │   ├── attendance.html
│   │   ├── dashboard.html
│   │   ├── leave.html
│   │   ├── profile.html
│   │   └── salary.html
│   │
│   ├── js
│   │   ├── admin-sidebar.js
│   │   ├── api.js
│   │   └── employee-sidebar.js
│   │
│   ├── index.html
│   ├── login.html
│   └── register.html
│
└── README.md
```

---

# Development Progress

### Day 1
- Designed ER Diagram for database schema
- Configured MongoDB database
- Implemented frontend navigation
- Configured backend CORS
- Created GitHub repository and collaborator access

### Day 2
- Implemented backend routing structure
- Developed authentication modules
- Designed UI components (Navbar, Sidebar, Clock)
- Established frontend layout structure
- Tested APIs using Thunder Client

### Day 3
- Integrated frontend with backend APIs
- Implemented Login and Register APIs
- Connected dashboard with database records
- Implemented Punch In and Punch Out functionality
- Initial admin panel setup

### Day 4
- Implemented salary calculation module
- Implemented leave history functionality
- Developed admin employee APIs
- Integrated frontend with backend modules

### Day 5
- Improved authentication validation
- Optimized dashboard API performance
- Enhanced UI experience
- Implemented role‑based access
- Conducted end‑to‑end integration testing

---

# Team Members

Shreeman Kumar  
Bini Choudhury  
Biswaranjan  
Rashmi  

---

# Future Improvements

- Notification system for attendance and leave
- Mobile responsive UI
- Advanced reporting dashboard
- Performance optimization
- Enhanced admin analytics

---

# License

This project was developed for academic and internship development purposes.
