"""
Authentication API routes.

This module defines the Flask blueprint for authentication-related endpoints,
including OTP sending, verification, login, and logout functionality.
"""

from flask import Blueprint, request
from pydantic import BaseModel, EmailStr, Field, ValidationError
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.utils.helpers import (
    create_success_response,
    create_validation_error_response,
    create_bad_request_response,
    create_internal_error_response,
    handle_request_validation
)

# Create auth blueprint
auth_bp = Blueprint('auth', __name__)


# Request Models
class SendOTPRequest(BaseModel):
    """Request schema for sending OTP."""
    email: EmailStr
    user_name: str = Field(None, min_length=1, max_length=100, alias="userName")
    purpose: str = Field("authentication", pattern="^(authentication|password_reset)$")
    
    class Config:
        populate_by_name = True


class VerifyOTPRequest(BaseModel):
    """Request schema for verifying OTP."""
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=10)
    purpose: str = Field("authentication", pattern="^(authentication|password_reset)$")
    
    class Config:
        populate_by_name = True


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=10)
    
    class Config:
        populate_by_name = True


class LogoutRequest(BaseModel):
    """Request schema for user logout."""
    session_token: str = Field(..., min_length=1, alias="sessionToken")
    
    class Config:
        populate_by_name = True


class ResetPasswordRequest(BaseModel):
    """Request schema for password reset."""
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=10)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_new_password: str = Field(..., min_length=8, max_length=128)
    
    class Config:
        populate_by_name = True


