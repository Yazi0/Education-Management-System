import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../utils/api';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';

export const StudentDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['studentStats'],
    queryFn: dashboardAPI.studentStats,
  });

  if (isLoading) return <div className="loading">Loading dashboard...</div>;

  const statsData = stats?.data || {};

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px', color: '#1f2937' }}>Student Dashboard</h1>
      
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
                Total Subjects
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                {statsData.total_subjects || 0}
              </div>
            </div>
            <BookOpen size={40} style={{ opacity: 0.8 }} />
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
                Paid Subjects
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                {statsData.paid_subjects || 0}
              </div>
            </div>
            <CheckCircle size={40} style={{ opacity: 0.8 }} />
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
                Unpaid Subjects
              </h3>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                {statsData.unpaid_subjects || 0}
              </div>
            </div>
            <XCircle size={40} style={{ opacity: 0.8 }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>My Enrolled Subjects</h2>
        {statsData.subjects && statsData.subjects.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Grade</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {statsData.subjects.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td>{enrollment.subject_name}</td>
                  <td>Grade {enrollment.subject.grade}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      background: enrollment.is_paid_current_month ? '#d1fae5' : '#fee2e2',
                      color: enrollment.is_paid_current_month ? '#065f46' : '#991b1b'
                    }}>
                      {enrollment.is_paid_current_month ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
            No subjects enrolled yet
          </p>
        )}
      </div>
    </div>
  );
};
