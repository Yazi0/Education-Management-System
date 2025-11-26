import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherAPI } from '../../utils/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const TeacherManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    specialization: '',
  });

  const queryClient = useQueryClient();

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: teacherAPI.list,
  });

  const createMutation = useMutation({
    mutationFn: teacherAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['teachers']);
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => teacherAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teachers']);
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: teacherAPI.delete,
    onSuccess: () => queryClient.invalidateQueries(['teachers']),
  });

  const resetForm = () => {
    setFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      specialization: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setFormData({
      username: teacher.user.username,
      first_name: teacher.user.first_name,
      last_name: teacher.user.last_name,
      email: teacher.user.email,
      password: '',
      specialization: teacher.specialization,
    });
    setEditingId(teacher.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1>Teacher Management</h1>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', gap: '6px' }}>
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading">Loading teachers...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers?.data?.map((t) => (
                <tr key={t.id}>
                  <td>{t.user.first_name} {t.user.last_name}</td>
                  <td>{t.user.username}</td>
                  <td>{t.user.email}</td>
                  <td>{t.specialization}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => openEditModal(t)}>
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(t.id)}>
                      <Trash2 size={14} />
                    </button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>{isEditing ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input type="text" className="input" required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" className="input" required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" className="input" required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" className="input" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {!isEditing && (
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="input" required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Specialization</label>
                <input type="text" className="input"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? (updateMutation.isLoading ? 'Updating...' : 'Update') :
                    (createMutation.isLoading ? 'Adding...' : 'Add Teacher')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
