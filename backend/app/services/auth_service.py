"""
Authentication service module.

This module provides business logic for user authentication operations
including registration, login, password management, and user data operations.
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Optional, Tuple
import jwt
from datetime import datetime, timedelta
import logging

from app.models.auth_models import User, UserCreate, UserLogin, UserResponse, UserUpdate, ChangePasswordRequest
from app.database import get_db
from app.config import config

logger = logging.getLogger(__name__)


class AuthService:
    """Service class for authentication operations."""
    
    @staticmethod
    def create_user(user_data: UserCreate) -> Tuple[bool, str, Optional[UserResponse]]:
        """
        Create a new user account.
        
        Args:
            user_data (UserCreate): User registration data
            
        Returns:
            Tuple[bool, str, Optional[UserResponse]]: (success, message, user_data)
        """
        try:
            with get_db() as db:
                # Check if user already exists
                existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
                if existing_user:
                    return False, "User with this email already exists", None
                
                # Hash the password
                password_hash = generate_password_hash(user_data.password)
                
                # Create new user
                db_user = User(
                    full_name=user_data.full_name,
                    email=user_data.email.lower(),
                    password_hash=password_hash,
                    is_active=True,
                    is_verified=False  # Email verification can be implemented later
                )
                
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                
                # Convert to response model
                user_response = UserResponse.from_orm(db_user)
                
                logger.info(f"User created successfully: {user_data.email}")
                return True, "User created successfully", user_response
                
        except IntegrityError as e:
            logger.error(f"Database integrity error during user creation: {str(e)}")
            return False, "User with this email already exists", None
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return False, "Failed to create user account", None
    
    @staticmethod
    def authenticate_user(login_data: UserLogin) -> Tuple[bool, str, Optional[UserResponse]]:
        """
        Authenticate user credentials.
        
        Args:
            login_data (UserLogin): User login credentials
            
        Returns:
            Tuple[bool, str, Optional[UserResponse]]: (success, message, user_data)
        """
        try:
            with get_db() as db:
                # Find user by email
                user = db.query(User).filter(User.email == login_data.email.lower()).first()
                
                if not user:
                    return False, "Invalid email or password", None
                
                if not user.is_active:
                    return False, "Account is deactivated", None
                
                # Check password
                if not check_password_hash(user.password_hash, login_data.password):
                    return False, "Invalid email or password", None
                
                # Convert to response model
                user_response = UserResponse.from_orm(user)
                
                logger.info(f"User authenticated successfully: {login_data.email}")
                return True, "Authentication successful", user_response
                
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return False, "Authentication failed", None
    
    @staticmethod
    def generate_access_token(user: UserResponse, config_name: str = 'development') -> str:
        """
        Generate JWT access token for authenticated user.
        
        Args:
            user (UserResponse): Authenticated user data
            config_name (str): Configuration environment name
            
        Returns:
            str: JWT access token
        """
        try:
            app_config = config[config_name]
            
            # Token payload
            payload = {
                'user_id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'exp': datetime.utcnow() + timedelta(seconds=app_config.JWT_ACCESS_TOKEN_EXPIRES),
                'iat': datetime.utcnow(),
                'type': 'access'
            }
            
            # Generate token
            token = jwt.encode(payload, app_config.JWT_SECRET_KEY, algorithm='HS256')
            
            return token
            
        except Exception as e:
            logger.error(f"Error generating access token: {str(e)}")
            raise
    
    @staticmethod
    def verify_access_token(token: str, config_name: str = 'development') -> Optional[dict]:
        """
        Verify and decode JWT access token.
        
        Args:
            token (str): JWT access token
            config_name (str): Configuration environment name
            
        Returns:
            Optional[dict]: Decoded token payload or None if invalid
        """
        try:
            app_config = config[config_name]
            
            # Decode token
            payload = jwt.decode(token, app_config.JWT_SECRET_KEY, algorithms=['HS256'])
            
            # Verify token type
            if payload.get('type') != 'access':
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("Access token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid access token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying access token: {str(e)}")
            return None
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[UserResponse]:
        """
        Get user by ID.
        
        Args:
            user_id (int): User ID
            
        Returns:
            Optional[UserResponse]: User data or None if not found
        """
        try:
            with get_db() as db:
                user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
                
                if not user:
                    return None
                
                return UserResponse.from_orm(user)
                
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[UserResponse]:
        """
        Get user by email.
        
        Args:
            email (str): User email
            
        Returns:
            Optional[UserResponse]: User data or None if not found
        """
        try:
            with get_db() as db:
                user = db.query(User).filter(User.email == email.lower(), User.is_active == True).first()
                
                if not user:
                    return None
                
                return UserResponse.from_orm(user)
                
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            return None
    
    @staticmethod
    def update_user(user_id: int, update_data: UserUpdate) -> Tuple[bool, str, Optional[UserResponse]]:
        """
        Update user information.
        
        Args:
            user_id (int): User ID
            update_data (UserUpdate): Updated user data
            
        Returns:
            Tuple[bool, str, Optional[UserResponse]]: (success, message, user_data)
        """
        try:
            with get_db() as db:
                user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
                
                if not user:
                    return False, "User not found", None
                
                # Update fields if provided
                if update_data.full_name is not None:
                    user.full_name = update_data.full_name
                
                if update_data.email is not None:
                    # Check if email is already taken by another user
                    existing_user = db.query(User).filter(
                        User.email == update_data.email.lower(),
                        User.id != user_id
                    ).first()
                    
                    if existing_user:
                        return False, "Email is already taken by another user", None
                    
                    user.email = update_data.email.lower()
                    user.is_verified = False  # Reset verification status
                
                db.commit()
                db.refresh(user)
                
                user_response = UserResponse.from_orm(user)
                
                logger.info(f"User updated successfully: {user.email}")
                return True, "User updated successfully", user_response
                
        except IntegrityError as e:
            logger.error(f"Database integrity error during user update: {str(e)}")
            return False, "Email is already taken by another user", None
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return False, "Failed to update user", None
    
    @staticmethod
    def change_password(user_id: int, password_data: ChangePasswordRequest) -> Tuple[bool, str]:
        """
        Change user password.
        
        Args:
            user_id (int): User ID
            password_data (ChangePasswordRequest): Password change data
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            with get_db() as db:
                user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
                
                if not user:
                    return False, "User not found"
                
                # Verify current password
                if not check_password_hash(user.password_hash, password_data.current_password):
                    return False, "Current password is incorrect"
                
                # Hash new password
                new_password_hash = generate_password_hash(password_data.new_password)
                user.password_hash = new_password_hash
                
                db.commit()
                
                logger.info(f"Password changed successfully for user: {user.email}")
                return True, "Password changed successfully"
                
        except Exception as e:
            logger.error(f"Error changing password: {str(e)}")
            return False, "Failed to change password"
    
    @staticmethod
    def deactivate_user(user_id: int) -> Tuple[bool, str]:
        """
        Deactivate user account.
        
        Args:
            user_id (int): User ID
            
        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            with get_db() as db:
                user = db.query(User).filter(User.id == user_id).first()
                
                if not user:
                    return False, "User not found"
                
                user.is_active = False
                db.commit()
                
                logger.info(f"User deactivated: {user.email}")
                return True, "User account deactivated successfully"
                
        except Exception as e:
            logger.error(f"Error deactivating user: {str(e)}")
            return False, "Failed to deactivate user account"
