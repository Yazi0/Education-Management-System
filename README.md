# Education Management System (LMS)

A full-featured Learning Management System with role-based access for Owners, Teachers, and Students.

## Features Implemented ✅

### Owner Features
- **Dashboard**: View total students, teachers, attendance, payments, and income breakdown (20% owner, 80% teachers)
- **Student Management**: Add, view, and delete students with auto-generated register numbers and barcodes
- **Teacher Management**: Add, view, and delete teachers with login credentials
- **Subject Management**: Create and manage subjects, assign teachers, set fees
- **Income Tracking**: Real-time income calculations with teacher breakdown

### Teacher Features
- **Dashboard**: View assigned subjects, enrolled students, and monthly income (80% of subject fees)
- **Student List**: View students enrolled in their subjects (grouped by grade) - *To be implemented*
- **Upload Center**: Upload notes, videos, quizzes, and exam results - *To be implemented*

### Student Features
- **OTP Login**: Secure login using register number + phone number + OTP verification
- **Dashboard**: View enrolled subjects and payment status
- **Subject Content**: Access notes and videos for paid subjects - *To be implemented*
- **Quizzes**: Take online quizzes and view results - *To be implemented*
- **Exam Results**: View physical exam results and performance charts - *To be implemented*

### Backend Features
- Django REST API with JWT authentication
- Role-based permissions (Owner, Teacher, Student)
- SMS notifications for attendance and payments (via Twilio)
- Automatic barcode generation for students
- Payment tracking with month/year records
- OTP verification system

## Technology Stack

**Backend:**
- Django 4.2.7
- Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- SQLite Database
- Twilio SMS Integration
- Python Barcode Library

**Frontend:**
- React 18
- Vite (Dev Server & Build Tool)
- React Router (Navigation)
- TanStack Query (Data Fetching)
- Axios (HTTP Client)
- Lucide React (Icons)

## Project Structure

```
.
├── backend/
│   ├── api/                    # Django app
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API endpoints
│   │   ├── serializers.py     # Data serialization
│   │   ├── permissions.py     # Role-based permissions
│   │   ├── services.py        # SMS, OTP, Payment services
│   │   └── urls.py            # API routes
│   ├── education_system/      # Django project
│   │   └── settings.py        # Configuration
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── pages/             # React pages
│   │   │   ├── owner/         # Owner pages
│   │   │   ├── teacher/       # Teacher pages
│   │   │   └── student/       # Student pages
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # Auth context
│   │   ├── utils/             # API client
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
├── start_backend.sh           # Backend startup script
└── start_frontend.sh          # Frontend startup script
```

## Setup Instructions

### Prerequisites
- Python 3.11
- Node.js 20
- (Optional) Twilio account for SMS features

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies (already installed via Replit)
# Dependencies are: Django, djangorestframework, djangorestframework-simplejwt, 
# django-cors-headers, python-barcode, Pillow, twilio

# Run migrations
python manage.py migrate

# Create owner account (already done)
# Username: owner
# Password: owner123
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies (already installed)
# Dependencies are: react, react-dom, react-router-dom, axios, 
# @tanstack/react-query, lucide-react, recharts, html5-qrcode, vite

# No additional setup needed
```

### 3. Run the Application

You need to create two workflows in Replit:

**Workflow 1: Backend Server**
- Task Type: Execute Shell Command
- Command: `cd backend && python manage.py runserver 0.0.0.0:8000`

**Workflow 2: Frontend Server**
- Task Type: Execute Shell Command
- Command: `cd frontend && npm run dev`

Alternatively, run manually in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver 0.0.0.0:8000

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5000`
The backend API will be available at `http://localhost:8000/api`

## Test Credentials

### Owner Account
- **Username**: `owner`
- **Password**: `owner123`
- **Access**: Full system management

### Creating Teacher Accounts
1. Login as owner
2. Navigate to "Teachers" page
3. Click "Add Teacher"
4. Fill in the form with username and password
5. Teacher can then login with those credentials

