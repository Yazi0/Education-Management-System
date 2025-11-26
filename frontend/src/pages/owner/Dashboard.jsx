import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardAPI, studentAPI } from "../../utils/api";
import { Users, UserCircle, CheckCircle, DollarSign } from "lucide-react";

export const OwnerDashboard = () => {
  const [selectedGrade, setSelectedGrade] = useState("");

  // Owner Dashboard Stats API
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["ownerStats"],
    queryFn: dashboardAPI.ownerStats,
  });

  // Load ALL students at once
  const {
    data: allStudents,
    isLoading: studentsLoading,
  } = useQuery({
    queryKey: ["allStudents"],
    queryFn: studentAPI.list,
  });

  if (isLoading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Failed to load dashboard data</div>;

  const statsData = stats?.data || {};
  const allStudentsData = allStudents?.data || [];

  // Filter students by grade
  const filteredStudents =
    selectedGrade === ""
      ? []
      : allStudentsData.filter(
          (s) => String(s.grade) === String(selectedGrade)
        );

  const statCards = [
    {
      title: "Total Students",
      value: statsData.total_students || 0,
      icon: Users,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Total Teachers",
      value: statsData.total_teachers || 0,
      icon: UserCircle,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Today's Attendance",
      value: statsData.todays_attendance || 0,
      icon: CheckCircle,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Students Paid This Month",
      value: statsData.students_paid_this_month || 0,
      icon: DollarSign,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  return (
    <div className="container">
      <h1 style={{ marginBottom: 24, color: "#1f2937" }}>Owner Dashboard</h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-4" style={{ marginBottom: 32 }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              style={{
                background: stat.gradient,
                color: "white",
                padding: 24,
                borderRadius: 8,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      opacity: 0.9,
                      marginBottom: 8,
                    }}
                  >
                    {stat.title}
                  </h3>
                  <div style={{ fontSize: 32, fontWeight: 700 }}>
                    {stat.value}
                  </div>
                </div>
                <Icon size={40} style={{ opacity: 0.8 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Income Overview */}
        <div className="card">
          <h2 style={{ marginBottom: 16, color: "#1f2937" }}>
            Income Overview
          </h2>
          <div
            style={{
              padding: 16,
              background: "#f9fafb",
              borderRadius: 6,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Total Income
              </div>
              <div
                style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}
              >
                ${(statsData.total_income || 0).toFixed(2)}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                  }}
                >
                  Your Share (20%)
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: 600, color: "#3b82f6" }}
                >
                  ${(statsData.owner_income || 0).toFixed(2)}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                  }}
                >
                  Teachers Share (80%)
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: 600, color: "#10b981" }}
                >
                  ${(statsData.total_teacher_income || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Breakdown */}
        <div className="card">
          <h2 style={{ marginBottom: 16, color: "#1f2937" }}>
            Teacher Income Breakdown
          </h2>

          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {statsData.teacher_breakdown &&
            Object.keys(statsData.teacher_breakdown).length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Total</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(statsData.teacher_breakdown).map(
                    (teacher, i) => (
                      <tr key={i}>
                        <td>{teacher.teacher_name}</td>
                        <td>${teacher.total_collected.toFixed(2)}</td>
                        <td>${teacher.teacher_share.toFixed(2)}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <p
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                No teacher income data
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Student Filter Section */}
      <div className="card" style={{ marginTop: 32 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2 style={{ color: "#1f2937" }}>Student Filter by Grade</h2>

          <select
            className="input"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{ width: 200 }}
          >
            <option value="">Select Grade</option>
            {Array.from(
              new Set(allStudentsData.map((s) => s.grade))
            ).map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
        </div>

        {studentsLoading ? (
          <div className="loading">Loading students...</div>
        ) : filteredStudents.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Grade</th>
                <th>Email</th>
                <th>Parent</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.register_number}</td>
                  <td>
                    {student.user.first_name} {student.user.last_name}
                  </td>
                  <td>{student.grade}</td>
                  <td>{student.user.email}</td>
                  <td>{student.parent_phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : selectedGrade !== "" ? (
          <p
            style={{
              textAlign: "center",
              color: "#6b7280",
              padding: 20,
            }}
          >
            No students in Grade {selectedGrade}
          </p>
        ) : (
          <p
            style={{
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            Select a grade to view students
          </p>
        )}
      </div>
    </div>
  );
};
