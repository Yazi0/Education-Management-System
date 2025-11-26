import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { StudentLogin } from './pages/StudentLogin';
import { OwnerDashboard } from './pages/owner/Dashboard';
import { StudentManagement } from './pages/owner/StudentManagement';
import { TeacherManagement } from './pages/owner/TeacherManagement';
import { SubjectManagement } from './pages/owner/SubjectManagement';
import { Scanner } from './pages/owner/Scanner';
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { TeacherStudents } from './pages/teacher/Students';
import { UploadCenter } from './pages/teacher/UploadCenter';
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentSubjects } from './pages/student/Subjects';
import { StudentResults } from './pages/student/Results';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/student-login" element={<StudentLogin />} />
            
            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={
              <PrivateRoute roles={['owner']}>
                <OwnerDashboard />
              </PrivateRoute>
            } />
            <Route path="/owner/students" element={
              <PrivateRoute roles={['owner']}>
                <StudentManagement />
              </PrivateRoute>
            } />
            <Route path="/owner/teachers" element={
              <PrivateRoute roles={['owner']}>
                <TeacherManagement />
              </PrivateRoute>
            } />
            <Route path="/owner/subjects" element={
              <PrivateRoute roles={['owner']}>
                <SubjectManagement />
              </PrivateRoute>
            } />
            <Route path="/owner/scanner" element={
              <PrivateRoute roles={['owner']}>
                <Scanner />
              </PrivateRoute>
            } />
            
            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <PrivateRoute roles={['teacher']}>
                <TeacherDashboard />
              </PrivateRoute>
            } />
            <Route path="/teacher/students" element={
              <PrivateRoute roles={['teacher']}>
                <TeacherStudents />
              </PrivateRoute>
            } />
            <Route path="/teacher/upload" element={
              <PrivateRoute roles={['teacher']}>
                <UploadCenter />
              </PrivateRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <PrivateRoute roles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            } />
            <Route path="/student/subjects" element={
              <PrivateRoute roles={['student']}>
                <StudentSubjects />
              </PrivateRoute>
            } />
            <Route path="/student/results" element={
              <PrivateRoute roles={['student']}>
                <StudentResults />
              </PrivateRoute>
            } />
            
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/unauthorized" element={
              <div className="container">
                <div className="card">
                  <h2>Unauthorized Access</h2>
                  <p>You don't have permission to access this page.</p>
                </div>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
