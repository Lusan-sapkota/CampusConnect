"""
Groups API routes.

This module defines the Flask blueprint for group-related endpoints,
including retrieving groups and joining groups.
"""

from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from app.services.group_service import GroupService
from app.models.data_models import JoinGroupRequest, ApiResponse, ApiErrorResponse

# Create groups blueprint
groups_bp = Blueprint('groups', __name__)


@groups_bp.route('/groups', methods=['GET'])
def get_groups():
    """
    Get all groups.
    
    Returns:
        JSON response with list of groups or error message
    """
    try:
        # Get query parameters for filtering
        category = request.args.get('category')
        
        if category:
            groups = GroupService.get_groups_by_category(category)
        else:
            groups = GroupService.get_all_groups()
        
        # Convert to dict for JSON serialization
        groups_data = [group.dict() for group in groups]
        
        return jsonify({
            'success': True,
            'message': f'Groups retrieved successfully{f" for category: {category}" if category else ""}',
            'data': groups_data
        }), 200
        
    except Exception as e:
        error_response = ApiErrorResponse(
            message="Failed to retrieve groups",
            error="INTERNAL_ERROR",
            details={"error": str(e)}
        )
        return jsonify(error_response.dict()), 500


@groups_bp.route('/groups/<group_id>', methods=['GET'])
def get_group(group_id):
    """
    Get a specific group by ID.
    
    Args:
        group_id (str): The unique identifier of the group
        
    Returns:
        JSON response with group data or error message
    """
    try:
        group = GroupService.get_group_by_id(group_id)
        
        if not group:
            error_response = ApiErrorResponse(
                message=f"Group with ID {group_id} not found",
                error="NOT_FOUND"
            )
            return jsonify(error_response.dict()), 404
        
        return jsonify({
            'success': True,
            'message': 'Group retrieved successfully',
            'data': group.dict()
        }), 200
        
    except Exception as e:
        error_response = ApiErrorResponse(
            message="Failed to retrieve group",
            error="INTERNAL_ERROR",
            details={"error": str(e)}
        )
        return jsonify(error_response.dict()), 500


@groups_bp.route('/groups/<group_id>/join', methods=['POST'])
def join_group(group_id):
    """
    Join a specific group.
    
    Args:
        group_id (str): The unique identifier of the group to join
        
    Returns:
        JSON response with success message or error
    """
    try:
        # Get JSON data from request
        if not request.is_json:
            error_response = ApiErrorResponse(
                message="Request must be JSON",
                error="BAD_REQUEST"
            )
            return jsonify(error_response.dict()), 400
        
        request_data = request.get_json()
        
        # Validate request data using Pydantic model
        try:
            join_request = JoinGroupRequest(**request_data)
        except ValidationError as e:
            error_response = ApiErrorResponse(
                message="Invalid request data",
                error="VALIDATION_ERROR",
                details={"validation_errors": e.errors()}
            )
            return jsonify(error_response.dict()), 400
        
        # Process join request
        result = GroupService.join_group(group_id, join_request)
        
        if result.success:
            return jsonify(result.dict()), 200
        else:
            return jsonify(result.dict()), 400
            
    except Exception as e:
        error_response = ApiErrorResponse(
            message="Failed to join group",
            error="INTERNAL_ERROR",
            details={"error": str(e)}
        )
        return jsonify(error_response.dict()), 500


@groups_bp.errorhandler(404)
def group_not_found(error):
    """Handle 404 errors for group routes."""
    error_response = ApiErrorResponse(
        message="Group endpoint not found",
        error="NOT_FOUND"
    )
    return jsonify(error_response.dict()), 404


@groups_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for group routes."""
    error_response = ApiErrorResponse(
        message="Method not allowed for this group endpoint",
        error="METHOD_NOT_ALLOWED"
    )
    return jsonify(error_response.dict()), 405