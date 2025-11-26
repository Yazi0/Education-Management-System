from django.db import models
from django.contrib.auth.models import AbstractUser
import barcode
from barcode.writer import ImageWriter
from io import BytesIO
from django.core.files import File
import random
import string

class User(AbstractUser):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    register_number = models.CharField(max_length=20, unique=True, editable=False)
    barcode = models.ImageField(upload_to='barcodes/', blank=True)
    grade = models.CharField(max_length=10)
    parent_phone = models.CharField(max_length=15)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def generate_register_number(self):
        prefix = 'STU'
        random_part = ''.join(random.choices(string.digits, k=6))
        return f"{prefix}{random_part}"
    
    def generate_barcode(self):
        CODE128 = barcode.get_barcode_class('code128')
        rv = BytesIO()
        CODE128(self.register_number, writer=ImageWriter()).write(rv)
        self.barcode.save(f'{self.register_number}.png', File(rv), save=False)
    
    def save(self, *args, **kwargs):
        if not self.register_number:
            self.register_number = self.generate_register_number()
            while Student.objects.filter(register_number=self.register_number).exists():
                self.register_number = self.generate_register_number()
        
        if not self.barcode:
            self.generate_barcode()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.register_number} - {self.user.get_full_name()}"


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    specialization = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    grade = models.CharField(max_length=10)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='subjects')
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('name', 'grade')
    
    def __str__(self):
        return f"{self.name} - Grade {self.grade}"


class StudentSubject(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrolled_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='enrolled_students')
    enrolled_date = models.DateTimeField(auto_now_add=True)
    is_paid_current_month = models.BooleanField(default=False)
    last_payment_date = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ('student', 'subject')
    
    def is_paid_for_month(self, month=None, year=None):
        from datetime import date
        if month is None or year is None:
            today = date.today()
            month = today.month
            year = today.year
        
        return Payment.objects.filter(
            student=self.student,
            subject=self.subject,
            month=month,
            year=year
        ).exists()
    
    def __str__(self):
        return f"{self.student.register_number} - {self.subject.name}"


class Payment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    month = models.IntegerField()
    year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.register_number} - {self.subject.name} - {self.month}/{self.year}"
    
    def get_month_name(self):
        import calendar
        return calendar.month_name[self.month] if 1 <= self.month <= 12 else 'Unknown'


class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'date')
    
    def __str__(self):
        return f"{self.student.register_number} - {self.date}"


class Note(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='notes')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='uploaded_notes')
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    file = models.FileField(upload_to='notes/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class Video(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='videos')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='uploaded_videos')
    title = models.CharField(max_length=200)
    url = models.URLField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class Quiz(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='quizzes')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='created_quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    questions = models.JSONField()
    total_marks = models.IntegerField()
    duration_minutes = models.IntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='quiz_attempts')
    answers = models.JSONField()
    score = models.DecimalField(max_digits=5, decimal_places=2)
    attempted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.register_number} - {self.quiz.title} - {self.score}"


class ExamResult(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='exam_results')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='exam_results')
    exam_name = models.CharField(max_length=200)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    exam_date = models.DateField()
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='entered_results')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student.register_number} - {self.subject.name} - {self.exam_name}"


class OTP(models.Model):
    phone = models.CharField(max_length=15)
    register_number = models.CharField(max_length=20)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.phone} - {self.otp_code}"
