"""
Data models and validation schemas using Pydantic.

This module defines the core data models for Events, Groups, Posts, and their
associated request/response schemas with proper validation rules.
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Literal, Optional
from datetime import datetime


# Core Entity Models

class Event(BaseModel):
    """Event model representing campus events."""
    id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    time: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    category: Literal['academic', 'social', 'sports', 'arts', 'career']
    organizer: str = Field(..., min_length=1, max_length=200)
    attendees: int = Field(ge=0, description="Current number of attendees")
    max_attendees: int = Field(gt=0, description="Maximum number of attendees")
    image: str = Field(..., description="URL to event image")
    tags: List[str] = Field(default_factory=list, max_items=10)

    @validator('tags')
    def validate_tags(cls, v):
        """Ensure tags are non-empty strings."""
        return [tag.strip() for tag in v if tag.strip()]

    @validator('attendees', 'max_attendees')
    def validate_attendee_logic(cls, v, values):
        """Ensure attendees doesn't exceed max_attendees."""
        if 'attendees' in values and 'max_attendees' in values:
            if values['attendees'] > v:
                raise ValueError('Attendees cannot exceed max_attendees')
        return v


class Author(BaseModel):
    """Author model for posts."""
    name: str = Field(..., min_length=1, max_length=100)
    avatar: str = Field(..., description="URL to author avatar image")
    role: str = Field(..., min_length=1, max_length=100)


class Post(BaseModel):
    """Post model representing campus posts/announcements."""
    id: str
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    author: Author
    timestamp: str = Field(..., description="Human-readable timestamp")
    likes: int = Field(ge=0, description="Number of likes")
    comments: int = Field(ge=0, description="Number of comments")
    category: Literal['academic', 'social', 'announcement', 'general']


class Group(BaseModel):
    """Group model representing campus groups/clubs."""
    id: str
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    category: Literal['academic', 'social', 'sports', 'arts', 'service', 'professional']
    members: int = Field(ge=0, description="Number of members")
    image: str = Field(..., description="URL to group image")
    meeting_time: str = Field(..., min_length=1, max_length=100, alias="meetingTime")
    location: str = Field(..., min_length=1, max_length=200)
    contact: str = Field(..., min_length=1, max_length=200)
    tags: List[str] = Field(default_factory=list, max_items=10)

    @validator('tags')
    def validate_tags(cls, v):
        """Ensure tags are non-empty strings."""
        return [tag.strip() for tag in v if tag.strip()]

    class Config:
        populate_by_name = True


# Request/Response Schemas

class JoinEventRequest(BaseModel):
    """Request schema for joining an event."""
    user_name: str = Field(..., min_length=1, max_length=100, alias="userName")
    user_email: EmailStr = Field(..., alias="userEmail")

    class Config:
        populate_by_name = True


class JoinGroupRequest(BaseModel):
    """Request schema for joining a group."""
    user_name: str = Field(..., min_length=1, max_length=100, alias="userName")
    user_email: EmailStr = Field(..., alias="userEmail")
    message: Optional[str] = Field(None, max_length=500, description="Optional message to group organizers")

    class Config:
        populate_by_name = True


class LikePostRequest(BaseModel):
    """Request schema for liking a post."""
    user_id: str = Field(..., min_length=1, max_length=100, alias="userId")

    class Config:
        populate_by_name = True


class CreatePostRequest(BaseModel):
    """Request schema for creating a new post."""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=2000)  # Changed from description to content
    category: Literal['academic', 'social', 'announcement', 'general']

    class Config:
        populate_by_name = True


class CreateEventRequest(BaseModel):
    """Request schema for creating a new event."""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    time: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    category: Literal['academic', 'social', 'sports', 'arts', 'career']
    organizer: str = Field(..., min_length=1, max_length=200)
    max_attendees: int = Field(gt=0, description="Maximum number of attendees")
    image: Optional[str] = Field(None, description="URL to event image")

    class Config:
        populate_by_name = True


class CreateGroupRequest(BaseModel):
    """Request schema for creating a new group."""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    category: Literal['academic', 'social', 'sports', 'arts', 'service', 'professional']
    meeting_time: str = Field(..., min_length=1, max_length=100, alias="meetingTime")
    location: str = Field(..., min_length=1, max_length=200)
    contact: str = Field(..., min_length=1, max_length=200)
    image: Optional[str] = Field(None, description="URL to group image")

    class Config:
        populate_by_name = True


class ApiResponse(BaseModel):
    """Standard API response schema."""
    success: bool
    message: str = Field(..., min_length=1, max_length=500)
    data: Optional[dict] = Field(None, description="Optional response data")


class ApiErrorResponse(BaseModel):
    """Standard API error response schema."""
    success: bool = False
    message: str = Field(..., min_length=1, max_length=500)
    error: str = Field(..., description="Error code or type")
    details: Optional[dict] = Field(None, description="Optional error details")


# List Response Schemas

class EventListResponse(BaseModel):
    """Response schema for event list endpoints."""
    success: bool = True
    message: str = "Events retrieved successfully"
    data: List[Event]


class GroupListResponse(BaseModel):
    """Response schema for group list endpoints."""
    success: bool = True
    message: str = "Groups retrieved successfully"
    data: List[Group]


class PostListResponse(BaseModel):
    """Response schema for post list endpoints."""
    success: bool = True
    message: str = "Posts retrieved successfully"
    data: List[Post]


# Single Item Response Schemas

class EventResponse(BaseModel):
    """Response schema for single event endpoints."""
    success: bool = True
    message: str = "Event retrieved successfully"
    data: Event


class GroupResponse(BaseModel):
    """Response schema for single group endpoints."""
    success: bool = True
    message: str = "Group retrieved successfully"
    data: Group


class PostResponse(BaseModel):
    """Response schema for single post endpoints."""
    success: bool = True
    message: str = "Post retrieved successfully"
    data: Post