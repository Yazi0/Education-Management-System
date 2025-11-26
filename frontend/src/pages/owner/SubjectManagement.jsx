import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectAPI, teacherAPI } from '../../utils/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const SubjectManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    teacher: '',
    fee: '',
    description: '',
  });

  const queryClient = useQueryClient();

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectAPI.list,
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: teacherAPI.list,
  });

  const createMutation = useMutation({
    mutationFn: subjectAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedData }) => subjectAPI.update(id, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subjectAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '',
      teacher: '',
      fee: '',
      description: '',
    });
    setEditingId(null);
    setIsEditMode(false);
  };

  const openEditModal = (subject) => {
    setIsEditMode(true);
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      grade: subject.grade,
      teacher: subject.teacher ? subject.teacher : '',
      fee: subject.fee,
      description: subject.description || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      updateMutation.mutate({ id: editingId, updatedData: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#1f2937' }}>Subject Management</h1>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="loading">Loading subjects...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Grade</th>
                <th>Teacher</th>
                <th>Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects?.data?.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td>Grade {subject.grade}</td>
                  <td>{subject.teacher_name || 'Not assigned'}</td>
                  <td>${subject.fee}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => openEditModal(subject)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleDelete(subject.id)}
                      >
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>{isEditMode ? 'Edit Subject' : 'Add New Subject'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label>Grade</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fee ($)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assign Teacher</label>
                <select
                  className="input"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                >
                  <option value="">Select a teacher</option>
                  {teachers?.data?.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.first_name} {teacher.user.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1 }}>
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {isEditMode
                    ? updateMutation.isLoading ? 'Updating...' : 'Update Subject'
                    : createMutation.isLoading ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
