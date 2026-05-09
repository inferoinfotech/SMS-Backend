# Postman API Collection Structure (Implemented APIs)

This document lists the **exact endpoints** and **example JSON bodies** for testing your backend.

## Environment Variables
- `baseURL`: `http://localhost:5000`
- `token`: (Automatically updated after login)

---

## Folder Structure

### 1. Authentication (`/auth`)
- `POST` **Signup**: `{{baseURL}}/api/auth/signup`
  ```json
  {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "country": "India",
    "city": "Surat",
    "state": "Gujarat",
    "selectSociety": "65f... (ID)",
    "password": "password123",
    "confirmPassword": "password123",
    "privacyPolicy": true
  }
  ```
- `POST` **Login**: `{{baseURL}}/api/auth/login`
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `GET` **Get Profile**: `{{baseURL}}/api/auth/profile`
- `POST` **Forget Password**: `{{baseURL}}/api/auth/forget-password`
  ```json
  {
    "email": "john@example.com"
  }
  ```
- `POST` **Verify OTP**: `{{baseURL}}/api/auth/verify-otp`
  ```json
  {
    "email": "john@example.com",
    "otp": "123456"
  }
  ```
- `POST` **Reset Password**: `{{baseURL}}/api/auth/reset-password`
  ```json
  {
    "email": "john@example.com",
    "otp": "123456",
    "password": "newpassword123",
    "confirmPassword": "newpassword123"
  }
  ```

### 2. Society Management (`/society`)
- `POST` **Create Society**: `{{baseURL}}/api/society/create`
  ```json
  {
    "societyName": "Gokuldham",
    "societyAddress": "Powai, Mumbai",
    "country": "India",
    "state": "Maharashtra",
    "city": "Mumbai",
    "zipCode": "400076"
  }
  ```
- `GET` **Get All Societies**: `{{baseURL}}/api/society/get`

### 3. Resident Management (`/resident`)
- `POST` **Create Resident**: `{{baseURL}}/api/resident/create`
  ```json
  {
    "name": "Amit Shah",
    "email": "amit@example.com",
    "phoneNumber": "9876543210",
    "wing": "A",
    "unit": "101",
    "unitStatus": "Occupied",
    "residentStatus": "Owner",
    "society": "65f... (ID)",
    "gender": "male",
    "age": 35,
    "address": "123, Skyline Apartments, Surat",
    "relation": "Self"
  }
  ```
- `GET` **Get All Residents**: `{{baseURL}}/api/resident/get`

### 4. Maintenance (`/maintenance`)
- `POST` **Maintenance Setup**: `{{baseURL}}/api/maintenance/maintenance-setup`
  ```json
  {
    "password": "admin_password",
    "maintenanceAmount": 2000,
    "penaltyAmount": 100,
    "maintenanceDueDate": "2024-05-15",
    "penaltyAppliedAfterDay": 5,
    "society": "65f... (ID)"
  }
  ```
- `POST` **Create Maintenance Record**: `{{baseURL}}/api/maintenance/`
  ```json
  {
    "resident": "65f... (ID)",
    "maintenanceSetup": "65f... (ID)",
    "date": "2024-05-01",
    "amount": 2000,
    "penalty": 0,
    "payment": "Cash",
    "status": "Pending"
  }
  ```
- `GET` **Get Maintenance Records**: `{{baseURL}}/api/maintenance/`

### 5. Financials
#### Income (`/income`)
- `POST` **Add Income**: `{{baseURL}}/api/income/add-income`
  ```json
  {
    "title": "Maintenance Collection",
    "amount": 50000,
    "date": "2024-05-01",
    "dueDate": "2024-05-10",
    "description": "Monthly maintenance collection"
  }
  ```
#### Expenses (`/expanse`)
- `POST` **Add Expense**: `{{baseURL}}/api/expanse/add`
  ```json
  {
    "title": "Lift Repair",
    "amount": 5000,
    "date": "2024-05-02",
    "description": "Repairing the main lift in Wing B",
    "uploadBill": "bill_url_or_path"
  }
  ```

### 6. Community Features
#### Announcements (`/announcement`)
- `POST` **Create Announcement**: `{{baseURL}}/api/announcement/create`
  ```json
  {
    "title": "Society Meeting",
    "description": "Annual General Meeting this Sunday",
    "announcementType": "Event",
    "date": "2024-05-12",
    "time": "10:00 AM"
  }
  ```
#### Facilities (`/facility`)
- `POST` **Add Facility**: `{{baseURL}}/api/facility/add`
  ```json
  {
    "name": "Swimming Pool",
    "description": "Weekly cleaning and maintenance",
    "scheduleServiceDate": "2024-05-06",
    "remindBefore": 1
  }
  ```

### 7. Security
#### Security Guards (`/security-guard`)
- `POST` **Create Guard**: `{{baseURL}}/api/security-guard/create`
  ```json
  {
    "fullName": "Ram Singh",
    "phoneNumber": "8888877777",
    "shift": "Day",
    "gender": "Male",
    "shiftDate": "2024-05-01",
    "shiftTime": "08:00 AM",
    "uploadAadhar": "aadhar_url_or_path",
    "email": "ram@example.com"
  }
  ```
#### Security Protocols (`/security-protocol`)
- `POST` **Create Protocol**: `{{baseURL}}/api/security-protocol/create`
  ```json
  {
    "title": "Visitor Entry",
    "description": "All visitors must provide phone number",
    "date": "2024-05-01",
    "time": "08:00 AM"
  }
  ```

### 8. Complaints & Requests
#### Complaints (`/complain`)
- `POST` **Create Complaint**: `{{baseURL}}/api/complain/createComplain`
  ```json
  {
    "compainerName": "John Doe",
    "wing": "A",
    "unit": "101",
    "complainName": "Water Leakage",
    "description": "Leakage in kitchen pipe",
    "status": "Pending",
    "priority": "High"
  }
  ```
#### Request Tracking (`/request`)
- `POST` **Create Request**: `{{baseURL}}/api/request/create`
  ```json
  {
    "requesterName": "John Doe",
    "requestName": "New Entry Card",
    "wing": "A",
    "unit": "101",
    "description": "Lost previous card",
    "status": "Open",
    "priority": "Medium"
  }
  ```