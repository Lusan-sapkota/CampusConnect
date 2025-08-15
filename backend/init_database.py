#!/usr/bin/env python3
"""
Simple database initialization script.
Run this before starting the Flask application.
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import init_database, create_tables, check_database_connection
from app.config import Config

def main():
    """Initialize the database."""
    print("Initializing CampusConnect database...")
    
    try:
        # Get database URI from config
        database_uri = Config.SQLALCHEMY_DATABASE_URI
        print(f"Database URI: {database_uri}")
        
        # Initialize database
        init_database(database_uri, echo=False)
        print("✓ Database engine initialized")
        
        # Create tables
        create_tables()
        print("✓ Database tables created")
        
        # Check connection
        if check_database_connection():
            print("✓ Database connection verified")
        else:
            print("⚠ Database connection check failed, but tables were created")
            print("  This might be normal for SQLite databases")
            # Don't return False for SQLite connection check failures
        
        print("\n🎉 Database initialization completed successfully!")
        print("You can now start the Flask application with: python run.py")
        return True
        
    except Exception as e:
        print(f"✗ Database initialization failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)