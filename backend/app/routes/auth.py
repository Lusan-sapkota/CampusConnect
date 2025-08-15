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