"""
Events API blueprint providing RESTful endpoints for event operations.

This module defines the Flask blueprint for event-related API endpoints
including retrieving events, getting individual events, and joining events.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.services.event_service import EventService
from app.models.data_models import JoinEventRequest
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

# Create the events blueprint
events_bp = Blueprint('events', __name__)


@events_bp.route('/events', methods=['GET'])
def get_all_events():
    """
    Get all available events.
    
    Returns:
        JSON response with list of all events
    """
    try:
        events = EventService.get_all_events()
        return format_list_response(events, resource_name="events")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@events_bp.route('/events/<event_id>', methods=['GET'])
def get_event_by_id(event_id):
    """
    Get a specific event by its ID.
    
    Args:
        event_id (str): The unique identifier of the event
        
    Returns:
        JSON response with the event data or error message
    """
    try:
        event = EventService.get_event_by_id(event_id)
        
        if not event:
            return create_not_found_response("Event", event_id)
        
        return format_single_item_response(event, resource_name="event")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@events_bp.route('/events/<event_id>/join', methods=['POST'])
def join_event(event_id):
    """
    Join a specific event.
    
    Args:
        event_id (str): The unique identifier of the event to join
        
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
            join_request = JoinEventRequest(**request_data)
        except ValidationError as ve:
            return create_validation_error_response(ve.errors())
        
        # Process the join request
        result = EventService.join_event(event_id, join_request)
        
        # Return appropriate status code based on result
        if result.success:
            return create_success_response(result.message, result.data, 200)
        else:
            return create_bad_request_response(result.message, result.details)
        
    except Exception as e:
        return create_internal_error_response(str(e))


@events_bp.route('/events/category/<category>', methods=['GET'])
def get_events_by_category(category):
    """
    Get events filtered by category.
    
    Args:
        category (str): The category to filter by
        
    Returns:
        JSON response with filtered events
    """
    try:
        # Validate category
        valid_categories = ['academic', 'social', 'sports', 'arts', 'career']
        if category not in valid_categories:
            return create_bad_request_response(
                f'Invalid category. Must be one of: {", ".join(valid_categories)}',
                {"valid_categories": valid_categories}
            )
        
        events = EventService.get_events_by_category(category)
        
        return format_list_response(
            events,
            message=f"Events in category '{category}' retrieved successfully",
            resource_name="events"
        )
        
    except Exception as e:
        return create_internal_error_response(str(e))


# Error handlers for the events blueprint
@events_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors for events endpoints."""
    return create_not_found_response("Events endpoint")


@events_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for events endpoints."""
    return create_bad_request_response("Method not allowed for this events endpoint")