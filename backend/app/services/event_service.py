"""
Event service module providing business logic for event operations.

This module contains the EventService class that handles all event-related
business logic including retrieving events, joining events, and managing
event data with mock data for development.
"""

from typing import List, Optional
from app.models.data_models import Event, JoinEventRequest, ApiResponse


class EventService:
    """Service class for handling event-related business logic."""
    
    # Mock events data matching the frontend structure
    _mock_events = [
        {
            "id": "1",
            "title": "Tech Career Fair 2024",
            "description": "Connect with top tech companies and explore career opportunities in software engineering, data science, and more.",
            "date": "2024-03-15",
            "time": "10:00 AM - 4:00 PM",
            "location": "Student Union Building",
            "category": "career",
            "organizer": "Career Services",
            "attendees": 45,
            "max_attendees": 200,
            "image": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
            "tags": ["career", "networking", "technology"]
        },
        {
            "id": "2", 
            "title": "Spring Music Festival",
            "description": "Join us for an evening of live music featuring local bands and student performers.",
            "date": "2024-03-20",
            "time": "6:00 PM - 10:00 PM",
            "location": "Campus Amphitheater",
            "category": "arts",
            "organizer": "Student Activities",
            "attendees": 120,
            "max_attendees": 300,
            "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
            "tags": ["music", "entertainment", "community"]
        },
        {
            "id": "3",
            "title": "Study Abroad Information Session",
            "description": "Learn about study abroad opportunities and application processes for various international programs.",
            "date": "2024-03-18",
            "time": "2:00 PM - 3:30 PM", 
            "location": "International Center",
            "category": "academic",
            "organizer": "International Programs",
            "attendees": 28,
            "max_attendees": 50,
            "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400",
            "tags": ["education", "international", "travel"]
        },
        {
            "id": "4",
            "title": "Basketball Tournament Finals",
            "description": "Cheer on our campus teams in the final championship games of the intramural basketball season.",
            "date": "2024-03-22",
            "time": "7:00 PM - 9:00 PM",
            "location": "Recreation Center Gym",
            "category": "sports",
            "organizer": "Intramural Sports",
            "attendees": 85,
            "max_attendees": 150,
            "image": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400",
            "tags": ["sports", "competition", "community"]
        },
        {
            "id": "5",
            "title": "Mental Health Awareness Workshop",
            "description": "Interactive workshop focusing on stress management techniques and mental wellness resources.",
            "date": "2024-03-25",
            "time": "1:00 PM - 3:00 PM",
            "location": "Wellness Center",
            "category": "social",
            "organizer": "Counseling Services",
            "attendees": 32,
            "max_attendees": 40,
            "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
            "tags": ["wellness", "mental health", "workshop"]
        }
    ]

    @classmethod
    def get_all_events(cls) -> List[Event]:
        """
        Retrieve all available events.
        
        Returns:
            List[Event]: List of all events with validation
        """
        return [Event(**event_data) for event_data in cls._mock_events]

    @classmethod
    def get_event_by_id(cls, event_id: str) -> Optional[Event]:
        """
        Retrieve a specific event by its ID.
        
        Args:
            event_id (str): The unique identifier of the event
            
        Returns:
            Optional[Event]: The event if found, None otherwise
        """
        event_data = next((event for event in cls._mock_events if event['id'] == event_id), None)
        return Event(**event_data) if event_data else None

    @classmethod
    def join_event(cls, event_id: str, join_request: JoinEventRequest) -> ApiResponse:
        """
        Handle joining an event.
        
        Args:
            event_id (str): The unique identifier of the event to join
            join_request (JoinEventRequest): The join request data
            
        Returns:
            ApiResponse: Success or error response
        """
        # Find the event
        event_data = next((event for event in cls._mock_events if event['id'] == event_id), None)
        
        if not event_data:
            return ApiResponse(
                success=False,
                message=f"Event with ID {event_id} not found"
            )
        
        # Check if event is full
        if event_data['attendees'] >= event_data['max_attendees']:
            return ApiResponse(
                success=False,
                message="Event is full. Cannot join at this time."
            )
        
        # In a real implementation, we would:
        # 1. Check if user is already registered
        # 2. Add user to event attendees
        # 3. Send confirmation email
        # 4. Update database
        
        # For mock implementation, just increment attendees count
        event_data['attendees'] += 1
        
        return ApiResponse(
            success=True,
            message=f"Successfully joined '{event_data['title']}'. Confirmation details will be sent to {join_request.user_email}.",
            data={
                "event_id": event_id,
                "event_title": event_data['title'],
                "user_name": join_request.user_name,
                "user_email": join_request.user_email,
                "new_attendee_count": event_data['attendees']
            }
        )

    @classmethod
    def get_events_by_category(cls, category: str) -> List[Event]:
        """
        Retrieve events filtered by category.
        
        Args:
            category (str): The category to filter by
            
        Returns:
            List[Event]: List of events in the specified category
        """
        filtered_events = [event for event in cls._mock_events if event['category'] == category]
        return [Event(**event_data) for event_data in filtered_events]