### Creating Student Accounts
1. Login as owner
2. Navigate to "Students" page
3. Click "Add Student"
4. Student receives auto-generated register number
5. Student login uses: Register Number + Parent Phone + OTP

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Owner/Teacher login
- `POST /api/auth/student/request-otp/` - Request OTP for student
- `POST /api/auth/student/verify-otp/` - Verify OTP and login
- `POST /api/auth/refresh/` - Refresh JWT token

### Dashboard
- `GET /api/dashboard/owner/` - Owner dashboard stats
- `GET /api/dashboard/teacher/` - Teacher dashboard stats
- `GET /api/dashboard/student/` - Student dashboard stats

### Management (Owner Only)
- `GET/POST /api/students/` - List/Create students
- `GET/PUT/DELETE /api/students/{id}/` - Student details
- `POST /api/students/{id}/mark_attendance/` - Mark attendance
- `POST /api/students/{id}/mark_payment/` - Mark payment
- `GET/POST /api/teachers/` - List/Create teachers
- `GET/POST /api/subjects/` - List/Create subjects

### Content (Teacher/Owner)
- `GET/POST /api/notes/` - List/Create notes
- `GET/POST /api/videos/` - List/Create videos
- `GET/POST /api/quizzes/` - List/Create quizzes
- `GET/POST /api/exam-results/` - List/Create exam results

### Student Access
- Students can only access content for subjects they've paid for in the current month

## Features To Be Completed

### High Priority
1. **Barcode Scanner** (Owner)
   - Scan student barcodes
   - Quick attendance marking
   - Quick payment marking
   - Display student details

2. **Upload Center** (Teacher)
   - Upload notes (PDF, documents)
   - Add video links (YouTube, etc.)
   - Create quizzes with questions
   - Enter physical exam results

3. **Subject Content** (Student)
   - View notes for paid subjects
   - Watch videos for paid subjects
   - Access only paid content

### Medium Priority
4. **Quiz System** (Student)
   - Take online quizzes
   - Auto-grading
   - View quiz results
   - Quiz history

5. **Results & Charts** (Student)
   - View exam results
   - Performance charts (recharts)
   - Progress tracking
   - Subject-wise analysis

### Additional Features
6. **Student Enrollment** (Owner)
   - Enroll students in subjects
   - Manage enrollments
   - Payment history per subject

7. **Enhanced Teacher Tools**
   - View student list by grade
   - Filter by payment status
   - Student performance tracking

8. **SMS Integration**
   - Configure Twilio credentials
   - Test SMS notifications
   - Attendance SMS
   - Payment confirmation SMS

## Environment Variables

Create a `.env` file in the backend directory (optional for SMS features):

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

Without Twilio credentials, SMS features will print to console instead.

## Database

The application uses SQLite for development. The database file is located at:
`backend/db.sqlite3`

To reset the database:
```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py shell -c "from api.models import User; User.objects.create_superuser(username='owner', email='owner@example.com', password='owner123', first_name='System', last_name='Owner', role='owner')"
```

## Development Notes

### Adding New Features
1. Backend: Add models → Create migrations → Update views/serializers → Add routes
2. Frontend: Create page → Add route → Implement UI → Connect to API

### Code Structure
- **Backend**: RESTful API following Django best practices
- **Frontend**: Component-based React with functional components and hooks
- **State Management**: TanStack Query for server state, React Context for auth
- **Styling**: Simple CSS with utility classes

### Income Calculation
- Total fee collected per subject
- Owner receives 20% of all subject fees
- Teacher receives 80% of their subject fees
- Calculated monthly based on payments

## Troubleshooting

### Backend not starting
- Check Python version (3.11 required)
- Verify migrations are applied: `python manage.py migrate`
- Check port 8000 is not in use

### Frontend not starting
- Check Node version (20 required)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check port 5000 is not in use

### CORS Errors
- Verify `CORS_ALLOW_ALL_ORIGINS = True` in backend/education_system/settings.py
- Check frontend is making requests to correct backend URL

### Authentication Issues
- Clear localStorage in browser
- Verify JWT token is being sent in Authorization header
- Check token hasn't expired (24 hour default)

## License

This is a school project. Feel free to use and modify as needed.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
#   E d u c a t i o n - M a n a g e m e n t - S y s t e m  
 