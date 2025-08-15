"""
Authentication API blueprint providing RESTful endpoints for user operations.

This module defines the Flask blueprint for authentication-related API endpoints
including user registration, login, profile management, and password operations.
"""

from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from functools import wraps
import logging

from app.services.auth_service import AuthService
from app.models.auth_models import (
    UserCreate, UserLogin, UserUpdate, ChangePasswordRequest,
    AuthResponse, AuthErrorResponse, TokenResponse
)

# Create the auth blueprint
auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)


def token_required(f):
    """
    Decorator to require valid JWT token for protected endpoints.
    
    Args:
        f: The function to decorate
        
    Returns:
        Decorated function that validates JWT token
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid authorization header format',
                    'error': 'INVALID_TOKEN_FORMAT'
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Authorization token is required',
                'error': 'TOKEN_MISSING'
            }), 401
        
        # Verify token
        payload = AuthService.verify_access_token(token)
        if not payload:
            return jsonify({
                'success': False,
                'message': 'Invalid or expired token',
                'error': 'TOKEN_INVALID'
            }), 401
        
        # Add user info to request context
        request.current_user = payload
        return f(*args, **kwargs)
    
    return decorated


@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """
    Register a new user account.
    
    Returns:
        JSON response with registration result
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'Request must be JSON',
                'error': 'BAD_REQUEST'
            }), 400
        
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                'success': False,
                'message': 'Request body is required',
                'error': 'BAD_REQUEST'
            }), 400
        
        # Validate request data using Pydantic model
        try:
            user_data = UserCreate(**request_data)
        except ValidationError as ve:
            return jsonify({
                'success': False,
                'message': 'Invalid request data',
                'error': 'VALIDATION_ERROR',
                'details': {'validation_errors': ve.errors()}
            }), 400
        
        # Create user
        success, message, user_response = AuthService.create_user(user_data)
        
        if not success:
            return jsonify({
                'success': False,
                'message': message,
                'error': 'REGISTRATION_FAILED'
            }), 400
        
        # Generate access token
        access_token = AuthService.generate_access_token(user_response)
        
        # Create response
        token_response = TokenResponse(
            access_token=access_token,
            expires_in=3600,  # 1 hour
            user=user_response
        )
        
        response = AuthResponse(
            success=True,
            message="User registered successfully",
            data=token_response
        )
        
        return jsonify(response.dict()), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Registration failed',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """
    Authenticate user and return access token.
    
    Returns:
        JSON response with authentication result
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'Request must be JSON',
                'error': 'BAD_REQUEST'
            }), 400
        
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                'success': False,
                'message': 'Request body is required',
                'error': 'BAD_REQUEST'
            }), 400
        
        # Validate request data using Pydantic model
        try:
            login_data = UserLogin(**request_data)
        except ValidationError as ve:
            return jsonify({
                'success': False,
                'message': 'Invalid request data',
                'error': 'VALIDATION_ERROR',
                'details': {'validation_errors': ve.errors()}
            }), 400
        
        # Authenticate user
        success, message, user_response = AuthService.authenticate_user(login_data)
        
        if not success:
            return jsonify({
                'success': False,
                'message': message,
                'error': 'AUTHENTICATION_FAILED'
            }), 401
        
        # Generate access token
        access_token = AuthService.generate_access_token(user_response)
        
        # Create response
        token_response = TokenResponse(
            access_token=access_token,
            expires_in=3600,  # 1 hour
            user=user_response
        )
        
        response = AuthResponse(
            success=True,
            message="Login successful",
            data=token_response
        )
        
        return jsonify(response.dict()), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Login failed',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


@auth_bp.route('/auth/profile', methods=['GET'])
@token_required
def get_profile():
    """
    Get current user profile information.
    
    Returns:
        JSON response with user profile data
    """
    try:
        user_id = request.current_user['user_id']
        user_response = AuthService.get_user_by_id(user_id)
        
        if not user_response:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'error': 'USER_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Profile retrieved successfully',
            'data': user_response.dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve profile',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


@auth_bp.route('/auth/profile', methods=['PUT'])
@token_required
def update_profile():
    """
    Update current user profile information.
    
    Returns:
        JSON response with updated profile data
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'Request must be JSON',
                'error': 'BAD_REQUEST'
            }), 400
        
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                'success': False,
                'message': 'Request body is required',
                'error': 'BAD_REQUEST'
            }), 400
        
        # Validate request data using Pydantic model
        try:
            update_data = UserUpdate(**request_data)
        except ValidationError as ve:
            return jsonify({
                'success': False,
                'message': 'Invalid request data',
                'error': 'VALIDATION_ERROR',
                'details': {'validation_errors': ve.errors()}
            }), 400
        
        # Update user
        user_id = request.current_user['user_id']
        success, message, user_response = AuthService.update_user(user_id, update_data)
        
        if not success:
            return jsonify({
                'success': False,
                'message': message,
                'error': 'UPDATE_FAILED'
            }), 400
        
        return jsonify({
            'success': True,
            'message': message,
            'data': user_response.dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Update profile error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to update profile',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


@auth_bp.route('/auth/change-password', methods=['POST'])
@token_required
def change_password():
    """
    Change current user password.
    
    Returns:
        JSON response with password change result
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'Request must be JSON',
                'error': 'BAD_REQUEST'
            }), 400
        
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                'success': False,
                'message': 'Request body is required',
                'error': 'BAD_REQUEST'
            }), 400
        
        # Validate request data using Pydantic model
        try:
            password_data = ChangePasswordRequest(**request_data)
        except ValidationError as ve:
            return jsonify({
                'success': False,
                'message': 'Invalid request data',
                'error': 'VALIDATION_ERROR',
                'details': {'validation_errors': ve.errors()}
            }), 400
        
        # Change password
        user_id = request.current_user['user_id']
        success, message = AuthService.change_password(user_id, password_data)
        
        if not success:
            return jsonify({
                'success': False,
                'message': message,
                'error': 'PASSWORD_CHANGE_FAILED'
            }), 400
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to change password',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


@auth_bp.route('/auth/verify-token', methods=['POST'])
def verify_token():
    """
    Verify if a JWT token is valid.
    
    Returns:
        JSON response with token verification result
    """
    try:
        # Get token from request
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'Request must be JSON',
                'error': 'BAD_REQUEST'
            }), 400
        
        request_data = request.get_json()
        token = request_data.get('token')
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token is required',
                'error': 'TOKEN_MISSING'
            }), 400
        
        # Verify token
        payload = AuthService.verify_access_token(token)
        
        if not payload:
            return jsonify({
                'success': False,
                'message': 'Invalid or expired token',
                'error': 'TOKEN_INVALID'
            }), 401
        
        # Get user data
        user_response = AuthService.get_user_by_id(payload['user_id'])
        
        if not user_response:
            return jsonify({
                'success': False,
                'message': 'User not found',
                'error': 'USER_NOT_FOUND'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Token is valid',
            'data': {
                'user': user_response.dict(),
                'expires_at': payload['exp']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Token verification failed',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


# Error handlers for the auth blueprint
@auth_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors for auth endpoints."""
    return jsonify({
        'success': False,
        'message': 'Endpoint not found',
        'error': 'NOT_FOUND'
    }), 404


@auth_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for auth endpoints."""
    return jsonify({
        'success': False,
        'message': 'Method not allowed for this endpoint',
        'error': 'METHOD_NOT_ALLOWED'
    }), 405
