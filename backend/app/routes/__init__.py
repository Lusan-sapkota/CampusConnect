"""
Routes package initialization.

This module handles the registration and export of all Flask blueprints
for the application's API endpoints.
"""

from .events import events_bp
from .groups import groups_bp
from .posts import posts_bp
from .users import users_bp

# Export blueprints for easy import in app factory
__all__ = ['events_bp', 'groups_bp', 'posts_bp', 'users_bp']