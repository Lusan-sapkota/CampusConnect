"""
Main application entry point for Flask backend API.
Runs the Flask development server with configuration from environment variables.
"""

import os
from app import create_app

# Get configuration environment from environment variable
config_name = os.environ.get('FLASK_ENV', 'development')

# Create Flask application using factory pattern
app = create_app(config_name)

if __name__ == '__main__':
    # Run the application
    host = app.config.get('HOST', '127.0.0.1')
    port = app.config.get('PORT', 5000)
    debug = app.config.get('DEBUG', True)
    
    print(f"Starting Flask backend API on {host}:{port}")
    print(f"Environment: {config_name}")
    print(f"Debug mode: {debug}")
    
    app.run(host=host, port=port, debug=debug)