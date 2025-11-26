from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'owner'

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'teacher'

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'

class IsOwnerOrTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['owner', 'teacher']

class IsTeacherOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'owner':
            return True
        if request.user.role == 'teacher' and hasattr(obj, 'teacher'):
            return obj.teacher.user == request.user
        return False
