# SmartAttend Backend – Testing Documentation

This document describes the testing process followed to validate the SmartAttend HR Management System backend APIs.

## Tech Stack

Backend technologies used:

- Node.js
- Express.js
- MongoDB
- Swagger UI (API documentation and testing)

All APIs were first tested using Swagger UI and then validated through structured testing scenarios.

---

# 1. API Testing Using Swagger UI

Swagger UI was used to test and verify all REST API endpoints.

## Steps

1. Start the backend server


npm start


2. Open Swagger UI in the browser


http://localhost:5001/api-docs


3. Click **Authorize** and provide the JWT token.

4. Use the **Try it out** button to test API endpoints.

---

# 2. Attendance API Testing

## Test Case 1 – Create Attendance Record

Endpoint:


POST /api/attendance/punch-in


Expected Result:

- Attendance record should be created successfully
- HTTP Status Code: **201**

Result: **Passed**

---

## Test Case 2 – Duplicate Attendance

Scenario:

Attempt to punch in twice on the same day.

Endpoint:


POST /api/attendance/punch-in


Expected Result:

- System should prevent duplicate entry
- HTTP Status Code: **400**

Result: **Passed**

---

# 3. Leave Management Testing

## Test Case 3 – Apply Leave

Endpoint:


POST /api/leaves/apply


Example Request Body:

```json
{
  "leave_type": "Sick",
  "start_date": "2026-03-05",
  "end_date": "2026-03-06",
  "total_days": 2,
  "reason": "Fever"
}

Expected Result:

Leave request should be created

Status should be Pending

Result: Passed

Test Case 4 – Apply Leave with Insufficient Balance

Scenario:

Apply leave exceeding available leave balance.

Expected Result:

Leave request should be rejected

HTTP Status Code: 400

Result: Passed

Test Case 5 – Approve Leave

Endpoint:

PUT /api/leaves/{id}/approve

Expected Result:

Leave status should change to Approved

Attendance should be updated automatically

Result: Passed

4. Salary Report Verification

Endpoint:

GET /api/reports/salary

Expected Result:

Salary calculation should be accurate

Response should contain correct salary details

Result: Passed

5. End-to-End Workflow Testing

The entire system workflow was tested to ensure all modules work together correctly.

Workflow tested:

Seed Employees
      ↓
Mark Attendance
      ↓
Apply Leave
      ↓
Approve Leave
      ↓
Generate Salary Report

Result: Passed

6. Stress Testing

To validate the system performance, multiple attendance records were generated.

Test scenario:

Generate 500+ attendance records

Verify that reports and calculations remain accurate.

Result:

System handled large dataset successfully.

7. Security Testing

The following security scenarios were tested:

Access protected APIs without JWT token → 401 Unauthorized

Non-admin attempting leave approval → 403 Forbidden

Invalid login credentials → 401 Unauthorized

Result: Passed

8. Conclusion

All major APIs were tested successfully, including:

Authentication APIs

Attendance APIs

Leave Management APIs

Salary Report APIs

Swagger UI was used for interactive API testing and validation of request and response structures.