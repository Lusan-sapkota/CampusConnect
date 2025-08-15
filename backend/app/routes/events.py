"""
Events API blueprint providing RESTful endpoints for event operations.

This module defines the Flask blueprint for event-related API endpoints
including retrieving events, getting individual events, and joining events.
"""

from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from app.services.event_service import EventService
from app.models.data_models import JoinEventRequest, ApiResponse, EventListResponse, EventResponse

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
        
        # Convert Pydantic models to dictionaries for JSON serialization
        events_data = [event.dict() for event in events]
        
        response = EventListResponse(data=events_data)
        return jsonify(response.dict()), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve events',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


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
            return jsonify({
                'success': False,
                'message': f'Event with ID {event_id} not found',
                'error': 'NOT_FOUND'
            }), 404
        
        response = EventResponse(data=event.dict())
        return jsonify(response.dict()), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve event',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


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
        # Get JSON data from request
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
            join_request = JoinEventRequest(**request_data)
        except ValidationError as ve:
            return jsonify({
                'success': False,
                'message': 'Invalid request data',
                'error': 'VALIDATION_ERROR',
                'details': {'validation_errors': ve.errors()}
            }), 400
        
        # Process the join request
        result = EventService.join_event(event_id, join_request)
        
        # Return appropriate status code based on result
        status_code = 200 if result.success else 400
        return jsonify(result.dict()), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to join event',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


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
            return jsonify({
                'success': False,
                'message': f'Invalid category. Must be one of: {", ".join(valid_categories)}',
                'error': 'BAD_REQUEST'
            }), 400
        
        events = EventService.get_events_by_category(category)
        events_data = [event.dict() for event in events]
        
        response = EventListResponse(
            message=f"Events in category '{category}' retrieved successfully",
            data=events_data
        )
        return jsonify(response.dict()), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve events by category',
            'error': 'INTERNAL_ERROR',
            'details': {'error': str(e)}
        }), 500


# Error handlers for the events blueprint
@events_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors for events endpoints."""
    return jsonify({
        'success': False,
        'message': 'Endpoint not found',
        'error': 'NOT_FOUND'
    }), 404


@events_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for events endpoints."""
    return jsonify({
        'success': False,
        'message': 'Method not allowed for this endpoint',
        'error': 'METHOD_NOT_ALLOWED'
    }), 405