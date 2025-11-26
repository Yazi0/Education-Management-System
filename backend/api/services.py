from django.conf import settings
from twilio.rest import Client
from datetime import datetime, timedelta
from decimal import Decimal
from .models import OTP, Payment, StudentSubject
import random

class SMSService:
    @staticmethod
    def send_sms(to_phone, message):
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            print(f"Twilio not configured. Would send SMS to {to_phone}: {message}")
            return {'status': 'simulated', 'message': 'Twilio credentials not configured'}
        
        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            message = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_phone
            )
            return {'status': 'sent', 'sid': message.sid}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}
    
    @staticmethod
    def send_attendance_sms(student):
        message = f"Student {student.user.get_full_name()} arrived at {datetime.now().strftime('%I:%M %p')} today."
        return SMSService.send_sms(student.parent_phone, message)
    
    @staticmethod
    def send_payment_sms(student, subject, amount):
        message = f"Payment of ${amount} received for {subject.name}. Thank you!"
        return SMSService.send_sms(student.parent_phone, message)

class OTPService:
    @staticmethod
    def generate_otp(register_number, phone):
        OTP.objects.filter(
            register_number=register_number,
            created_at__lt=datetime.now() - timedelta(minutes=10)
        ).delete()
        
        active_otps = OTP.objects.filter(
            register_number=register_number,
            is_verified=False,
            created_at__gte=datetime.now() - timedelta(minutes=10)
        ).count()
        
        if active_otps >= 3:
            return None
        
        otp_code = str(random.randint(100000, 999999))
        otp = OTP.objects.create(
            phone=phone,
            register_number=register_number,
            otp_code=otp_code
        )
        
        SMSService.send_sms(phone, f"Your OTP code is: {otp_code}. Valid for 10 minutes.")
        
        return otp
    
    @staticmethod
    def verify_otp(register_number, otp_code):
        try:
            otp = OTP.objects.filter(
                register_number=register_number,
                otp_code=otp_code,
                is_verified=False,
                created_at__gte=datetime.now() - timedelta(minutes=10)
            ).latest('created_at')
            
            otp.is_verified = True
            otp.save()
            return True
        except OTP.DoesNotExist:
            return False

class PaymentService:
    @staticmethod
    def mark_payment(student, subject, month, year):
        existing_payment = Payment.objects.filter(
            student=student,
            subject=subject,
            month=month,
            year=year
        ).first()
        
        if existing_payment:
            return {'status': 'duplicate', 'message': 'Payment already recorded for this month'}
        
        payment = Payment.objects.create(
            student=student,
            subject=subject,
            amount=subject.fee,
            month=month,
            year=year
        )
        
        student_subject, created = StudentSubject.objects.get_or_create(
            student=student,
            subject=subject
        )
        student_subject.is_paid_current_month = True
        student_subject.last_payment_date = payment.payment_date
        student_subject.save()
        
        SMSService.send_payment_sms(student, subject, subject.fee)
        
        return {'status': 'success', 'payment': payment}
    
    @staticmethod
    def calculate_income_split(month, year):
        from django.db.models import Sum, Q
        
        total_income = Payment.objects.filter(
            month=month,
            year=year
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        owner_income = total_income * Decimal('0.20')
        teacher_income = total_income * Decimal('0.80')
        
        teacher_breakdown = {}
        from .models import Teacher
        for teacher in Teacher.objects.all():
            teacher_payments = Payment.objects.filter(
                subject__teacher=teacher,
                month=month,
                year=year
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            teacher_breakdown[teacher.id] = {
                'teacher_name': teacher.user.get_full_name(),
                'total_collected': float(teacher_payments),
                'teacher_share': float(teacher_payments * Decimal('0.80'))
            }
        
        return {
            'total_income': float(total_income),
            'owner_income': float(owner_income),
            'total_teacher_income': float(teacher_income),
            'teacher_breakdown': teacher_breakdown
        }
