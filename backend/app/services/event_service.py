"""
Event service for handling event-related business logic.

This module provides services for event management including
retrieving events, joining events, saving events, and managing event data.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.database import get_db
from app.models.auth_models import Event, User, user_events, user_saved_events
from app.models.data_models import JoinEventRequest, ApiResponse

logger = logging.getLogger(__name__)


class EventService:
    """Service class for event operations."""
    
    @classmethod
    def get_all_events(cls) -> List[Dict[str, Any]]:
        """
        Retrieve all active events.
        
        Returns:
            List of event dictionaries
        """
        try:
            with get_db() as db:
                events = db.query(Event).filter(Event.is_active == True).all()
                return [event.to_dict() for event in events]
        except Exception as e:
            logger.error(f"Error retrieving events: {str(e)}")
            # Return mock data as fallback
            return cls._get_mock_events()
    
    @classmethod
    def get_event_by_id(cls, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific event by ID.
        
        Args:
            event_id (str): The ID of the event to retrieve
            
        Returns:
            Event dictionary if found, None otherwise
        """
        try:
            with get_db() as db:
                event = db.query(Event).filter(
                    Event.id == event_id,
                    Event.is_active == True
                ).first()
                
                if event:
                    return event.to_dict()
                return None
        except Exception as e:
            logger.error(f"Error retrieving event {event_id}: {str(e)}")
            # Return mock data as fallback
            mock_events = cls._get_mock_events()
            return next((event for event in mock_events if event["id"] == event_id), None)
    
    @classmethod
    def join_event(cls, event_id: str, user_id: str) -> Dict[str, Any]:
        """
        Join an event.
        
        Args:
            event_id (str): The ID of the event to join
            user_id (str): The ID of the user joining the event
            
        Returns:
            Dictionary containing the result of the join operation
        """
        try:
            with get_db() as db:
                # Find the event
                event = db.query(Event).filter(
                    Event.id == event_id,
                    Event.is_active == True
                ).first()
                
                if not event:
                    return {
                        "success": False,
                        "message": "Event not found"
                    }
                
                # Find the user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return {
                        "success": False,
                        "message": "User not found"
                    }
                
                # Check if user is already registered
                if user in event.attendees:
                    return {
                        "success": False,
                        "message": "You are already registered for this event"
                    }
                
                # Check if event is full
                if event.attendee_count >= event.max_attendees:
                    return {
                        "success": False,
                        "message": "Event is full"
                    }
                
                # Add user to event attendees
                event.attendees.append(user)
                db.commit()
                
                logger.info(f"User {user.email} joined event {event.title}")
                return {
                    "success": True,
                    "message": f"Successfully joined '{event.title}'",
                    "data": {
                        "event_id": event_id,
                        "event_title": event.title,
                        "attendee_count": event.attendee_count
                    }
                }
                
        except Exception as e:
            logger.error(f"Error joining event {event_id}: {str(e)}")
            return {
                "success": False,
                "message": "Failed to join event"
            }
    
    @classmethod
    def leave_event(cls, event_id: str, user_id: str) -> Dict[str, Any]:
        """
        Leave an event.
        
        Args:
            event_id (str): The ID of the event to leave
            user_id (str): The ID of the user leaving the event
            
        Returns:
            Dictionary containing the result of the leave operation
        """
        try:
            with get_db() as db:
                # Find the event
                event = db.query(Event).filter(
                    Event.id == event_id,
                    Event.is_active == True
                ).first()
                
                if not event:
                    return {
                        "success": False,
                        "message": "Event not found"
                    }
                
                # Find the user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return {
                        "success": False,
                        "message": "User not found"
                    }
                
                # Check if user is registered
                if user not in event.attendees:
                    return {
                        "success": False,
                        "message": "You are not registered for this event"
                    }
                
                # Remove user from event attendees
                event.attendees.remove(user)
                db.commit()
                
                logger.info(f"User {user.email} left event {event.title}")
                return {
                    "success": True,
                    "message": f"Successfully left '{event.title}'",
                    "data": {
                        "event_id": event_id,
                        "event_title": event.title,
                        "attendee_count": event.attendee_count
                    }
                }
                
        except Exception as e:
            logger.error(f"Error leaving event {event_id}: {str(e)}")
            return {
                "success": False,
                "message": "Failed to leave event"
            }
    
    @classmethod
    def save_event(cls, event_id: str, user_id: str) -> Dict[str, Any]:
        """
        Save an event to user's saved events.
        
        Args:
            event_id (str): The ID of the event to save
            user_id (str): The ID of the user saving the event
            
        Returns:
            Dictionary containing the result of the save operation
        """
        try:
            with get_db() as db:
                # Find the event
                event = db.query(Event).filter(
                    Event.id == event_id,
                    Event.is_active == True
                ).first()
                
                if not event:
                    return {
                        "success": False,
                        "message": "Event not found"
                    }
                
                # Find the user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return {
                        "success": False,
                        "message": "User not found"
                    }
                
                # Check if event is already saved
                if event in user.saved_events:
                    return {
                        "success": False,
                        "message": "Event is already saved"
                    }
                
                # Add event to user's saved events
                user.saved_events.append(event)
                db.commit()
                
                logger.info(f"User {user.email} saved event {event.title}")
                return {
                    "success": True,
                    "message": f"Successfully saved '{event.title}'",
                    "data": {
                        "event_id": event_id,
                        "event_title": event.title
                    }
                }
                
        except Exception as e:
            logger.error(f"Error saving event {event_id}: {str(e)}")
            return {
                "success": False,
                "message": "Failed to save event"
            }
    
    @classmethod
    def unsave_event(cls, event_id: str, user_id: str) -> Dict[str, Any]:
        """
        Remove an event from user's saved events.
        
        Args:
            event_id (str): The ID of the event to unsave
            user_id (str): The ID of the user unsaving the event
            
        Returns:
            Dictionary containing the result of the unsave operation
        """
        try:
            with get_db() as db:
                # Find the event
                event = db.query(Event).filter(
                    Event.id == event_id,
                    Event.is_active == True
                ).first()
                
                if not event:
                    return {
                        "success": False,
                        "message": "Event not found"
                    }
                
                # Find the user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return {
                        "success": False,
                        "message": "User not found"
                    }
                
                # Check if event is saved
                if event not in user.saved_events:
                    return {
                        "success": False,
                        "message": "Event is not saved"
                    }
                
                # Remove event from user's saved events
                user.saved_events.remove(event)
                db.commit()
                
                logger.info(f"User {user.email} unsaved event {event.title}")
                return {
                    "success": True,
                    "message": f"Successfully removed '{event.title}' from saved events",
                    "data": {
                        "event_id": event_id,
                        "event_title": event.title
                    }
                }
                
        except Exception as e:
            logger.error(f"Error unsaving event {event_id}: {str(e)}")
            return {
                "success": False,
                "message": "Failed to unsave event"
            }
    
    @classmethod
    def get_user_events(cls, user_id: str) -> Dict[str, Any]:
        """
        Get events that a user has joined and saved.
        
        Args:
            user_id (str): The ID of the user
            
        Returns:
            Dictionary containing joined and saved events
        """
        try:
            with get_db() as db:
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return {
                        "success": False,
                        "message": "User not found"
                    }
                
                joined_events = [event.to_dict() for event in user.joined_events if event.is_active]
                saved_events = [event.to_dict() for event in user.saved_events if event.is_active]
                
                return {
                    "success": True,
                    "data": {
                        "joined_events": joined_events,
                        "saved_events": saved_events
                    }
                }
                
        except Exception as e:
            logger.error(f"Error getting user events for {user_id}: {str(e)}")
            return {
                "success": False,
                "message": "Failed to retrieve user events"
            }
    
    @classmethod
    def check_user_event_status(cls, event_id: str, user_id: str) -> Dict[str, Any]:
        """
        Check if user has joined or saved an event.
        
        Args:
            event_id (str): The ID of the event
            user_id (str): The ID of the user
            
        Returns:
            Dictionary containing user's relationship to the event
        """
        try:
            with get_db() as db:
                event = db.query(Event).filter(
                    Event.id == event_id,
                    Event.is_active == True
                ).first()
                
                if not event:
                    return {
                        "success": False,
                        "message": "Event not found"
                    }
                
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return {
                        "success": False,
                        "message": "User not found"
                    }
                
                is_joined = user in event.attendees
                is_saved = event in user.saved_events
                
                return {
                    "success": True,
                    "data": {
                        "is_joined": is_joined,
                        "is_saved": is_saved,
                        "event_id": event_id
                    }
                }
                
        except Exception as e:
            logger.error(f"Error checking user event status: {str(e)}")
            return {
                "success": False,
                "message": "Failed to check event status"
            }
    
    @classmethod
    def _get_mock_events(cls) -> List[Dict[str, Any]]:
        """
        Get mock events data for fallback.
        
        Returns:
            List of mock event dictionaries
        """
        return [
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
    def get_events_by_category(cls, category: str) -> List[Dict[str, Any]]:
        """
        Retrieve events filtered by category.
        
        Args:
            category (str): The category to filter by
            
        Returns:
            List of events in the specified category
        """
        try:
            with get_db() as db:
                events = db.query(Event).filter(
                    Event.category == category,
                    Event.is_active == True
                ).all()
                return [event.to_dict() for event in events]
        except Exception as e:
            logger.error(f"Error retrieving events by category {category}: {str(e)}")
            # Return filtered mock data as fallback
            mock_events = cls._get_mock_events()
            return [event for event in mock_events if event["category"] == category]

    @classmethod
    def create_event(cls, create_request, user_id: str) -> ApiResponse:
        """
        Create a new event.
        
        Args:
            create_request: The event creation data
            user_id (str): The ID of the user creating the event
            
        Returns:
            ApiResponse: Success or error response with created event data
        """
        try:
            with get_db() as db:
                # Find the user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return ApiResponse(
                        success=False,
                        message="User not found"
                    )
                
                # Create new event
                new_event = Event(
                    title=create_request.title,
                    description=create_request.description,
                    date=create_request.date,
                    time=create_request.time,
                    location=create_request.location,
                    category=create_request.category,
                    organizer=create_request.organizer,
                    max_attendees=create_request.max_attendees,
                    image_url=create_request.image
                )
                
                db.add(new_event)
                db.commit()
                db.refresh(new_event)
                
                logger.info(f"User {user.email} created event {new_event.title}")
                return ApiResponse(
                    success=True,
                    message="Event created successfully",
                    data=new_event.to_dict()
                )
                
        except Exception as e:
            logger.error(f"Error creating event: {str(e)}")
            return ApiResponse(
                success=False,
                message="Failed to create event"
            )