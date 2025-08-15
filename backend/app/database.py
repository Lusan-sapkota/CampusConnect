"""
Database initialization and configuration module.

This module handles SQLAlchemy database setup, connection management,
and provides utilities for database operations.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
from typing import Generator
import logging

try:
    from app.models.auth_models import Base
except ImportError:
    # Handle direct execution from app directory
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from app.models.auth_models import Base

# Global variables for database components
engine = None
SessionLocal = None

logger = logging.getLogger(__name__)


def init_database(database_url: str, echo: bool = False) -> None:
    """
    Initialize the database engine and session factory.
    
    Args:
        database_url (str): Database connection URL
        echo (bool): Whether to echo SQL statements (for debugging)
    """
    global engine, SessionLocal
    
    try:
        # Create engine
        engine = create_engine(
            database_url,
            echo=echo,
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=300,    # Recycle connections every 5 minutes
        )
        
        # Create session factory
        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine
        )
        
        logger.info(f"Database initialized successfully with URL: {database_url}")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise


def create_tables() -> None:
    """
    Create all database tables defined in the models.
    
    This should be called after init_database() to ensure all tables exist.
    """
    global engine
    
    if engine is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    try:
        # Import all models to ensure they're registered with Base
        try:
            from app.models.auth_models import User
        except ImportError:
            from models.auth_models import User
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create database tables: {str(e)}")
        raise


def drop_tables() -> None:
    """
    Drop all database tables. Use with caution!
    
    This is primarily for development and testing purposes.
    """
    global engine
    
    if engine is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    try:
        Base.metadata.drop_all(bind=engine)
        logger.warning("All database tables dropped")
        
    except Exception as e:
        logger.error(f"Failed to drop database tables: {str(e)}")
        raise


def get_db_session() -> Session:
    """
    Get a new database session.
    
    Returns:
        Session: SQLAlchemy database session
        
    Note:
        Remember to close the session when done or use get_db() context manager.
    """
    global SessionLocal
    
    if SessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    return SessionLocal()


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    
    Yields:
        Session: SQLAlchemy database session
        
    Example:
        with get_db() as db:
            user = db.query(User).filter(User.email == email).first()
    """
    db = get_db_session()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database transaction failed: {str(e)}")
        raise
    finally:
        db.close()


def check_database_connection() -> bool:
    """
    Check if the database connection is working.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    global engine
    
    if engine is None:
        return False
    
    try:
        from sqlalchemy import text
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError as e:
        logger.error(f"Database connection check failed: {str(e)}")
        return False


def get_database_info() -> dict:
    """
    Get information about the current database setup.
    
    Returns:
        dict: Database information including URL, driver, etc.
    """
    global engine
    
    if engine is None:
        return {"status": "not_initialized"}
    
    return {
        "status": "initialized",
        "url": str(engine.url).replace(engine.url.password or "", "***") if engine.url.password else str(engine.url),
        "driver": engine.dialect.name,
        "pool_size": engine.pool.size() if hasattr(engine.pool, 'size') else "unknown",
        "connection_active": check_database_connection()
    }


# Database dependency for FastAPI-style dependency injection (if needed)
def get_db_dependency() -> Generator[Session, None, None]:
    """
    Database dependency for dependency injection frameworks.
    
    This can be used with FastAPI or similar frameworks that support
    dependency injection.
    """
    with get_db() as db:
        yield db
