"""
Authentication service with OTP-based email verification.

This module provides authentication functionality including user registration,
login, OTP generation and verification, and integration with the email service.
"""

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from flask import current_app
from app.services.email_service import EmailService
from app.models.data_models import ApiResponse
import logging

# Set up logging
logger = logging.getLogger(__name__)


class AuthService:
    """Service class for handling authentication operations."""
    
    # In-memory storage for OTPs (in production, use Redis or database)
    _otp_storage = {}
    _user_sessions = {}
    
    @staticmethod
    def generate_user_id(email: str) -> str:
        """
        Generate a unique user ID based on email.
        
        Args:
            email (str): User email address
            
        Returns:
            str: Generated user ID
        """
        # Create a hash of the email with a salt for uniqueness
        salt = current_app.config.get('SECRET_KEY', 'default-salt')
        user_data = f"{email}{salt}".encode('utf-8')
        user_id = hashlib.sha256(user_data).hexdigest()[:16]
        return user_id
    
    @staticmethod
    def is_valid_email_domain(email: str) -> bool:
        """
        Check if email domain is allowed for registration.
        
        Args:
            email (str): Email address to validate
            
        Returns:
            bool: True if domain is allowed, False otherwise
        """
        allowed_domains = current_app.config.get('ALLOWED_EMAIL_DOMAINS', ['.edu'])
        
        for domain in allowed_domains:
            if email.lower().endswith(domain.lower()):
                return True
        
        return False
    
    @staticmethod
    def store_otp(email: str, otp: str, purpose: str = "authentication") -> Dict[str, Any]:
        """
        Store OTP with expiry time for later verification.
        
        Args:
            email (str): User email address
            otp (str): OTP code
            purpose (str): Purpose of the OTP
            
        Returns:
            Dict[str, Any]: Storage result
        """
        try:
            expiry_minutes = current_app.config.get('OTP_EXPIRY_MINUTES', 10)
            expiry_time = datetime.utcnow() + timedelta(minutes=expiry_minutes)
            
            # Create storage key
            storage_key = f"{email}:{purpose}"
            
            # Store OTP data
            AuthService._otp_storage[storage_key] = {
                'otp': otp,
                'email': email,
                'purpose': purpose,
                'created_at': datetime.utcnow(),
                'expires_at': expiry_time,
                'attempts': 0,
                'max_attempts': 3
            }
            
            logger.info(f"OTP stored for {email} with purpose {purpose}")
            
            return {
                'success': True,
                'message': 'OTP stored successfully',
                'expiry_time': expiry_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to store OTP for {email}: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to store OTP',
                'error': str(e)
            }
    
    @staticmethod
    def verify_otp(email: str, otp: str, purpose: str = "authentication") -> Dict[str, Any]:
        """
        Verify OTP for the given email and purpose.
        
        Args:
            email (str): User email address
            otp (str): OTP code to verify
            purpose (str): Purpose of the OTP
            
        Returns:
            Dict[str, Any]: Verification result
        """
        try:
            storage_key = f"{email}:{purpose}"
            
            # Check if OTP exists
            if storage_key not in AuthService._otp_storage:
                return {
                    'success': False,
                    'message': 'No OTP found for this email and purpose',
                    'error': 'OTP_NOT_FOUND'
                }
            
            otp_data = AuthService._otp_storage[storage_key]
            
            # Check if OTP has expired
            if datetime.utcnow() > otp_data['expires_at']:
                # Clean up expired OTP
                del AuthService._otp_storage[storage_key]
                return {
                    'success': False,
                    'message': 'OTP has expired',
                    'error': 'OTP_EXPIRED'
                }
            
            # Check attempt limit
            if otp_data['attempts'] >= otp_data['max_attempts']:
                # Clean up OTP after max attempts
                del AuthService._otp_storage[storage_key]
                return {
                    'success': False,
                    'message': 'Maximum OTP verification attempts exceeded',
                    'error': 'MAX_ATTEMPTS_EXCEEDED'
                }
            
            # Increment attempt counter
            otp_data['attempts'] += 1
            
            # Verify OTP
            if otp_data['otp'] == otp:
                # OTP is correct - clean up and return success
                del AuthService._otp_storage[storage_key]
                
                logger.info(f"OTP verified successfully for {email}")
                
                return {
                    'success': True,
                    'message': 'OTP verified successfully',
                    'user_id': AuthService.generate_user_id(email),
                    'email': email
                }
            else:
                # OTP is incorrect
                remaining_attempts = otp_data['max_attempts'] - otp_data['attempts']
                
                return {
                    'success': False,
                    'message': f'Invalid OTP. {remaining_attempts} attempts remaining',
                    'error': 'INVALID_OTP',
                    'remaining_attempts': remaining_attempts
                }
                
        except Exception as e:
            logger.error(f"Error verifying OTP for {email}: {str(e)}")
            return {
                'success': False,
                'message': 'OTP verification failed',
                'error': 'VERIFICATION_ERROR',
                'details': str(e)
            }
    
    @staticmethod
    def send_authentication_otp(email: str, user_name: str = None) -> Dict[str, Any]:
        """
        Send authentication OTP to user email.
        
        Args:
            email (str): User email address
            user_name (str, optional): User name for personalization
            
        Returns:
            Dict[str, Any]: Result of OTP sending operation
        """
        try:
            # Validate email domain
            if not AuthService.is_valid_email_domain(email):
                allowed_domains = current_app.config.get('ALLOWED_EMAIL_DOMAINS', ['.edu'])
                return {
                    'success': False,
                    'message': f'Email domain not allowed. Please use an email from: {", ".join(allowed_domains)}',
                    'error': 'INVALID_EMAIL_DOMAIN'
                }
            
            # Extract name from email if not provided
            if user_name is None:
                user_name = email.split('@')[0].replace('.', ' ').title()
            
            # Generate and send OTP
            otp_result = EmailService.send_otp_email(
                to_email=email,
                recipient_name=user_name,
                purpose="authentication"
            )
            
            if otp_result['success']:
                # Store OTP for verification
                store_result = AuthService.store_otp(
                    email=email,
                    otp=otp_result['otp'],
                    purpose="authentication"
                )
                
                if store_result['success']:
                    return {
                        'success': True,
                        'message': f'Authentication code sent to {email}',
                        'expiry_minutes': otp_result['expiry_minutes']
                    }
                else:
                    return {
                        'success': False,
                        'message': 'Failed to process authentication request',
                        'error': 'OTP_STORAGE_FAILED'
                    }
            else:
                return otp_result
                
        except Exception as e:
            logger.error(f"Error sending authentication OTP to {email}: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to send authentication code',
                'error': 'AUTH_SERVICE_ERROR',
                'details': str(e)
            }
    
    @staticmethod
    def send_password_reset_otp(email: str, user_name: str = None) -> Dict[str, Any]:
        """
        Send password reset OTP to user email.
        
        Args:
            email (str): User email address
            user_name (str, optional): User name for personalization
            
        Returns:
            Dict[str, Any]: Result of OTP sending operation
        """
        try:
            # Extract name from email if not provided
            if user_name is None:
                user_name = email.split('@')[0].replace('.', ' ').title()
            
            # Generate and send OTP
            otp_result = EmailService.send_otp_email(
                to_email=email,
                recipient_name=user_name,
                purpose="password reset"
            )
            
            if otp_result['success']:
                # Store OTP for verification
                store_result = AuthService.store_otp(
                    email=email,
                    otp=otp_result['otp'],
                    purpose="password_reset"
                )
                
                if store_result['success']:
                    return {
                        'success': True,
                        'message': f'Password reset code sent to {email}',
                        'expiry_minutes': otp_result['expiry_minutes']
                    }
                else:
                    return {
                        'success': False,
                        'message': 'Failed to process password reset request',
                        'error': 'OTP_STORAGE_FAILED'
                    }
            else:
                return otp_result
                
        except Exception as e:
            logger.error(f"Error sending password reset OTP to {email}: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to send password reset code',
                'error': 'AUTH_SERVICE_ERROR',
                'details': str(e)
            }
    
    @staticmethod
    def authenticate_user(email: str, otp: str) -> Dict[str, Any]:
        """
        Authenticate user with email and OTP.
        
        Args:
            email (str): User email address
            otp (str): OTP code
            
        Returns:
            Dict[str, Any]: Authentication result
        """
        try:
            # Verify OTP
            verification_result = AuthService.verify_otp(email, otp, "authentication")
            
            if verification_result['success']:
                # Generate session token (in production, use JWT)
                session_token = secrets.token_urlsafe(32)
                user_id = verification_result['user_id']
                
                # Store session
                AuthService._user_sessions[session_token] = {
                    'user_id': user_id,
                    'email': email,
                    'created_at': datetime.utcnow(),
                    'expires_at': datetime.utcnow() + timedelta(hours=24)
                }
                
                logger.info(f"User authenticated successfully: {email}")
                
                return {
                    'success': True,
                    'message': 'Authentication successful',
                    'user_id': user_id,
                    'email': email,
                    'session_token': session_token
                }
            else:
                return verification_result
                
        except Exception as e:
            logger.error(f"Error authenticating user {email}: {str(e)}")
            return {
                'success': False,
                'message': 'Authentication failed',
                'error': 'AUTH_ERROR',
                'details': str(e)
            }
    
    @staticmethod
    def verify_session(session_token: str) -> Dict[str, Any]:
        """
        Verify user session token.
        
        Args:
            session_token (str): Session token to verify
            
        Returns:
            Dict[str, Any]: Session verification result
        """
        try:
            if session_token not in AuthService._user_sessions:
                return {
                    'valid': False,
                    'message': 'Invalid session token',
                    'error': 'INVALID_SESSION'
                }
            
            session_data = AuthService._user_sessions[session_token]
            
            # Check if session has expired
            if datetime.utcnow() > session_data['expires_at']:
                # Clean up expired session
                del AuthService._user_sessions[session_token]
                return {
                    'valid': False,
                    'message': 'Session has expired',
                    'error': 'SESSION_EXPIRED'
                }
            
            return {
                'valid': True,
                'message': 'Session is valid',
                'user_id': session_data['user_id'],
                'email': session_data['email']
            }
            
        except Exception as e:
            logger.error(f"Error verifying session: {str(e)}")
            return {
                'valid': False,
                'message': 'Session verification failed',
                'error': 'SESSION_ERROR',
                'details': str(e)
            }
    
    @staticmethod
    def logout_user(session_token: str) -> Dict[str, Any]:
        """
        Logout user by invalidating session token.
        
        Args:
            session_token (str): Session token to invalidate
            
        Returns:
            Dict[str, Any]: Logout result
        """
        try:
            if session_token in AuthService._user_sessions:
                del AuthService._user_sessions[session_token]
                return {
                    'success': True,
                    'message': 'Logged out successfully'
                }
            else:
                return {
                    'success': False,
                    'message': 'Invalid session token',
                    'error': 'INVALID_SESSION'
                }
                
        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
            return {
                'success': False,
                'message': 'Logout failed',
                'error': 'LOGOUT_ERROR',
                'details': str(e)
            }
    
    @staticmethod
    def cleanup_expired_data():
        """
        Clean up expired OTPs and sessions.
        This should be called periodically (e.g., via a background task).
        """
        try:
            current_time = datetime.utcnow()
            
            # Clean up expired OTPs
            expired_otps = [
                key for key, data in AuthService._otp_storage.items()
                if current_time > data['expires_at']
            ]
            
            for key in expired_otps:
                del AuthService._otp_storage[key]
            
            # Clean up expired sessions
            expired_sessions = [
                token for token, data in AuthService._user_sessions.items()
                if current_time > data['expires_at']
            ]
            
            for token in expired_sessions:
                del AuthService._user_sessions[token]
            
            logger.info(f"Cleaned up {len(expired_otps)} expired OTPs and {len(expired_sessions)} expired sessions")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")