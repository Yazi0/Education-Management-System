import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../utils/api';
import { BookOpen, Users, DollarSign } from 'lucide-react';

export const TeacherDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['teacherStats'],
    queryFn: dashboardAPI.teacherStats,
  });

  if (isLoading) return <div className="loading">Loading dashboard...</div>;

  const statsData = stats?.data || {};

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px', color: '#1f2937' }}>Teacher Dashboard</h1>
      
      <div className="grid grid-cols-3" style={{ marginBottom: '32px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '24px', 
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, opacity: 0.9, marginBottom: '8px' }}>
                Subjects Teaching
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                {statsData.subjects_teaching || 0}
              </div>
            </div>
            <BookOpen size={40} style={{ opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          color: 'white', 
          padding: '24px', 
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, opacity: 0.9, marginBottom: '8px' }}>
                Enrolled Students
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                {statsData.enrolled_students || 0}
              </div>
            </div>
            <Users size={40} style={{ opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
          color: 'white', 
          padding: '24px', 
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, opacity: 0.9, marginBottom: '8px' }}>
                Monthly Income
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                ${(statsData.monthly_income || 0).toFixed(2)}
              </div>
            </div>
            <DollarSign size={40} style={{ opacity: 0.8 }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>My Subjects</h2>
        {statsData.subjects && statsData.subjects.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Grade</th>
                <th>Fee</th>
              </tr>
            </thead>
            <tbody>
              {statsData.subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td>{subject.grade}</td>
                  <td>${subject.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
            No subjects assigned yet
          </p>
        )}
      </div>
    </div>
  );
};
