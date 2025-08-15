"""
Authentication models and schemas using SQLAlchemy and Pydantic.

This module defines the database models for user authentication and
associated request/response schemas with proper validation rules.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime
import re

Base = declarative_base()


class User(Base):
    """SQLAlchemy User model for database operations."""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"


# Pydantic models for API validation and serialization

class UserBase(BaseModel):
    """Base user schema with common fields."""
    full_name: str = Field(..., min_length=2, max_length=200, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=128, description="User's password")
    confirm_password: str = Field(..., min_length=8, max_length=128, description="Password confirmation")
    
    @validator('email')
    def validate_email_domain(cls, v):
        """Validate that email belongs to allowed domains."""
        from app.config import config
        import os
        
        # Get allowed domains from config (default to .edu)
        allowed_domains = os.environ.get('ALLOWED_EMAIL_DOMAINS', '.edu').split(',')
        allowed_domains = [domain.strip() for domain in allowed_domains]
        
        email_lower = v.lower()
        domain_valid = any(email_lower.endswith(domain.lower()) for domain in allowed_domains)
        
        if not domain_valid:
            raise ValueError(f'Email must end with one of: {", ".join(allowed_domains)}')
        
        return v
    
    @validator('full_name')
    def validate_full_name(cls, v):
        """Validate full name format."""
        if not re.match(r'^[a-zA-Z\s\-\'\.]+$', v):
            raise ValueError('Full name can only contain letters, spaces, hyphens, apostrophes, and periods')
        
        # Ensure at least two words (first and last name)
        words = v.strip().split()
        if len(words) < 2:
            raise ValueError('Please provide both first and last name')
        
        return v.strip()
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        
        return v
    
    @validator('confirm_password')
    def validate_passwords_match(cls, v, values):
        """Ensure password and confirm_password match."""
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=1, description="User's password")


class UserResponse(UserBase):
    """Schema for user data in API responses."""
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)
    email: Optional[EmailStr] = None
    
    @validator('full_name')
    def validate_full_name(cls, v):
        """Validate full name format if provided."""
        if v is not None:
            if not re.match(r'^[a-zA-Z\s\-\'\.]+$', v):
                raise ValueError('Full name can only contain letters, spaces, hyphens, apostrophes, and periods')
            
            words = v.strip().split()
            if len(words) < 2:
                raise ValueError('Please provide both first and last name')
            
            return v.strip()
        return v
    
    @validator('email')
    def validate_email_domain(cls, v):
        """Validate email domain if provided."""
        if v is not None:
            from app.config import config
            import os
            
            allowed_domains = os.environ.get('ALLOWED_EMAIL_DOMAINS', '.edu').split(',')
            allowed_domains = [domain.strip() for domain in allowed_domains]
            
            email_lower = v.lower()
            domain_valid = any(email_lower.endswith(domain.lower()) for domain in allowed_domains)
            
            if not domain_valid:
                raise ValueError(f'Email must end with one of: {", ".join(allowed_domains)}')
        
        return v


class ChangePasswordRequest(BaseModel):
    """Schema for changing user password."""
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")
    confirm_new_password: str = Field(..., min_length=8, max_length=128, description="New password confirmation")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        """Validate new password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        
        return v
    
    @validator('confirm_new_password')
    def validate_passwords_match(cls, v, values):
        """Ensure new password and confirmation match."""
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('New passwords do not match')
        return v


# Authentication response schemas

class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class AuthResponse(BaseModel):
    """Schema for authentication API responses."""
    success: bool
    message: str
    data: Optional[TokenResponse] = None


class AuthErrorResponse(BaseModel):
    """Schema for authentication error responses."""
    success: bool = False
    message: str
    error: str
    details: Optional[dict] = None
