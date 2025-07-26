# **Hostel Management System API Endpoints**

## **Student Endpoints**

### **Authentication**

- `POST /api/login` – Logs in the student
- `POST /api/logout` – Logs out the student

### **Pass Management**

- `POST /api/verify_student` – Gets the phone number and updates the student details
- `POST /api/submit_pass_parent_approval` – Submits the pass request to the parent
- `POST /api/submit_pass_warden_approval` – Submits the pass request to the warden and superior warden (sets `notify_warden=true`)
- `POST /api/save_draft` – Saves the draft of the pass form
- `GET /api/fetch_draft` – Fetches the saved draft
- `GET /api/get_student_pass` – Retrieves the student's submitted passes

### **Profile & Food Requests**

- `POST /api/change_food_change` – Sends a request to the warden for food type change
- `POST /api/request_profile_update` – Sends a request to the superior warden to update profile details
- `GET /api/fetch_student_profile` – Fetches the student’s profile

---

## **Warden Endpoints**

### **Authentication**

- `POST /api/login` – Logs in the warden
- `POST /api/logout` – Logs out the warden

### **Pass Management**

- `GET /api/fetch_pending_passes_warden` – Fetches pending passes for approval
- `POST /api/warden_accept` – Approves the pass request
- `POST /api/warden_not_accept` – Declines the pass request

### **Food Requests**

- `GET /api/food_requests_changes` – Fetches student-submitted food change requests
- `POST /api/approve_food_change` – Approves or declines food change requests
- `POST /api/warden_change_foodtype` – Directly changes the food type of students
- `GET /api/food_count` – Retrieves the count of vegetarian and non-vegetarian students

### **Analysis & Reports**

- `GET /api/fetch_waiting_members` – Fetches the names of waiting members
- `GET /api/fetch_late_members` – Fetches the names of members who exceeded allowed time
- `GET /api/pass_measures` – Provides analytics on passes (total, overtime, waiting, grouping reason)
- `GET /api/pass_analysis` – Analyzes passes for each reason type on the current date
- `GET /api/pass_analysis_by_date` – Analyzes passes for each reason on a specific date
- `GET /api/fetch_warden_year` – Retrieves the warden’s assigned primary years

### **Miscellaneous**

- `GET /api/get_student_details` – Fetches student profiles for the warden
- `GET /api/sidebar_warden` – Retrieves sidebar content for the warden

---

## **Superior Warden Endpoints**

### **Authentication**

- `POST /api/login` – Logs in the superior warden
- `POST /api/logout` – Logs out the superior warden

### **Pass & Profile Management**

- `GET /api/profile_request_changes` – Fetches student profile update requests
- `POST /api/handle_request` – Approves or rejects profile update requests
- `POST /api/superior_accept` – Approves pass requests
- `POST /api/superior_decline` – Declines pass requests

### **Warden & Student Management**

- `GET /api/fetch_warden_details` – Fetches warden profiles
- `GET /api/fetch_warden_details_reallocation` – Fetches wardens for reallocation
- `POST /api/warden_inactive_status_handling` – Marks a warden as inactive
- `POST /api/warden_active_status_handling` – Marks a warden as active
- `POST /api/update_student_by_warden` – Updates student details directly
- `POST /api/update_warden_by_superior` – Updates warden profiles directly
- `DELETE /api/delete_student` – Deletes student or warden records

### **Pass & Food Analytics**

- `GET /api/fetch_passes_for_superior` – Retrieves passes that require superior warden approval
- `GET /api/fetch_student_details_superior` – Fetches all student details
- `GET /api/food_count` – Fetches vegetarian and non-vegetarian counts
- `GET /api/sidebar_warden` – Retrieves sidebar content for the superior warden

---

## **Parent Endpoints**

- `POST /api/parent_accept/:pass_id` – Parent approves the pass request
- `POST /api/parent_not_accept/:pass_id` – Parent declines the pass request

---

## **Security Endpoints**

### **Authentication**

- `POST /api/security_login` – Logs in the security personnel
- `POST /api/logout` – Logs out the security personnel

### **Pass Verification**

- `GET /api/fetch_pass_details` – Fetches pass details for verification
- `POST /api/security_accept` – Approves the pass
- `POST /api/security_decline` – Declines the pass
