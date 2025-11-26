from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.contrib.auth import authenticate
from django.db import models
from .models import User, Student, Teacher, Subject, StudentSubject, Payment, Attendance, Note, Video, Quiz, QuizAttempt, ExamResult
from .serializers import (UserSerializer, StudentSerializer, StudentCreateSerializer, 
                         TeacherSerializer, TeacherCreateSerializer, SubjectSerializer,
                         StudentSubjectSerializer, PaymentSerializer, AttendanceSerializer,
                         NoteSerializer, VideoSerializer, QuizSerializer, QuizAttemptSerializer,
                         ExamResultSerializer)
from .permissions import IsOwner, IsTeacher, IsStudent, IsOwnerOrTeacher
from .services import SMSService, OTPService, PaymentService
from datetime import date
from decimal import Decimal

class SubjectOwnershipMixin:
    def validate_subject_ownership(self, subject_id):
        if not subject_id:
            raise ValidationError({'subject': 'Subject is required'})
        
        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            raise ValidationError({'subject': 'Subject not found'})
        
        if self.request.user.role == 'owner':
            return subject
        
        if self.request.user.role == 'teacher':
            try:
                teacher = self.request.user.teacher_profile
                if subject.teacher != teacher:
                    raise PermissionDenied('You can only create content for your own subjects')
                return subject
            except Teacher.DoesNotExist:
                raise PermissionDenied('Teacher profile not found')
        
        raise PermissionDenied('Insufficient permissions')
    
    def perform_create(self, serializer):
        subject_id = self.request.data.get('subject')
        self.validate_subject_ownership(subject_id)
        
        if self.request.user.role == 'teacher':
            serializer.save(teacher=self.request.user.teacher_profile)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        subject_id = self.request.data.get('subject', serializer.instance.subject.id)
        self.validate_subject_ownership(subject_id)
        
        if self.request.user.role == 'teacher':
            serializer.save(teacher=self.request.user.teacher_profile)
        else:
            serializer.save()

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def student_request_otp(request):
    register_number = request.data.get('register_number')
    phone = request.data.get('phone')
    
    try:
        student = Student.objects.get(register_number=register_number, parent_phone=phone)
        otp = OTPService.generate_otp(register_number, phone)
        
        if otp is None:
            return Response({'error': 'Too many OTP requests. Please wait 10 minutes.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        return Response({'message': 'OTP sent successfully to your phone'})
    except Student.DoesNotExist:
        return Response({'error': 'Student not found with provided credentials'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def student_verify_otp(request):
    register_number = request.data.get('register_number')
    otp_code = request.data.get('otp_code')
    
    if OTPService.verify_otp(register_number, otp_code):
        try:
            student = Student.objects.get(register_number=register_number)
            refresh = RefreshToken.for_user(student.user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(student.user).data
            })
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsOwner])
def owner_dashboard_stats(request):
    total_students = Student.objects.count()
    total_teachers = Teacher.objects.count()
    
    today = date.today()
    todays_attendance = Attendance.objects.filter(date=today).count()
    
    current_month = today.month
    students_paid_this_month = Payment.objects.filter(
        month=current_month,
        year=today.year
    ).values('student').distinct().count()
    
    income_split = PaymentService.calculate_income_split(current_month, today.year)
    
    return Response({
        'total_students': total_students,
        'total_teachers': total_teachers,
        'todays_attendance': todays_attendance,
        'students_paid_this_month': students_paid_this_month,
        **income_split
    })

@api_view(['GET'])
@permission_classes([IsTeacher])
def teacher_dashboard_stats(request):
    try:
        teacher = request.user.teacher_profile
        today = date.today()
        current_month = today.month
        
        my_subjects = Subject.objects.filter(teacher=teacher)
        enrolled_students = StudentSubject.objects.filter(subject__in=my_subjects).count()
        
        my_income_data = PaymentService.calculate_income_split(current_month, today.year)
        teacher_breakdown = my_income_data.get('teacher_breakdown', {}).get(teacher.id, {})
        
        return Response({
            'subjects_teaching': my_subjects.count(),
            'enrolled_students': enrolled_students,
            'monthly_income': teacher_breakdown.get('teacher_share', 0),
            'subjects': SubjectSerializer(my_subjects, many=True).data
        })
    except Teacher.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsStudent])
