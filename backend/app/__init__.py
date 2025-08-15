"""
Flask application factory module.
Creates and configures the Flask application using the factory pattern.
"""

from flask import Flask
from flask_cors import CORS
from .config import config


def create_app(config_name='development'):
    """
    Create and configure Flask application using the factory pattern.
    
    Args:
        config_name (str): Configuration environment name ('development' or 'production')
        
    Returns:
        Flask: Configured Flask application instance
    """
    # Create Flask application instance
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize database
    initialize_database(app)
    
    # Initialize CORS with configuration
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from .routes.events import events_bp
    from .routes.groups import groups_bp  
    from .routes.posts import posts_bp
    from .routes.auth import auth_bp
    from .routes.users import users_bp
    
    app.register_blueprint(events_bp, url_prefix='/api')
    app.register_blueprint(groups_bp, url_prefix='/api')
    app.register_blueprint(posts_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api')
    
    # Register centralized error handlers
    register_error_handlers(app)
    
    # Add a simple health check endpoint
    @app.route('/health')
    def health_check():
        from .database import get_database_info
        db_info = get_database_info()
        return {
            'status': 'healthy', 
            'message': 'Flask backend API is running',
            'database': db_info
        }
    
    return app


def initialize_database(app):
    """
    Initialize the database for the Flask application.
    
    Args:
        app (Flask): Flask application instance
    """
    from .database import init_database, create_tables, check_database_connection
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        # Initialize database with app config
        database_uri = app.config.get('SQLALCHEMY_DATABASE_URI')
        if not database_uri:
            raise ValueError("SQLALCHEMY_DATABASE_URI not found in app config")
        
        print(f"Initializing database: {database_uri}")
        
        # Initialize database
        init_database(database_uri, echo=app.config.get('DEBUG', False))
        
        # Create tables if they don't exist
        create_tables()
        
        # Check connection
        if check_database_connection():
            logger.info("Database initialized and connected successfully")
            print("✓ Database initialized successfully")
        else:
            logger.error("Database connection check failed")
            print("✗ Database connection check failed")
            
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        print(f"✗ Database initialization failed: {str(e)}")
        print("Please run 'python init_database.py' to initialize the database manually")
        # Don't raise the exception to allow the app to start
        # This allows for manual database initialization if needed


def register_error_handlers(app):
    """
    Register centralized error handlers for the Flask application.
    
    Args:
        app (Flask): Flask application instance
    """
    from .utils.helpers import (
        create_error_response,
        create_method_not_allowed_response,
        create_internal_error_response
    )
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found errors."""
        return create_error_response(
            message="The requested resource was not found",
            error_code="NOT_FOUND",
            status_code=404
        )
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle 400 Bad Request errors."""
        return create_error_response(
            message="Bad request - invalid or malformed request data",
            error_code="BAD_REQUEST",
            status_code=400
        )
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle 405 Method Not Allowed errors."""
        return create_method_not_allowed_response()
    
    @app.errorhandler(500)
    def internal_server_error(error):
        """Handle 500 Internal Server Error."""
        return create_internal_error_response()
    
    @app.errorhandler(422)
    def unprocessable_entity(error):
        """Handle 422 Unprocessable Entity errors (validation errors)."""
        return create_error_response(
            message="Unprocessable entity - request data failed validation",
            error_code="VALIDATION_ERROR",
            status_code=422
        )
    
    @app.errorhandler(415)
    def unsupported_media_type(error):
        """Handle 415 Unsupported Media Type errors."""
        return create_error_response(
            message="Unsupported media type - request must be JSON",
            error_code="UNSUPPORTED_MEDIA_TYPE",
            status_code=415
        )