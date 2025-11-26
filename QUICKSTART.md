# Quick Start Guide

## Running the Application

### Step 1: Set Up Workflows in Replit

1. **Create Backend Workflow**
   - Click on "Tools" in the sidebar
   - Select "Workflows"
   - Click "+ New Workflow"
   - Name it "Backend Server"
   - Choose "Execute Shell Command"
   - Enter command: `cd backend && python manage.py runserver 0.0.0.0:8000`
   - Save

2. **Create Frontend Workflow**
   - Click "+ New Workflow" again
   - Name it "Frontend Server"
   - Choose "Execute Shell Command"
   - Enter command: `cd frontend && npm run dev -- --host 0.0.0.0 --port 5000`
   - Save

3. **Run Both Workflows**
   - Click the play button on "Backend Server"
   - Click the play button on "Frontend Server"
   - Wait a few seconds for both to start

4. **Access the Application**
   - Click the "Open Website" button at the top of Replit
   - Or navigate to the URL shown in the Webview pane

### Step 2: Login as Owner

**Credentials:**
- Username: `owner`
- Password: `owner123`

### Step 3: Test the System

1. **Add a Teacher**
   - Click "Teachers" in the sidebar
   - Click "Add Teacher"
   - Fill in details (username, password, first name, last name, specialization)
   - Click "Add Teacher"

2. **Add a Subject**
   - Click "Subjects" in the sidebar
   - Click "Add Subject"
   - Fill in: name, grade, fee
   - Select the teacher you just created
   - Click "Add Subject"

3. **Add a Student**
   - Click "Students" in the sidebar
   - Click "Add Student"
   - Fill in all details (including parent's phone number for OTP)
   - Click "Add Student"
   - Note the auto-generated register number shown

4. **Enroll Student in Subject** (Backend only - UI to be added)
   - This feature needs to be implemented in the UI
   - Currently can be done via Django admin or API

5. **Test Teacher Login**
   - Logout from owner account
   - Login with the teacher credentials you created
   - View teacher dashboard

6. **Test Student OTP Login**
   - Logout from teacher account
   - Click "Student Login"
   - Enter the student's register number and parent phone
   - Request OTP (will be printed to backend console if Twilio not configured)
   - Enter OTP and login
   - View student dashboard

## What's Working

✅ Owner login with username/password  
✅ Teacher login with username/password  
✅ Student login with OTP verification  
✅ Owner dashboard with real-time stats  
✅ Teacher dashboard with income tracking  
✅ Student dashboard with enrollment status  
✅ Student management (add, view, delete)  
✅ Teacher management (add, view, delete)  
✅ Subject management (add, view, delete, assign teachers)  
✅ JWT authentication with auto-refresh  
✅ Role-based permissions  
✅ Auto-generated student register numbers  
✅ Barcode generation for students  
✅ Income calculation (20% owner, 80% teacher)  

## What Needs Implementation

🔲 Barcode scanner for attendance/payment  
🔲 Student enrollment in subjects (UI)  
🔲 Teacher upload center (notes, videos, quizzes)  
🔲 Student content access (view notes/videos)  
🔲 Quiz taking interface  
🔲 Results display with charts  
🔲 Student filtering by grade/payment status  
🔲 Attendance tracking UI  
🔲 Payment tracking UI  
🔲 Twilio SMS integration setup  

## Troubleshooting

**"Connection refused" or "Network error"**
- Make sure both Backend and Frontend workflows are running
- Check the console output in each workflow for errors
- Backend should show "Starting development server at http://0.0.0.0:8000/"
- Frontend should show "Local: http://localhost:5000/"

**"Invalid credentials" when logging in**
- Verify you're using the correct credentials:
  - Owner: username=owner, password=owner123
  - Teacher: use the credentials you set when creating the teacher
  - Student: use register number + parent phone + OTP

**OTP not working**
- OTP will be printed in the Backend Server console if Twilio is not configured
- Check the backend logs for the OTP code
- OTP expires after 10 minutes
- Maximum 3 OTP attempts per 10 minutes

**No data showing in dashboards**
- Make sure you've added students, teachers, and subjects
- Refresh the page
- Check browser console for errors (F12)

**CORS errors in browser console**
- Restart the Backend Server workflow
- Clear browser cache and reload

## Next Steps

To continue development:

1. **Implement Student Enrollment UI** - Add interface for owner to enroll students in subjects
2. **Build Scanner Page** - Implement barcode scanning for attendance/payment
3. **Create Upload Center** - Allow teachers to upload educational content
4. **Build Content Viewer** - Let students access notes and videos
5. **Add Quiz System** - Create quiz interface and grading
6. **Implement Results Charts** - Display performance analytics using Recharts

## Need Help?

Refer to the main README.md for:
- Complete API documentation
- Detailed feature descriptions
- Environment setup
- Database management
- Code structure explanations
