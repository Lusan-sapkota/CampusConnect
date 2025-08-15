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
    
    # Initialize CORS with configuration
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from .routes.events import events_bp
    from .routes.groups import groups_bp  
    from .routes.posts import posts_bp
    
    app.register_blueprint(events_bp, url_prefix='/api')
    app.register_blueprint(groups_bp, url_prefix='/api')
    app.register_blueprint(posts_bp, url_prefix='/api')
    
    # Add a simple health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Flask backend API is running'}
    
    return app