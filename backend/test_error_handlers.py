#!/usr/bin/env python3
"""
Test script to verify centralized error handlers and response formatting.

This script tests the error handling functionality by making requests
to non-existent endpoints and checking the response format.
"""

import json
from app import create_app


def test_error_handlers():
    """Test the centralized error handlers."""
    app = create_app()
    
    with app.test_client() as client:
        print("Testing centralized error handlers...")
        print("=" * 50)
        
        # Test 404 Not Found
        print("\n1. Testing 404 Not Found:")
        response = client.get('/api/nonexistent')
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.get_json(), indent=2)}")
        
        # Test 405 Method Not Allowed
        print("\n2. Testing 405 Method Not Allowed:")
        response = client.post('/health')  # Health endpoint only accepts GET
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.get_json(), indent=2)}")
        
        # Test 400 Bad Request (malformed JSON)
        print("\n3. Testing 400 Bad Request (if events endpoint exists):")
        try:
            response = client.post('/api/events/1/join', 
                                 data="invalid json", 
                                 content_type='application/json')
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.get_json(), indent=2)}")
        except Exception as e:
            print(f"Note: Events endpoint may not be fully implemented yet: {e}")
        
        # Test health endpoint (should work)
        print("\n4. Testing successful response (health check):")
        response = client.get('/health')
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.get_json(), indent=2)}")
        
        print("\n" + "=" * 50)
        print("Error handler testing completed!")


if __name__ == "__main__":
    test_error_handlers()