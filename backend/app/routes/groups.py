"""
Groups API routes.

This module defines the Flask blueprint for group-related endpoints,
including retrieving groups and joining groups.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.services.group_service import GroupService
from app.models.data_models import JoinGroupRequest
from app.utils.helpers import (
    create_success_response,
    create_validation_error_response,
    create_not_found_response,
    create_internal_error_response,
    create_bad_request_response,
    handle_request_validation,
    format_list_response,
    format_single_item_response
)

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
            message = f"Groups for category '{category}' retrieved successfully"
        else:
            groups = GroupService.get_all_groups()
            message = "Groups retrieved successfully"
        
        return format_list_response(groups, message=message, resource_name="groups")
        
    except Exception as e:
        return create_internal_error_response(str(e))


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
            return create_not_found_response("Group", group_id)
        
        return format_single_item_response(group, resource_name="group")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@groups_bp.route('/groups', methods=['POST'])
def create_group():
    """
    Create a new group.
    
    Returns:
        JSON response with created group data or error message
    """
    try:
        # TODO: Add authentication check to get user_id
        user_id = request.headers.get('X-User-ID', 'user-1')  # Temporary
        
        # Handle both JSON and FormData
        if request.is_json:
            request_data = request.get_json()
        else:
            # Convert FormData to dict
            request_data = request.form.to_dict()
        
        # Validate request data using Pydantic model
        try:
            from app.models.data_models import CreateGroupRequest
            create_request = CreateGroupRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Process create request
        result = GroupService.create_group(create_request, user_id)
        
        if result.success:
            return create_success_response(result.message, result.data, 201)
        else:
            return create_bad_request_response(result.message, result.details)
            
    except Exception as e:
        return create_internal_error_response(str(e))


@groups_bp.route('/groups/<group_id>', methods=['PUT'])
def update_group(group_id):
    """
    Update an existing group.
    
    Args:
        group_id (str): The unique identifier of the group to update
        
    Returns:
        JSON response with updated group data or error message
    """
    try:
        # TODO: Add authentication check
        # TODO: Implement group update logic
        return create_success_response("Group update not yet implemented", {}, 501)
        
    except Exception as e:
        return create_internal_error_response(str(e))


@groups_bp.route('/groups/<group_id>', methods=['DELETE'])
def delete_group(group_id):
    """
    Delete a group.
    
    Args:
        group_id (str): The unique identifier of the group to delete
        
    Returns:
        JSON response with success message or error
    """
    try:
        # TODO: Add authentication check
        # TODO: Implement group deletion logic
        return create_success_response("Group deletion not yet implemented", {}, 501)
        
    except Exception as e:
        return create_internal_error_response(str(e))


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
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data using Pydantic model
        try:
            join_request = JoinGroupRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Process join request
        result = GroupService.join_group(group_id, join_request)
        
        if result.success:
            return create_success_response(result.message, result.data, 200)
        else:
            return create_bad_request_response(result.message, result.details)
            
    except Exception as e:
        return create_internal_error_response(str(e))


@groups_bp.route('/groups/<group_id>/leave', methods=['POST'])
def leave_group(group_id):
    """
    Leave a specific group.
    
    Args:
        group_id (str): The unique identifier of the group to leave
        
    Returns:
        JSON response with success message or error
    """
    try:
        # TODO: Add authentication check to get user_id
        # TODO: Implement leave group logic
        return create_success_response("Group leave not yet implemented", {}, 501)
        
    except Exception as e:
        return create_internal_error_response(str(e))


@groups_bp.errorhandler(404)
def group_not_found(error):
    """Handle 404 errors for group routes."""
    return create_not_found_response("Groups endpoint")


@groups_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for group routes."""
    return create_bad_request_response("Method not allowed for this groups endpoint")