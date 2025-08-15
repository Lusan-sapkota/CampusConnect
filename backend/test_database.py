#!/usr/bin/env python3
"""
Test database functionality.
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import init_database, get_db
from app.models.auth_models import User
from app.config import Config

def test_database():
    """Test basic database operations."""
    print("Testing database functionality...")
    
    try:
        # Initialize database
        init_database(Config.SQLALCHEMY_DATABASE_URI)
        print("✓ Database initialized")
        
        # Test basic query
        with get_db() as db:
            user_count = db.query(User).count()
            print(f"✓ Database query successful - Found {user_count} users")
        
        print("✓ Database is working correctly!")
        return True
        
    except Exception as e:
        print(f"✗ Database test failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_database()
    sys.exit(0 if success else 1)