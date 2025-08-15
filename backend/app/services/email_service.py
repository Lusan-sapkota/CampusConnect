"""
Email service for sending emails with SMTP support.

This module provides email functionality including OTP generation and sending,
email templates, and SMTP connection management for authentication services.
"""

import smtplib
import ssl
import secrets
import string
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from flask import current_app
import logging

# Set up logging
logger = logging.getLogger(__name__)


class EmailService:
    """Service class for handling email operations."""
    
    @staticmethod
    def generate_otp(length: int = None) -> str:
        """
        Generate a random OTP (One-Time Password).
        
        Args:
            length (int, optional): Length of OTP. Defaults to config value.
            
        Returns:
            str: Generated OTP
        """
        if length is None:
            length = current_app.config.get('OTP_LENGTH', 6)
        
        # Generate OTP using digits only
        digits = string.digits
        otp = ''.join(secrets.choice(digits) for _ in range(length))
        return otp
    
    @staticmethod
    def create_smtp_connection():
        """
        Create and return an SMTP connection based on configuration.
        
        Returns:
            smtplib.SMTP: Configured SMTP connection
            
        Raises:
            Exception: If SMTP connection fails
        """
        try:
            # Get config values with fallbacks for testing
            mail_server = current_app.config.get('MAIL_SERVER') or 'smtp.zoho.com'
            mail_port = current_app.config.get('MAIL_PORT') or 587
            mail_use_tls = current_app.config.get('MAIL_USE_TLS', True)
            mail_use_ssl = current_app.config.get('MAIL_USE_SSL', False)
            mail_username = current_app.config.get('MAIL_USERNAME')
            mail_password = current_app.config.get('MAIL_PASSWORD')
            
            logger.info(f"Email config - Server: {mail_server}, Port: {mail_port}, TLS: {mail_use_tls}, Username: {mail_username}")
            
            if not mail_server or not mail_username or not mail_password:
                raise ValueError(f"Email configuration is incomplete. Server: {mail_server}, Username: {mail_username}, Password: {'***' if mail_password else 'None'}")
            
            # Create SMTP connection
            if mail_use_ssl:
                # Use SSL connection
                context = ssl.create_default_context()
                server = smtplib.SMTP_SSL(mail_server, mail_port, context=context)
            else:
                # Use regular SMTP connection
                server = smtplib.SMTP(mail_server, mail_port)
                
                if mail_use_tls:
                    # Start TLS encryption
                    context = ssl.create_default_context()
                    server.starttls(context=context)
            
            # Login to the server
            logger.info(f"Attempting SMTP login with username: {mail_username}")
            server.login(mail_username, mail_password)
            
            logger.info(f"SMTP connection established successfully to {mail_server}:{mail_port}")
            return server
            
        except Exception as e:
            logger.error(f"Failed to create SMTP connection: {str(e)}")
            raise Exception(f"Email service unavailable: {str(e)}")
    
    @staticmethod
    def create_otp_email_template(
        recipient_name: str,
        otp: str,
        purpose: str = "authentication",
        expiry_minutes: int = None
    ) -> Dict[str, str]:
        """
        Create an OTP email template.
        
        Args:
            recipient_name (str): Name of the recipient
            otp (str): The OTP code
            purpose (str): Purpose of the OTP (e.g., "authentication", "password reset")
            expiry_minutes (int, optional): OTP expiry time in minutes
            
        Returns:
            Dict[str, str]: Dictionary containing 'subject', 'html', and 'text' content
        """
        if expiry_minutes is None:
            expiry_minutes = current_app.config.get('OTP_EXPIRY_MINUTES', 10)
        
        subject = f"Your CampusConnect {purpose.title()} Code"
        
        # HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{subject}</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }}
                .container {{
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo {{
                    font-size: 28px;
                    font-weight: bold;
                    color: #2563eb;
                    margin-bottom: 10px;
                }}
                .otp-container {{
                    background-color: #f8fafc;
                    border: 2px dashed #2563eb;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 20px 0;
                }}
                .otp-code {{
                    font-size: 32px;
                    font-weight: bold;
                    color: #2563eb;
                    letter-spacing: 8px;
                    margin: 10px 0;
                }}
                .warning {{
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">CampusConnect</div>
                    <h2>Your {purpose.title()} Code</h2>
                </div>
                
                <p>Hello {recipient_name},</p>
                
                <p>You have requested a {purpose} code for your CampusConnect account. Please use the following code to complete your {purpose}:</p>
                
                <div class="otp-container">
                    <div class="otp-code">{otp}</div>
                    <p><strong>This code will expire in {expiry_minutes} minutes</strong></p>
                </div>
                
                <div class="warning">
                    <strong>Security Notice:</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Never share this code with anyone</li>
                        <li>CampusConnect will never ask for this code via phone or email</li>
                        <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                </div>
                
                <p>If you're having trouble with {purpose}, please contact our support team.</p>
                
                <div class="footer">
                    <p>This is an automated message from CampusConnect.<br>
                    Please do not reply to this email.</p>
                    <p>&copy; 2024 CampusConnect. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        CampusConnect - Your {purpose.title()} Code
        
        Hello {recipient_name},
        
        You have requested a {purpose} code for your CampusConnect account.
        
        Your {purpose} code is: {otp}
        
        This code will expire in {expiry_minutes} minutes.
        
        SECURITY NOTICE:
        - Never share this code with anyone
        - CampusConnect will never ask for this code via phone or email
        - If you didn't request this code, please ignore this email
        
        If you're having trouble with {purpose}, please contact our support team.
        
        This is an automated message from CampusConnect.
        Please do not reply to this email.
        
        © 2024 CampusConnect. All rights reserved.
        """
        
        return {
            'subject': subject,
            'html': html_content,
            'text': text_content
        }
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        html_content: str = None,
        text_content: str = None,
        from_email: str = None,
        reply_to: str = None
    ) -> bool:
        """
        Send an email using SMTP.
        
        Args:
            to_email (str): Recipient email address
            subject (str): Email subject
            html_content (str, optional): HTML content of the email
            text_content (str, optional): Plain text content of the email
            from_email (str, optional): Sender email address
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            if from_email is None:
                from_email = current_app.config.get('MAIL_DEFAULT_SENDER')
            if reply_to is None:
                reply_to = current_app.config.get('MAIL_REPLY_TO')

            if not from_email:
                raise ValueError("No sender email address configured")

            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = from_email
            message['To'] = to_email
            if reply_to:
                message.add_header('Reply-To', reply_to)

            # Add text content
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                message.attach(text_part)

            # Add HTML content
            if html_content:
                html_part = MIMEText(html_content, 'html')
                message.attach(html_part)

            # Create SMTP connection and send email
            with EmailService.create_smtp_connection() as server:
                server.send_message(message)

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    @staticmethod
    def send_otp_email(
        to_email: str,
        recipient_name: str,
        otp: str = None,
        purpose: str = "authentication"
    ) -> Dict[str, Any]:
        """
        Send an OTP email to the specified recipient.
        
        Args:
            to_email (str): Recipient email address
            recipient_name (str): Name of the recipient
            otp (str, optional): OTP code. If not provided, a new one will be generated
            purpose (str): Purpose of the OTP
            
        Returns:
            Dict[str, Any]: Result containing success status, OTP, and expiry time
        """
        try:
            # Generate OTP if not provided
            if otp is None:
                otp = EmailService.generate_otp()
            
            # Calculate expiry time
            expiry_minutes = current_app.config.get('OTP_EXPIRY_MINUTES', 10)
            expiry_time = datetime.utcnow() + timedelta(minutes=expiry_minutes)
            
            # Create email template
            email_template = EmailService.create_otp_email_template(
                recipient_name=recipient_name,
                otp=otp,
                purpose=purpose,
                expiry_minutes=expiry_minutes
            )
            
            # Send email
            success = EmailService.send_email(
                to_email=to_email,
                subject=email_template['subject'],
                html_content=email_template['html'],
                text_content=email_template['text']
            )
            
            if success:
                return {
                    'success': True,
                    'message': f'OTP sent successfully to {to_email}',
                    'otp': otp,
                    'expiry_time': expiry_time.isoformat(),
                    'expiry_minutes': expiry_minutes
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to send OTP email',
                    'error': 'EMAIL_SEND_FAILED'
                }
                
        except Exception as e:
            logger.error(f"Error in send_otp_email: {str(e)}")
            return {
                'success': False,
                'message': 'Failed to send OTP email',
                'error': 'EMAIL_SERVICE_ERROR',
                'details': str(e)
            }
    
    @staticmethod
    def validate_email_configuration() -> Dict[str, Any]:
        """
        Validate email configuration settings.
        
        Returns:
            Dict[str, Any]: Validation result
        """
        try:
            required_configs = ['MAIL_SERVER', 'MAIL_USERNAME', 'MAIL_PASSWORD']
            missing_configs = []
            
            for config_key in required_configs:
                if not current_app.config.get(config_key):
                    missing_configs.append(config_key)
            
            if missing_configs:
                return {
                    'valid': False,
                    'message': f'Missing required email configuration: {", ".join(missing_configs)}',
                    'missing_configs': missing_configs
                }
            
            # Test SMTP connection
            try:
                with EmailService.create_smtp_connection() as server:
                    pass  # Connection successful
                
                return {
                    'valid': True,
                    'message': 'Email configuration is valid and SMTP connection successful'
                }
                
            except Exception as e:
                return {
                    'valid': False,
                    'message': f'SMTP connection failed: {str(e)}',
                    'error': 'SMTP_CONNECTION_FAILED'
                }
                
        except Exception as e:
            return {
                'valid': False,
                'message': f'Email configuration validation failed: {str(e)}',
                'error': 'VALIDATION_ERROR'
            }