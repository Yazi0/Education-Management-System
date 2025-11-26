from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'students', views.StudentViewSet)
router.register(r'teachers', views.TeacherViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'notes', views.NoteViewSet)
router.register(r'videos', views.VideoViewSet)
router.register(r'quizzes', views.QuizViewSet)
router.register(r'exam-results', views.ExamResultViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/student/request-otp/', views.student_request_otp, name='student-request-otp'),
    path('auth/student/verify-otp/', views.student_verify_otp, name='student-verify-otp'),
    path('dashboard/owner/', views.owner_dashboard_stats, name='owner-dashboard'),
    path('dashboard/teacher/', views.teacher_dashboard_stats, name='teacher-dashboard'),
    path('dashboard/student/', views.student_dashboard_stats, name='student-dashboard'),
]
