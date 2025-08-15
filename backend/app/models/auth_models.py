"""
Authentication and user models for the CampusConnect application.

This module defines SQLAlchemy models for user authentication, profiles,
and related functionality.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from datetime import datetime, timedelta

Base = declarative_base()

# Association tables for many-to-many relationships
user_events = Table(
    'user_events',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id'), primary_key=True),
    Column('event_id', String(36), ForeignKey('events.id'), primary_key=True),
    Column('joined_at', DateTime, default=func.now())
)

user_groups = Table(
    'user_groups',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id'), primary_key=True),
    Column('group_id', String(36), ForeignKey('groups.id'), primary_key=True),
    Column('joined_at', DateTime, default=func.now())
)

user_saved_events = Table(
    'user_saved_events',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id'), primary_key=True),
    Column('event_id', String(36), ForeignKey('events.id'), primary_key=True),
    Column('saved_at', DateTime, default=func.now())
)

post_likes = Table(
    'post_likes',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.id'), primary_key=True),
    Column('post_id', String(36), ForeignKey('posts.id'), primary_key=True),
    Column('liked_at', DateTime, default=func.now())
)


class User(Base):
    """User model for authentication and profile management."""
    
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Profile information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    full_name = Column(String(200), nullable=False)  # Computed field
    bio = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Academic information
    major = Column(String(100), nullable=False)
    year_of_study = Column(String(20), nullable=False)
    user_role = Column(String(20), nullable=False, default='student')  # student, teacher, management
    
    # Profile picture
    profile_picture_url = Column(String(500), nullable=True)
    profile_picture_filename = Column(String(255), nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    otp_codes = relationship("OTPCode", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    
    # Many-to-many relationships
    joined_events = relationship("Event", secondary=user_events, back_populates="attendees")
    joined_groups = relationship("Group", secondary=user_groups, back_populates="members")
    saved_events = relationship("Event", secondary=user_saved_events, back_populates="saved_by_users")
    liked_posts = relationship("Post", secondary=post_likes, back_populates="liked_by_users")
    
    def set_password(self, password: str) -> None:
        """Set password hash."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        """Check password against hash."""
        return check_password_hash(self.password_hash, password)
    
    def update_full_name(self) -> None:
        """Update the full_name field based on first_name and last_name."""
        self.full_name = f"{self.first_name} {self.last_name}".strip()
    
    def to_dict(self) -> dict:
        """Convert user to dictionary for API responses."""
        return {
            'user_id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'bio': self.bio,
            'phone': self.phone,
            'major': self.major,
            'year_of_study': self.year_of_study,
            'user_role': self.user_role,
            'profile_picture': self.profile_picture_url,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class UserSession(Base):
    """User session model for authentication tokens."""
    
    __tablename__ = 'user_sessions'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Session metadata
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    last_used = Column(DateTime, default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    def is_expired(self) -> bool:
        """Check if session is expired."""
        return datetime.utcnow() > self.expires_at
    
    def extend_session(self, hours: int = 24) -> None:
        """Extend session expiration."""
        self.expires_at = datetime.utcnow() + timedelta(hours=hours)
        self.last_used = datetime.utcnow()


class OTPCode(Base):
    """OTP code model for email verification and password reset."""
    
    __tablename__ = 'otp_codes'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False)  # 'signup', 'login', 'password_reset'
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=3, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    used_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="otp_codes")
    
    def is_expired(self) -> bool:
        """Check if OTP is expired."""
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self) -> bool:
        """Check if OTP is valid (not expired, not used, attempts not exceeded)."""
        return not self.is_expired() and not self.is_used and self.attempts < self.max_attempts
    
    def increment_attempts(self) -> None:
        """Increment attempt count."""
        self.attempts += 1
    
    def mark_as_used(self) -> None:
        """Mark OTP as used."""
        self.is_used = True
        self.used_at = datetime.utcnow()


class Event(Base):
    """Event model for campus events."""
    
    __tablename__ = 'events'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    
    # Event details
    date = Column(String(50), nullable=False)  # Store as string for now
    time = Column(String(50), nullable=False)
    location = Column(String(200), nullable=False)
    organizer = Column(String(100), nullable=False)
    
    # Capacity
    max_attendees = Column(Integer, nullable=False)
    
    # Media
    image_url = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    attendees = relationship("User", secondary=user_events, back_populates="joined_events")
    saved_by_users = relationship("User", secondary=user_saved_events, back_populates="saved_events")
    
    @property
    def attendee_count(self) -> int:
        """Get current attendee count."""
        return len(self.attendees)
    
    @property
    def available_spots(self) -> int:
        """Get available spots."""
        return max(0, self.max_attendees - self.attendee_count)
    
    def to_dict(self) -> dict:
        """Convert event to dictionary for API responses."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'date': self.date,
            'time': self.time,
            'location': self.location,
            'organizer': self.organizer,
            'max_attendees': self.max_attendees,
            'attendees': self.attendee_count,
            'available_spots': self.available_spots,
            'image': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Group(Base):
    """Group model for student groups."""
    
    __tablename__ = 'groups'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    
    # Group details
    meeting_time = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    contact = Column(String(100), nullable=False)
    
    # Media
    image_url = Column(String(500), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    members = relationship("User", secondary=user_groups, back_populates="joined_groups")
    
    @property
    def member_count(self) -> int:
        """Get current member count."""
        return len(self.members)
    
    def to_dict(self) -> dict:
        """Convert group to dictionary for API responses."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'meeting_time': self.meeting_time,
            'location': self.location,
            'contact': self.contact,
            'members': self.member_count,
            'image': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Post(Base):
    """Post model for campus feed."""
    
    __tablename__ = 'posts'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    
    # Author
    author_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    liked_by_users = relationship("User", secondary=post_likes, back_populates="liked_posts")
    
    @property
    def like_count(self) -> int:
        """Get current like count."""
        return len(self.liked_by_users)
    
    @property
    def comment_count(self) -> int:
        """Get current comment count."""
        return len(self.comments)
    
    def to_dict(self) -> dict:
        """Convert post to dictionary for API responses."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'author': {
                'id': self.author.id,
                'name': self.author.full_name,
                'avatar': self.author.profile_picture_url,
                'role': f"{self.author.year_of_study} - {self.author.major}"
            },
            'likes': self.like_count,
            'comments': self.comment_count,
            'timestamp': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'is_active': self.is_active
        }


class Comment(Base):
    """Comment model for post comments."""
    
    __tablename__ = 'comments'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    content = Column(Text, nullable=False)
    
    # References
    post_id = Column(String(36), ForeignKey('posts.id'), nullable=False)
    author_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    
    def to_dict(self) -> dict:
        """Convert comment to dictionary for API responses."""
        return {
            'id': self.id,
            'content': self.content,
            'author': {
                'id': self.author.id,
                'name': self.author.full_name,
                'avatar': self.author.profile_picture_url,
                'role': f"{self.author.year_of_study} - {self.author.major}"
            },
            'timestamp': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'likes': 0  # Can be extended later
        }