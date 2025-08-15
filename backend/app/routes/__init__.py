"""
Routes package initialization.

This module handles the registration and export of all Flask blueprints
for the application's API endpoints.
"""

from .events import events_bp

# Export blueprints for easy import in app factory
__all__ = ['events_bp']