import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Users, BookOpen, FileText, BarChart3, UserCircle } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'owner':
        return [
          { path: '/owner/dashboard', label: 'Dashboard', icon: Home },
          { path: '/owner/students', label: 'Students', icon: Users },
          { path: '/owner/teachers', label: 'Teachers', icon: UserCircle },
          { path: '/owner/subjects', label: 'Subjects', icon: BookOpen },
          { path: '/owner/scanner', label: 'Scanner', icon: BarChart3 },
        ];
      case 'teacher':
        return [
          { path: '/teacher/dashboard', label: 'Dashboard', icon: Home },
          { path: '/teacher/students', label: 'Students', icon: Users },
          { path: '/teacher/upload', label: 'Upload Center', icon: FileText },
        ];
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: Home },
          { path: '/student/subjects', label: 'My Subjects', icon: BookOpen },
          { path: '/student/results', label: 'Results', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="nav">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ margin: 0, color: '#3b82f6' }}>LMS</h2>
          <ul style={{ display: 'flex', gap: '24px', margin: 0, padding: 0, listStyle: 'none' }}>
            {getNavItems().map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                      color: location.pathname === item.path ? '#3b82f6' : '#374151',
                      fontWeight: 500,
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            {user.first_name} {user.last_name} ({user.role})
          </span>
          <button onClick={logout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
