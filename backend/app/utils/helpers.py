"""
Utility functions for consistent response formatting and error handling.

This module provides helper functions for creating standardized API responses,
error handling, and common utilities used across the Flask application.
"""

from flask import jsonify
from typing import Any, Dict, Optional, Union
from app.models.data_models import ApiResponse, ApiErrorResponse


def create_success_response(
    message: str,
    data: Optional[Any] = None,
    status_code: int = 200
) -> tuple:
    """
    Create a standardized success response.
    
    Args:
        message (str): Success message
        data (Any, optional): Response data
        status_code (int): HTTP status code (default: 200)
        
    Returns:
        tuple: (JSON response, status_code)
    """
    response_data = {
        'success': True,
        'message': message
    }
    
    if data is not None:
        response_data['data'] = data
    
    return jsonify(response_data), status_code


def create_error_response(
    message: str,
    error_code: str,
    status_code: int = 400,
    details: Optional[Dict[str, Any]] = None
) -> tuple:
    """
    Create a standardized error response.
    
    Args:
        message (str): Error message
        error_code (str): Error code identifier
        status_code (int): HTTP status code (default: 400)
        details (dict, optional): Additional error details
        
    Returns:
        tuple: (JSON response, status_code)
    """
    error_response = ApiErrorResponse(
        message=message,
        error=error_code,
        details=details
    )
    
    return jsonify(error_response.dict()), status_code


def create_validation_error_response(validation_errors: list) -> tuple:
    """
    Create a standardized validation error response.
    
    Args:
        validation_errors (list): List of validation errors from Pydantic
        
    Returns:
        tuple: (JSON response, status_code)
    """
    return create_error_response(
        message="Invalid request data",
        error_code="VALIDATION_ERROR",
        status_code=400,
        details={"validation_errors": validation_errors}
    )


def create_not_found_response(resource: str, resource_id: str = None) -> tuple:
    """
    Create a standardized 404 not found response.
    
    Args:
        resource (str): Name of the resource (e.g., 'Event', 'Group', 'Post')
        resource_id (str, optional): ID of the resource that wasn't found
        
    Returns:
        tuple: (JSON response, status_code)
    """
    if resource_id:
        message = f"{resource} with ID {resource_id} not found"
    else:
        message = f"{resource} not found"
    
    return create_error_response(
        message=message,
        error_code="NOT_FOUND",
        status_code=404
    )


def create_internal_error_response(error_message: str = None) -> tuple:
    """
    Create a standardized 500 internal server error response.
    
    Args:
        error_message (str, optional): Specific error message for debugging
        
    Returns:
        tuple: (JSON response, status_code)
    """
    details = None
    if error_message:
        details = {"error": error_message}
    
    return create_error_response(
        message="An internal server error occurred",
        error_code="INTERNAL_ERROR",
        status_code=500,
        details=details
    )


def create_bad_request_response(message: str, details: Optional[Dict[str, Any]] = None) -> tuple:
    """
    Create a standardized 400 bad request response.
    
    Args:
        message (str): Error message
        details (dict, optional): Additional error details
        
    Returns:
        tuple: (JSON response, status_code)
    """
    return create_error_response(
        message=message,
        error_code="BAD_REQUEST",
        status_code=400,
        details=details
    )


def create_method_not_allowed_response(allowed_methods: list = None) -> tuple:
    """
    Create a standardized 405 method not allowed response.
    
    Args:
        allowed_methods (list, optional): List of allowed HTTP methods
        
    Returns:
        tuple: (JSON response, status_code)
    """
    message = "Method not allowed for this endpoint"
    details = None
    
    if allowed_methods:
        details = {"allowed_methods": allowed_methods}
        message += f". Allowed methods: {', '.join(allowed_methods)}"
    
    return create_error_response(
        message=message,
        error_code="METHOD_NOT_ALLOWED",
        status_code=405,
        details=details
    )


def handle_request_validation(request, required_json: bool = True) -> Optional[tuple]:
    """
    Validate incoming request format and return error response if invalid.
    
    Args:
        request: Flask request object
        required_json (bool): Whether JSON content is required
        
    Returns:
        tuple or None: Error response tuple if validation fails, None if valid
    """
    if required_json:
        if not request.is_json:
            return create_bad_request_response("Request must be JSON")
        
        request_data = request.get_json()
        if not request_data:
            return create_bad_request_response("Request body is required")
    
    return None


def safe_dict_conversion(obj: Any) -> Any:
    """
    Safely convert Pydantic models to dictionaries for JSON serialization.
    
    Args:
        obj: Object to convert (can be Pydantic model, list, or other types)
        
    Returns:
        Any: Converted object suitable for JSON serialization
    """
    if hasattr(obj, 'dict'):
        # Pydantic model
        return obj.dict()
    elif isinstance(obj, list):
        # List of objects (potentially Pydantic models)
        return [safe_dict_conversion(item) for item in obj]
    elif isinstance(obj, dict):
        # Dictionary - convert values recursively
        return {key: safe_dict_conversion(value) for key, value in obj.items()}
    else:
        # Primitive type or other object
        return obj


def format_list_response(
    items: list,
    message: str = None,
    resource_name: str = "items"
) -> tuple:
    """
    Format a list of items into a standardized response.
    
    Args:
        items (list): List of items to return
        message (str, optional): Custom success message
        resource_name (str): Name of the resource for default message
        
    Returns:
        tuple: (JSON response, status_code)
    """
    if message is None:
        message = f"{resource_name.capitalize()} retrieved successfully"
    
    # Convert items to dictionaries if they're Pydantic models
    items_data = safe_dict_conversion(items)
    
    return create_success_response(
        message=message,
        data=items_data,
        status_code=200
    )


def format_single_item_response(
    item: Any,
    message: str = None,
    resource_name: str = "item"
) -> tuple:
    """
    Format a single item into a standardized response.
    
    Args:
        item: Item to return
        message (str, optional): Custom success message
        resource_name (str): Name of the resource for default message
        
    Returns:
        tuple: (JSON response, status_code)
    """
    if message is None:
        message = f"{resource_name.capitalize()} retrieved successfully"
    
    # Convert item to dictionary if it's a Pydantic model
    item_data = safe_dict_conversion(item)
    
    return create_success_response(
        message=message,
        data=item_data,
        status_code=200
    )