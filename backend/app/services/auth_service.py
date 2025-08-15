"""
Authentication service for user management, signup, login, and profile operations.
"""

import os
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
from werkzeug.utils import secure_filename
from PIL import Image
import logging

from app.database import get_db
from app.models.auth_models import User, UserSession, OTPCode
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)

class AuthService:
    """Service class for authentication operations."""
    
    # Allowed email domains for campus
    ALLOWED_EMAIL_DOMAINS = [
        'student.university.edu',
        'university.edu',
        'campus.edu',
        'college.edu',
    ]
    
    # Profile picture settings
    UPLOAD_FOLDER = 'uploads/profile_pictures'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    @classmethod
    def _is_allowed_email_domain(cls, email: str) -> bool:
        """Check if email domain is allowed."""
        domain = email.split('@')[1].lower()
        return domain in cls.ALLOWED_EMAIL_DOMAINS
    
    @classmethod
    def _generate_otp(cls) -> str:
        """Generate a 6-digit OTP code."""
        return ''.join(secrets.choice(string.digits) for _ in range(6))
    
    @classmethod
    def _generate_session_token(cls) -> str:
        """Generate a secure session token."""
        return secrets.token_urlsafe(32)
    
    @classmethod
    def _allowed_file(cls, filename: str) -> bool:
        """Check if file extension is allowed."""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in cls.ALLOWED_EXTENSIONS
    
    @classmethod
    def _save_profile_picture(cls, file, user_id: str) -> Tuple[bool, str, Optional[str]]:
        """Save and process profile picture."""
        try:
            if not file or not cls._allowed_file(file.filename):
                return False, "Invalid file type. Only PNG, JPG, JPEG, and WebP are allowed.", None
            
            # Create upload directory if it doesn't exist
            os.makedirs(cls.UPLOAD_FOLDER, exist_ok=True)
            
            # Generate secure filename
            filename = secure_filename(file.filename)
            name, ext = os.path.splitext(filename)
            filename = f"{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}{ext}"
            filepath = os.path.join(cls.UPLOAD_FOLDER, filename)
            
            # Save and process image
            file.save(filepath)
            
            # Resize image if needed
            with Image.open(filepath) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize to max 400x400 while maintaining aspect ratio
                img.thumbnail((400, 400), Image.Resampling.LANCZOS)
                img.save(filepath, optimize=True, quality=85)
            
            # Return relative URL for storage
            return True, "Profile picture uploaded successfully", f"/uploads/profile_pictures/{filename}"
            
        except Exception as e:
            logger.error(f"Error saving profile picture: {str(e)}")
            return False, "Failed to save profile picture", None
    
    @classmethod
    def complete_signup(cls, signup_data: Dict[str, Any], profile_picture=None) -> Dict[str, Any]:
        """
        Complete user signup with profile information.
        
        Args:
            signup_data: Dictionary containing signup information
            profile_picture: Optional file object for profile picture
            
        Returns:
            Dictionary with success status and user data or error message
        """
        try:
            with get_db() as db:
                # Validate email domain
                if not cls._is_allowed_email_domain(signup_data['email']):
                    return {
                        'success': False,
                        'message': f"Email must be from an approved campus domain: {', '.join(cls.ALLOWED_EMAIL_DOMAINS)}"
                    }
                
                # Check if user already exists
                existing_user = db.query(User).filter(User.email == signup_data['email'].lower()).first()
                if existing_user:
                    # If user exists but is not verified, allow resending OTP
                    if not existing_user.is_verified:
                        # Generate new OTP for existing unverified user
                        otp_code = cls._generate_otp()
                        otp = OTPCode(
                            user_id=existing_user.id,
                            code=otp_code,
                            purpose='signup',
                            expires_at=datetime.utcnow() + timedelta(minutes=10)
                        )
                        db.add(otp)
                        
                        # Send verification email
                        try:
                            EmailService.send_otp_email(
                                to_email=existing_user.email,
                                recipient_name=existing_user.full_name,
                                otp=otp_code,
                                purpose='signup'
                            )
                        except Exception as e:
                            logger.error(f"Failed to send OTP email: {str(e)}")
                        
                        db.commit()
                        
                        return {
                            'success': True,
                            'message': 'Verification code sent to your email.',
                            'user_id': existing_user.id,
                            'email': existing_user.email,
                            'otp_code': otp_code  # For development only
                        }
                    else:
                        return {
                            'success': False,
                            'message': 'An account with this email already exists and is verified. Please login instead.'
                        }
                
                # Create new user
                user = User(
                    email=signup_data['email'].lower(),
                    first_name=signup_data['first_name'].strip(),
                    last_name=signup_data['last_name'].strip(),
                    phone=signup_data.get('phone', '').strip() or None,
                    major=signup_data['major'].strip(),
                    year_of_study=signup_data['year_of_study'],
                    user_role=signup_data.get('user_role', 'student'),
                    bio=signup_data.get('bio', '').strip() or None
                )
                
                # Set password
                user.set_password(signup_data['password'])
                
                # Update full name
                user.update_full_name()
                
                # Add to database to get ID
                db.add(user)
                db.flush()  # Get the ID without committing
                
                # Handle profile picture if provided
                if profile_picture:
                    success, message, picture_url = cls._save_profile_picture(profile_picture, user.id)
                    if success:
                        user.profile_picture_url = picture_url
                        user.profile_picture_filename = picture_url.split('/')[-1]
                    else:
                        logger.warning(f"Profile picture upload failed for user {user.id}: {message}")
                
                # Generate OTP for email verification
                otp_code = cls._generate_otp()
                otp = OTPCode(
                    user_id=user.id,
                    code=otp_code,
                    purpose='signup',
                    expires_at=datetime.utcnow() + timedelta(minutes=10)
                )
                db.add(otp)
                
                # Send verification email
                try:
                    EmailService.send_otp_email(
                        to_email=user.email,
                        recipient_name=user.full_name,
                        otp=otp_code,
                        purpose='signup'
                    )
                except Exception as e:
                    logger.error(f"Failed to send OTP email: {str(e)}")
                    # Continue with signup even if email fails
                
                db.commit()
                
                logger.info(f"User created successfully: {user.email}")
                return {
                    'success': True,
                    'message': 'Account created successfully. Please check your email for verification code.',
                    'user_id': user.id,
                    'email': user.email
                }
                
        except Exception as e:
            logger.error(f"Error in complete signup: {str(e)}")
            
            # Check if it's a database initialization error
            if "Database not initialized" in str(e):
                return {
                    'success': False,
                    'message': 'Database not initialized. Please contact system administrator.',
                    'details': {'error': 'database_not_initialized'}
                }
            
            return {
                'success': False,
                'message': 'Account creation failed. Please try again.',
                'details': {'error': str(e)}
            }
    
    @classmethod
    def send_authentication_otp(cls, email: str, user_name: str = None) -> Dict[str, Any]:
        """
        Send OTP for user authentication/login.
        
        Args:
            email: User email
            user_name: User name (optional)
            
        Returns:
            Dictionary with send result
        """
        try:
            with get_db() as db:
                # Find user
                user = db.query(User).filter(User.email == email.lower()).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'User not found'
                    }
                
                # Generate OTP
                otp_code = cls._generate_otp()
                otp = OTPCode(
                    user_id=user.id,
                    code=otp_code,
                    purpose='authentication',
                    expires_at=datetime.utcnow() + timedelta(minutes=10)
                )
                db.add(otp)
                
                # Send email
                try:
                    EmailService.send_otp_email(
                        to_email=user.email,
                        recipient_name=user_name or user.full_name,
                        otp=otp_code,
                        purpose='authentication'
                    )
                except Exception as e:
                    logger.error(f"Failed to send authentication OTP email: {str(e)}")
                
                db.commit()
                
                return {
                    'success': True,
                    'message': 'Authentication code sent to your email',
                    'expiry_minutes': 10
                }
                
        except Exception as e:
            logger.error(f"Error sending authentication OTP: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to send authentication code'
            }
    
    @classmethod
    def send_password_reset_otp(cls, email: str, user_name: str = None) -> Dict[str, Any]:
        """
        Send OTP for password reset.
        
        Args:
            email: User email
            user_name: User name (optional)
            
        Returns:
            Dictionary with send result
        """
        try:
            with get_db() as db:
                # Find user
                user = db.query(User).filter(User.email == email.lower()).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'User not found'
                    }
                
                # Generate OTP
                otp_code = cls._generate_otp()
                otp = OTPCode(
                    user_id=user.id,
                    code=otp_code,
                    purpose='password_reset',
                    expires_at=datetime.utcnow() + timedelta(minutes=10)
                )
                db.add(otp)
                
                # Send email
                try:
                    EmailService.send_otp_email(
                        to_email=user.email,
                        recipient_name=user_name or user.full_name,
                        otp=otp_code,
                        purpose='password_reset'
                    )
                except Exception as e:
                    logger.error(f"Failed to send password reset OTP email: {str(e)}")
                
                db.commit()
                
                return {
                    'success': True,
                    'message': 'Password reset code sent to your email',
                    'expiry_minutes': 10
                }
                
        except Exception as e:
            logger.error(f"Error sending password reset OTP: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to send password reset code'
            }

    @classmethod
    def authenticate_with_password(cls, email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate user with email and password.
        
        Args:
            email: User email
            password: User password
            
        Returns:
            Dictionary with authentication result
        """
        try:
            with get_db() as db:
                # Find user
                user = db.query(User).filter(User.email == email.lower()).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'Invalid email or password'
                    }
                
                # Check if user is verified
                if not user.is_verified:
                    return {
                        'success': False,
                        'message': 'Please verify your email before logging in'
                    }
                
                # Check password
                if not user.check_password(password):
                    return {
                        'success': False,
                        'message': 'Invalid email or password'
                    }
                
                # Update last login
                user.last_login = datetime.utcnow()
                
                # Create session
                session_token = cls._generate_session_token()
                session = UserSession(
                    user_id=user.id,
                    session_token=session_token,
                    expires_at=datetime.utcnow() + timedelta(days=30)
                )
                db.add(session)
                
                db.commit()
                
                logger.info(f"User logged in with password: {user.email}")
                return {
                    'success': True,
                    'message': 'Login successful',
                    'user_data': user.to_dict(),
                    'session_token': session_token
                }
                
        except Exception as e:
            logger.error(f"Error in password authentication: {str(e)}")
            return {
                'success': False,
                'message': 'Authentication failed'
            }

    @classmethod
    def authenticate_with_otp(cls, email: str, otp_code: str) -> Dict[str, Any]:
        """
        Authenticate user with email and OTP.
        
        Args:
            email: User email
            otp_code: OTP code
            
        Returns:
            Dictionary with authentication result
        """
        try:
            with get_db() as db:
                # Find user
                user = db.query(User).filter(User.email == email.lower()).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'User not found'
                    }
                
                # Find valid OTP
                otp = db.query(OTPCode).filter(
                    OTPCode.user_id == user.id,
                    OTPCode.code == otp_code,
                    OTPCode.purpose == 'authentication'
                ).first()
                
                if not otp:
                    return {
                        'success': False,
                        'message': 'Invalid authentication code'
                    }
                
                if not otp.is_valid():
                    return {
                        'success': False,
                        'message': 'Authentication code has expired or been used'
                    }
                
                # Mark OTP as used
                otp.mark_as_used()
                
                # Update last login
                user.last_login = datetime.utcnow()
                
                # Create session
                session_token = cls._generate_session_token()
                session = UserSession(
                    user_id=user.id,
                    session_token=session_token,
                    expires_at=datetime.utcnow() + timedelta(days=30)
                )
                db.add(session)
                
                db.commit()
                
                logger.info(f"User logged in with OTP: {user.email}")
                return {
                    'success': True,
                    'message': 'Login successful',
                    'user_data': user.to_dict(),
                    'session_token': session_token
                }
                
        except Exception as e:
            logger.error(f"Error in OTP authentication: {str(e)}")
            return {
                'success': False,
                'message': 'Authentication failed'
            }

    @classmethod
    def verify_signup_otp(cls, email: str, otp_code: str) -> Dict[str, Any]:
        """
        Verify OTP code for signup completion.
        
        Args:
            email: User email
            otp_code: OTP code to verify
            
        Returns:
            Dictionary with verification result
        """
        try:
            with get_db() as db:
                # Find user
                user = db.query(User).filter(User.email == email.lower()).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'User not found'
                    }
                
                # Find valid OTP
                otp = db.query(OTPCode).filter(
                    OTPCode.user_id == user.id,
                    OTPCode.code == otp_code,
                    OTPCode.purpose == 'signup'
                ).first()
                
                if not otp:
                    return {
                        'success': False,
                        'message': 'Invalid verification code'
                    }
                
                if not otp.is_valid():
                    return {
                        'success': False,
                        'message': 'Verification code has expired or been used'
                    }
                
                # Mark OTP as used
                otp.mark_as_used()
                
                # Verify user account
                user.is_verified = True
                user.last_login = datetime.utcnow()
                
                # Create session
                session_token = cls._generate_session_token()
                session = UserSession(
                    user_id=user.id,
                    session_token=session_token,
                    expires_at=datetime.utcnow() + timedelta(days=30)
                )
                db.add(session)
                
                db.commit()
                
                logger.info(f"User verified and logged in: {user.email}")
                return {
                    'success': True,
                    'message': 'Account verified successfully',
                    'user_data': user.to_dict(),
                    'session_token': session_token
                }
                
        except Exception as e:
            logger.error(f"Error verifying signup OTP: {str(e)}")
            return {
                'success': False,
                'message': 'Verification failed. Please try again.'
            }
    
    @classmethod
    def authenticate_user(cls, email: str, otp: str) -> Dict[str, Any]:
        """
        Authenticate user with email and OTP.
        
        Args:
            email: User email
            otp: OTP code
            
        Returns:
            Dictionary with authentication result
        """
        try:
            with get_db() as db:
                # Find user
                user = db.query(User).filter(User.email == email.lower()).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'Invalid email or OTP'
                    }
                
                if not user.is_active:
                    return {
                        'success': False,
                        'message': 'Account is deactivated'
                    }
                
                # Find valid OTP
                otp_record = db.query(OTPCode).filter(
                    OTPCode.user_id == user.id,
                    OTPCode.code == otp,
                    OTPCode.purpose == 'login'
                ).first()
                
                if not otp_record:
                    return {
                        'success': False,
                        'message': 'Invalid email or OTP'
                    }
                
                if not otp_record.is_valid():
                    return {
                        'success': False,
                        'message': 'OTP has expired or been used'
                    }
                
                # Mark OTP as used
                otp_record.mark_as_used()
                
                # Update last login
                user.last_login = datetime.utcnow()
                
                # Create session
                session_token = cls._generate_session_token()
                session = UserSession(
                    user_id=user.id,
                    session_token=session_token,
                    expires_at=datetime.utcnow() + timedelta(days=30)
                )
                db.add(session)
                
                db.commit()
                
                logger.info(f"User authenticated successfully: {user.email}")
                return {
                    'success': True,
                    'message': 'Authentication successful',
                    'user_data': user.to_dict(),
                    'session_token': session_token
                }
                
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return {
                'success': False,
                'message': 'Authentication failed'
            }
    
    @classmethod
    def verify_session(cls, session_token: str) -> Dict[str, Any]:
        """
        Verify session token and return user data.
        
        Args:
            session_token: Session token to verify
            
        Returns:
            Dictionary with verification result and user data
        """
        try:
            with get_db() as db:
                # Find session
                session = db.query(UserSession).filter(
                    UserSession.session_token == session_token,
                    UserSession.is_active == True
                ).first()
                
                if not session:
                    return {
                        'valid': False,
                        'message': 'Invalid session token'
                    }
                
                if session.is_expired():
                    session.is_active = False
                    db.commit()
                    return {
                        'valid': False,
                        'message': 'Session expired'
                    }
                
                # Update last used
                session.last_used = datetime.utcnow()
                db.commit()
                
                user_data = session.user.to_dict()
                return {
                    'valid': True,
                    'user_data': user_data,
                    'user_id': user_data['user_id'],
                    'email': user_data['email']
                }
                
        except Exception as e:
            logger.error(f"Error verifying session: {str(e)}")
            return {
                'valid': False,
                'message': 'Session verification failed'
            }
    
    @classmethod
    def update_profile(cls, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update user profile information.
        
        Args:
            user_id: User ID
            profile_data: Dictionary containing profile updates
            
        Returns:
            Dictionary with update result
        """
        try:
            with get_db() as db:
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'User not found'
                    }
                
                # Update allowed fields
                if 'first_name' in profile_data:
                    user.first_name = profile_data['first_name'].strip()
                if 'last_name' in profile_data:
                    user.last_name = profile_data['last_name'].strip()
                if 'bio' in profile_data:
                    user.bio = profile_data['bio'].strip() or None
                if 'phone' in profile_data:
                    user.phone = profile_data['phone'].strip() or None
                if 'major' in profile_data:
                    user.major = profile_data['major'].strip()
                if 'year_of_study' in profile_data:
                    user.year_of_study = profile_data['year_of_study']
                
                # Update full name if first or last name changed
                if 'first_name' in profile_data or 'last_name' in profile_data:
                    user.update_full_name()
                
                user.updated_at = datetime.utcnow()
                db.commit()
                
                logger.info(f"Profile updated for user: {user.email}")
                return {
                    'success': True,
                    'message': 'Profile updated successfully',
                    'user_data': user.to_dict()
                }
                
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            return {
                'success': False,
                'message': 'Profile update failed'
            }
    
    @classmethod
    def upload_profile_picture(cls, user_id: str, file) -> Dict[str, Any]:
        """
        Upload and update user profile picture.
        
        Args:
            user_id: User ID
            file: File object
            
        Returns:
            Dictionary with upload result
        """
        try:
            with get_db() as db:
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'User not found'
                    }
                
                # Delete old profile picture if exists
                if user.profile_picture_filename:
                    old_path = os.path.join(cls.UPLOAD_FOLDER, user.profile_picture_filename)
                    if os.path.exists(old_path):
                        try:
                            os.remove(old_path)
                        except Exception as e:
                            logger.warning(f"Failed to delete old profile picture: {str(e)}")
                
                # Save new profile picture
                success, message, picture_url = cls._save_profile_picture(file, user_id)
                if not success:
                    return {
                        'success': False,
                        'message': message
                    }
                
                # Update user record
                user.profile_picture_url = picture_url
                user.profile_picture_filename = picture_url.split('/')[-1]
                user.updated_at = datetime.utcnow()
                db.commit()
                
                logger.info(f"Profile picture updated for user: {user.email}")
                return {
                    'success': True,
                    'message': 'Profile picture updated successfully',
                    'profile_picture_url': picture_url
                }
                
        except Exception as e:
            logger.error(f"Error uploading profile picture: {str(e)}")
            return {
                'success': False,
                'message': 'Profile picture upload failed'
            }
    
    @classmethod
    def send_login_otp(cls, email: str) -> Dict[str, Any]:
        """
        Send OTP for login.
        
        Args:
            email: User email
            
        Returns:
            Dictionary with send result
        """
        try:
            with get_db() as db:
                # Find user
                user = db.query(User).filter(User.email == email.lower()).first()
                if not user:
                    return {
                        'success': False,
                        'message': 'No account found with this email'
                    }
                
                if not user.is_active:
                    return {
                        'success': False,
                        'message': 'Account is deactivated'
                    }
                
                # Generate OTP
                otp_code = cls._generate_otp()
                otp = OTPCode(
                    user_id=user.id,
                    code=otp_code,
                    purpose='login',
                    expires_at=datetime.utcnow() + timedelta(minutes=10)
                )
                db.add(otp)
                
                # Send OTP email
                try:
                    EmailService.send_otp_email(
                        email=user.email,
                        user_name=user.full_name,
                        otp_code=otp_code,
                        purpose='login'
                    )
                except Exception as e:
                    logger.error(f"Failed to send OTP email: {str(e)}")
                    return {
                        'success': False,
                        'message': 'Failed to send verification code'
                    }
                
                db.commit()
                
                logger.info(f"Login OTP sent to: {user.email}")
                return {
                    'success': True,
                    'message': 'Verification code sent to your email'
                }
                
        except Exception as e:
            logger.error(f"Error sending login OTP: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to send verification code'
            }