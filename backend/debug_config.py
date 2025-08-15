#!/usr/bin/env python3
"""
Debug script to check Flask configuration values.
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def debug_config():
    """Debug Flask configuration."""
    print("Debugging Flask Configuration...")
    
    app = create_app('development')
    
    with app.app_context():
        print(f"MAIL_SERVER: {app.config.get('MAIL_SERVER')}")
        print(f"MAIL_PORT: {app.config.get('MAIL_PORT')}")
        print(f"MAIL_USE_TLS: {app.config.get('MAIL_USE_TLS')}")
        print(f"MAIL_USE_SSL: {app.config.get('MAIL_USE_SSL')}")
        print(f"MAIL_USERNAME: {app.config.get('MAIL_USERNAME')}")
        print(f"MAIL_PASSWORD: {'*' * len(str(app.config.get('MAIL_PASSWORD', '')))}")
        print(f"MAIL_DEFAULT_SENDER: {app.config.get('MAIL_DEFAULT_SENDER')}")
        
        # Test SMTP connection
        try:
            from app.services.email_service import EmailService
            server = EmailService.create_smtp_connection()
            server.quit()
            print("✓ SMTP connection successful!")
        except Exception as e:
            print(f"✗ SMTP connection failed: {str(e)}")

if __name__ == "__main__":
    debug_config()