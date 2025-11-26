import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '../../utils/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const StudentManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    grade: '',
    parent_phone: '',
    address: '',
    date_of_birth: '',
  });

  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentAPI.list,
  });

  const createMutation = useMutation({
    mutationFn: studentAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      studentAPI.update(data.id, {
        grade: data.grade,
        parent_phone: data.parent_phone,
        address: data.address,
        date_of_birth: data.date_of_birth,
        user: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: studentAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      grade: '',
      parent_phone: '',
      address: '',
      date_of_birth: '',
    });
    setEditingStudent(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);

    setFormData({
      first_name: student.user.first_name,
      last_name: student.user.last_name,
      email: student.user.email,
      phone: student.user.phone || "",
      grade: student.grade,
      parent_phone: student.parent_phone,
      address: student.address || "",
      date_of_birth: student.date_of_birth || "",
    });

    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1>Student Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Grade</th>
                <th>Email</th>
                <th>Parent Phone</th>
                <th>Address</th> {/* Added column */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students?.data?.map((student) => (
                <tr key={student.id}>
                  <td>{student.register_number}</td>
                  <td>{student.user.first_name} {student.user.last_name}</td>
                  <td>{student.grade}</td>
                  <td>{student.user.email}</td>
                  <td>{student.parent_phone}</td>
                  <td>{student.address || "N/A"}</td> {/* Display Address */}
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => handleEdit(student)}>
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(student.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2>{editingStudent ? "Edit Student" : "Add Student"}</h2>
              <button onClick={closeModal} style={{ background: "none", border: 0 }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" className="input" value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" className="input" value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" className="input" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Grade</label>
                  <input type="text" className="input" value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Parent Phone</label>
                  <input type="tel" className="input" value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" className="input" value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea className="input" rows="3" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {editingStudent
                    ? updateMutation.isLoading ? "Saving..." : "Save Changes"
                    : createMutation.isLoading ? "Adding..." : "Add Student"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