class SignupRequest(BaseModel):
    """Request schema for user signup."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)
    terms_accepted: bool = Field(..., description="Must accept terms and conditions")
    
    class Config:
        populate_by_name = True


class UpdateProfileRequest(BaseModel):
    """Request schema for updating user profile."""
    full_name: str = Field(None, min_length=2, max_length=100)
    bio: str = Field(None, max_length=500)
    phone: str = Field(None, max_length=20)
    year_of_study: str = Field(None, max_length=50)
    major: str = Field(None, max_length=100)
    
    class Config:
        populate_by_name = True


@auth_bp.route('/auth/send-otp', methods=['POST'])
def send_otp():
    """
    Send OTP to user email for authentication or password reset.
    
    Returns:
        JSON response with success message or error
    """
    try:
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data
        try:
            otp_request = SendOTPRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Send OTP based on purpose
        if otp_request.purpose == "authentication":
            result = AuthService.send_authentication_otp(
                email=otp_request.email,
                user_name=otp_request.user_name
            )
        elif otp_request.purpose == "password_reset":
            result = AuthService.send_password_reset_otp(
                email=otp_request.email,
                user_name=otp_request.user_name
            )
        else:
            return create_bad_request_response("Invalid purpose. Must be 'authentication' or 'password_reset'")
        
        if result['success']:
            return create_success_response(result['message'], {
                'expiry_minutes': result.get('expiry_minutes')
            })
        else:
            return create_bad_request_response(result['message'], result.get('details'))
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/verify-otp', methods=['POST'])
def verify_otp():
    """
    Verify OTP for authentication or password reset.
    
    Returns:
        JSON response with verification result
    """
    try:
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data
        try:
            verify_request = VerifyOTPRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Verify OTP
        result = AuthService.verify_otp(
            email=verify_request.email,
            otp=verify_request.otp,
            purpose=verify_request.purpose
        )
        
        if result['success']:
            response_data = {
                'user_id': result.get('user_id'),
                'email': result.get('email')
            }
            return create_success_response(result['message'], response_data)
        else:
            return create_bad_request_response(result['message'], {
                'error': result.get('error'),
                'remaining_attempts': result.get('remaining_attempts')
            })
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """
    Authenticate user with email and OTP.
    
    Returns:
        JSON response with authentication result and session token
    """
    try:
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data
        try:
            login_request = LoginRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Authenticate user
        result = AuthService.authenticate_user(
            email=login_request.email,
            otp=login_request.otp
        )
        
        if result['success']:
            response_data = {
                'user_id': result['user_id'],
                'email': result['email'],
                'session_token': result['session_token']
            }
            return create_success_response(result['message'], response_data)
        else:
            return create_bad_request_response(result['message'], {
                'error': result.get('error'),
                'remaining_attempts': result.get('remaining_attempts')
            })
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """
    Logout user by invalidating session token.
    
    Returns:
        JSON response with logout result
    """
    try:
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data
        try:
            logout_request = LogoutRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Logout user
        result = AuthService.logout_user(logout_request.session_token)
        
        if result['success']:
            return create_success_response(result['message'])
        else:
            return create_bad_request_response(result['message'], {
                'error': result.get('error')
            })
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/verify-session', methods=['POST'])
def verify_session():
    """
    Verify user session token.
    
    Returns:
        JSON response with session verification result
    """
    try:
        # Get session token from Authorization header or request body
        session_token = None
        
        # Try Authorization header first
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # If not in header, try request body
        if not session_token and request.is_json:
            request_data = request.get_json()
            session_token = request_data.get('session_token') or request_data.get('sessionToken')
        
        if not session_token:
            return create_bad_request_response("Session token is required in Authorization header or request body")
        
        # Verify session
        result = AuthService.verify_session(session_token)
        
        if result['valid']:
            response_data = {
                'user_id': result['user_id'],
                'email': result['email']
            }
            return create_success_response(result['message'], response_data)
        else:
            return create_bad_request_response(result['message'], {
                'error': result.get('error')
            })
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/reset-password', methods=['POST'])
def reset_password():
    """
    Reset user password using OTP verification.
    
    Returns:
        JSON response with password reset result
    """
    try:
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data
        try:
            reset_request = ResetPasswordRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Verify passwords match
        if reset_request.new_password != reset_request.confirm_new_password:
            return create_bad_request_response("New passwords do not match")
        
        # First verify the OTP for password reset
        verify_result = AuthService.verify_otp(
            email=reset_request.email,
            otp=reset_request.otp,
            purpose="password_reset"
        )
        
        if not verify_result['success']:
            return create_bad_request_response(verify_result['message'], {
                'error': verify_result.get('error'),
                'remaining_attempts': verify_result.get('remaining_attempts')
            })
        
        # Reset password (in a real app, this would update the database)
        # For now, we'll just simulate success
        return create_success_response("Password reset successfully")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/profile', methods=['GET'])
def get_profile():
    """
    Get current user profile information.
    
    Returns:
        JSON response with user profile data
    """
    try:
        # Get session token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return create_bad_request_response("Authorization header with Bearer token is required")
        
        session_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Verify session
        result = AuthService.verify_session(session_token)
        
        if result['valid']:
            response_data = {
                'user_id': result['user_id'],
                'email': result['email'],
                'session_token': session_token
            }
            return create_success_response("Profile retrieved successfully", response_data)
        else:
            return create_bad_request_response(result['message'], {
                'error': result.get('error')
            })
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/signup', methods=['POST'])
def signup():
    """
    Register a new user account.
    
    Returns:
        JSON response with signup result
    """
    try:
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data
        try:
            signup_request = SignupRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Validate email domain (campus emails only)
        allowed_domains = [
            'student.university.edu',
            'university.edu', 
            'campus.edu',
            'college.edu'
        ]
        email_domain = signup_request.email.split('@')[1].lower()
        if email_domain not in allowed_domains:
            return create_bad_request_response(
                f"Email must be from an approved campus domain: {', '.join(allowed_domains)}"
            )
        
        # Validate passwords match
        if signup_request.password != signup_request.confirm_password:
            return create_bad_request_response("Passwords do not match")
        
        # Validate terms acceptance
        if not signup_request.terms_accepted:
            return create_bad_request_response("You must accept the terms and conditions")
        
        # In a real app, this would:
        # 1. Check if email already exists
        # 2. Hash the password
        # 3. Store user in database
        # 4. Send welcome email
        
        # For now, simulate successful signup
        user_id = f"user_{signup_request.email.split('@')[0]}"
        
        return create_success_response("Account created successfully", {
            'user_id': user_id,
            'email': signup_request.email,
            'full_name': signup_request.full_name
        })
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/profile', methods=['PUT'])
def update_profile():
    """
    Update user profile information.
    
    Returns:
        JSON response with update result
    """
    try:
        # Get session token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return create_bad_request_response("Authorization header with Bearer token is required")
        
        session_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Verify session
        session_result = AuthService.verify_session(session_token)
        if not session_result['valid']:
            return create_bad_request_response(session_result['message'])
        
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data
        try:
            profile_request = UpdateProfileRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # In a real app, this would update the user profile in the database
        # For now, simulate successful update
        
        return create_success_response("Profile updated successfully")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/profile/picture', methods=['POST'])
def upload_profile_picture():
    """
    Upload user profile picture.
    
    Returns:
        JSON response with upload result
    """
    try:
        # Get session token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return create_bad_request_response("Authorization header with Bearer token is required")
        
        session_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Verify session
        session_result = AuthService.verify_session(session_token)
        if not session_result['valid']:
            return create_bad_request_response(session_result['message'])
        
        # Check if file is present
        if 'profile_picture' not in request.files:
            return create_bad_request_response("No profile picture file provided")
        
        file = request.files['profile_picture']
        if file.filename == '':
            return create_bad_request_response("No file selected")
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return create_bad_request_response("Invalid file type. Only PNG, JPG, JPEG, and WebP are allowed")
        
        # In a real app, this would:
        # 1. Validate file size
        # 2. Process/resize the image
        # 3. Upload to cloud storage (AWS S3, etc.)
        # 4. Update user profile with new picture URL
        
        # For now, simulate successful upload
        picture_url = f"https://example.com/profiles/{session_result['user_id']}.jpg"
        
        return create_success_response("Profile picture uploaded successfully", {
            'profile_picture_url': picture_url
        })
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/profile/picture', methods=['DELETE'])
def delete_profile_picture():
    """
    Delete user profile picture.
    
    Returns:
        JSON response with deletion result
    """
    try:
        # Get session token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return create_bad_request_response("Authorization header with Bearer token is required")
        
        session_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Verify session
        session_result = AuthService.verify_session(session_token)
        if not session_result['valid']:
            return create_bad_request_response(session_result['message'])
        
        # In a real app, this would:
        # 1. Delete the image file from storage
        # 2. Update user profile to remove picture URL
        
        # For now, simulate successful deletion
        return create_success_response("Profile picture deleted successfully")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@auth_bp.route('/auth/config/email', methods=['GET'])
def get_email_config():
    """
    Get email configuration status (for debugging/admin purposes).
    
    Returns:
        JSON response with email configuration validation result
    """
    try:
        result = EmailService.validate_email_configuration()
        
        if result['valid']:
            return create_success_response(result['message'], {
                'email_configured': True
            })
        else:
            return create_bad_request_response(result['message'], {
                'email_configured': False,
                'error': result.get('error'),
                'missing_configs': result.get('missing_configs')
            })
        
    except Exception as e:
        return create_internal_error_response(str(e))


# Error handlers for the auth blueprint
@auth_bp.errorhandler(404)
def auth_not_found(error):
    """Handle 404 errors for auth routes."""
    return create_bad_request_response("Authentication endpoint not found")


@auth_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for auth routes."""
    return create_bad_request_response("Method not allowed for this authentication endpoint")