def student_dashboard_stats(request):
    try:
        student = request.user.student_profile
        enrolled_subjects = StudentSubject.objects.filter(student=student)
        
        today = date.today()
        current_month = today.month
        current_year = today.year
        
        paid_subjects_count = sum(1 for es in enrolled_subjects if es.is_paid_for_month(current_month, current_year))
        
        return Response({
            'total_subjects': enrolled_subjects.count(),
            'paid_subjects': paid_subjects_count,
            'unpaid_subjects': enrolled_subjects.count() - paid_subjects_count,
            'subjects': StudentSubjectSerializer(enrolled_subjects, many=True).data
        })
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsOwner]
    
    def get_queryset(self):
        return Student.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = StudentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = User.objects.create_user(
            username=serializer.validated_data.get('username', serializer.validated_data['email']),
            email=serializer.validated_data['email'],
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
            phone=serializer.validated_data.get('phone', ''),
            password=serializer.validated_data.get('password', 'student123'),
            role='student'
        )
        
        student = Student.objects.create(
            user=user,
            grade=serializer.validated_data['grade'],
            parent_phone=serializer.validated_data['parent_phone'],
            address=serializer.validated_data.get('address', ''),
            date_of_birth=serializer.validated_data.get('date_of_birth')
        )
        
        return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def mark_attendance(self, request, pk=None):
        student = self.get_object()
        today = date.today()
        
        attendance, created = Attendance.objects.get_or_create(
            student=student,
            date=today,
            defaults={'marked_by': request.user}
        )
        
        if created:
            SMSService.send_attendance_sms(student)
            return Response({'message': 'Attendance marked successfully and SMS sent'})
        return Response({'message': 'Attendance already marked for today'})
    
    @action(detail=True, methods=['post'])
    def mark_payment(self, request, pk=None):
        student = self.get_object()
        subject_id = request.data.get('subject_id')
        
        try:
            subject = Subject.objects.get(id=subject_id)
            today = date.today()
            
            result = PaymentService.mark_payment(
                student, 
                subject, 
                today.month, 
                today.year
            )
            
            if result['status'] == 'duplicate':
                return Response({'message': result['message']}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'message': 'Payment marked successfully and SMS sent',
                'payment': PaymentSerializer(result['payment']).data
            })
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsOwner]
    
    def get_queryset(self):
        return Teacher.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TeacherCreateSerializer
        return TeacherSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = TeacherCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
            phone=serializer.validated_data.get('phone', ''),
            password=serializer.validated_data['password'],
            role='teacher'
        )
        
        teacher = Teacher.objects.create(
            user=user,
            specialization=serializer.validated_data.get('specialization', '')
        )
        
        return Response(TeacherSerializer(teacher).data, status=status.HTTP_201_CREATED)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsOwnerOrTeacher]
    
    def get_queryset(self):
        if self.request.user.role == 'owner':
            return Subject.objects.all()
        elif self.request.user.role == 'teacher':
            return Subject.objects.filter(teacher__user=self.request.user)
        return Subject.objects.none()

class NoteViewSet(SubjectOwnershipMixin, viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsOwnerOrTeacher()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return Note.objects.all()
        elif user.role == 'teacher':
            return Note.objects.filter(teacher__user=user)
        elif user.role == 'student':
            student = user.student_profile
            today = date.today()
            current_month = today.month
            current_year = today.year
            
            paid_subject_ids = Payment.objects.filter(
                student=student,
                month=current_month,
                year=current_year
            ).values_list('subject_id', flat=True).distinct()
            
            return Note.objects.filter(subject_id__in=paid_subject_ids)
        return Note.objects.none()

class VideoViewSet(SubjectOwnershipMixin, viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsOwnerOrTeacher()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return Video.objects.all()
        elif user.role == 'teacher':
            return Video.objects.filter(teacher__user=user)
        elif user.role == 'student':
            student = user.student_profile
            today = date.today()
            current_month = today.month
            current_year = today.year
            
            paid_subject_ids = Payment.objects.filter(
                student=student,
                month=current_month,
                year=current_year
            ).values_list('subject_id', flat=True).distinct()
            
            return Video.objects.filter(subject_id__in=paid_subject_ids)
        return Video.objects.none()

class QuizViewSet(SubjectOwnershipMixin, viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsOwnerOrTeacher()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return Quiz.objects.all()
        elif user.role == 'teacher':
            return Quiz.objects.filter(teacher__user=user)
        elif user.role == 'student':
            student = user.student_profile
            today = date.today()
            current_month = today.month
            current_year = today.year
            
            paid_subject_ids = Payment.objects.filter(
                student=student,
                month=current_month,
                year=current_year
            ).values_list('subject_id', flat=True).distinct()
            
            return Quiz.objects.filter(subject_id__in=paid_subject_ids)
        return Quiz.objects.none()
    
    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def submit_attempt(self, request, pk=None):
        quiz = self.get_object()
        answers = request.data.get('answers', {})
        
        correct_count = 0
        total_questions = len(quiz.questions)
        
        for question in quiz.questions:
            question_id = str(question.get('id'))
            if question_id in answers and answers[question_id] == question.get('correct_answer'):
                correct_count += 1
        
        score = (correct_count / total_questions * quiz.total_marks) if total_questions > 0 else 0
        
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            student=request.user.student_profile,
            answers=answers,
            score=Decimal(str(score))
        )
        
        return Response({
            'message': 'Quiz submitted successfully',
            'score': float(score),
            'total_marks': quiz.total_marks,
            'correct_answers': correct_count,
            'total_questions': total_questions
        })

class ExamResultViewSet(viewsets.ModelViewSet):
    queryset = ExamResult.objects.all()
    serializer_class = ExamResultSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsOwnerOrTeacher()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return ExamResult.objects.all()
        elif user.role == 'teacher':
            return ExamResult.objects.filter(teacher__user=user)
        elif user.role == 'student':
            return ExamResult.objects.filter(student__user=user)
        return ExamResult.objects.none()
