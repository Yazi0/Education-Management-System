from django.contrib import admin
from .models import User, Student, Teacher, Subject, StudentSubject, Payment, Attendance, Note, Video, Quiz, QuizAttempt, ExamResult, OTP

admin.site.register(User)
admin.site.register(Student)
admin.site.register(Teacher)
admin.site.register(Subject)
admin.site.register(StudentSubject)
admin.site.register(Payment)
admin.site.register(Attendance)
admin.site.register(Note)
admin.site.register(Video)
admin.site.register(Quiz)
admin.site.register(QuizAttempt)
admin.site.register(ExamResult)
admin.site.register(OTP)
