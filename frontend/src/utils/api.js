import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  studentRequestOTP: (data) => api.post('/auth/student/request-otp/', data),
  studentVerifyOTP: (data) => api.post('/auth/student/verify-otp/', data),
};

export const dashboardAPI = {
  ownerStats: () => api.get('/dashboard/owner/'),
  teacherStats: () => api.get('/dashboard/teacher/'),
  studentStats: () => api.get('/dashboard/student/'),
};

export const studentAPI = {
  list: () => api.get('/students/'),
  get: (id) => api.get(`/students/${id}/`),
  create: (data) => api.post('/students/', data),
  update: (id, data) => api.put(`/students/${id}/`, data),
  delete: (id) => api.delete(`/students/${id}/`),
  markAttendance: (id) => api.post(`/students/${id}/mark_attendance/`),
  markPayment: (id, data) => api.post(`/students/${id}/mark_payment/`, data),
};

export const teacherAPI = {
  list: () => api.get('/teachers/'),
  get: (id) => api.get(`/teachers/${id}/`),
  create: (data) => api.post('/teachers/', data),
  update: (id, data) => api.put(`/teachers/${id}/`, data),
  delete: (id) => api.delete(`/teachers/${id}/`),
};

export const subjectAPI = {
  list: () => api.get('/subjects/'),
  get: (id) => api.get(`/subjects/${id}/`),
  create: (data) => api.post('/subjects/', data),
  update: (id, data) => api.put(`/subjects/${id}/`, data),
  delete: (id) => api.delete(`/subjects/${id}/`),
};

export const noteAPI = {
  list: () => api.get('/notes/'),
  get: (id) => api.get(`/notes/${id}/`),
  create: (data) => api.post('/notes/', data),
  update: (id, data) => api.put(`/notes/${id}/`, data),
  delete: (id) => api.delete(`/notes/${id}/`),
};

export const videoAPI = {
  list: () => api.get('/videos/'),
  get: (id) => api.get(`/videos/${id}/`),
  create: (data) => api.post('/videos/', data),
  update: (id, data) => api.put(`/videos/${id}/`, data),
  delete: (id) => api.delete(`/videos/${id}/`),
};

export const quizAPI = {
  list: () => api.get('/quizzes/'),
  get: (id) => api.get(`/quizzes/${id}/`),
  create: (data) => api.post('/quizzes/', data),
  update: (id, data) => api.put(`/quizzes/${id}/`, data),
  delete: (id) => api.delete(`/quizzes/${id}/`),
  submitAttempt: (id, data) => api.post(`/quizzes/${id}/submit_attempt/`, data),
};

export const examResultAPI = {
  list: () => api.get('/exam-results/'),
  get: (id) => api.get(`/exam-results/${id}/`),
  create: (data) => api.post('/exam-results/', data),
  update: (id, data) => api.put(`/exam-results/${id}/`, data),
  delete: (id) => api.delete(`/exam-results/${id}/`),
};

export default api;
