"""
Posts API routes.

This module defines the Flask blueprint for post-related endpoints,
including retrieving posts, creating posts, and liking posts.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.services.post_service import PostService
from app.models.data_models import LikePostRequest, CreatePostRequest
from app.utils.helpers import (
    create_success_response,
    create_validation_error_response,
    create_not_found_response,
    create_internal_error_response,
    create_bad_request_response,
    handle_request_validation,
    format_list_response,
    format_single_item_response
)

# Create posts blueprint
posts_bp = Blueprint('posts', __name__)


@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    """
    Get all posts.
    
    Returns:
        JSON response with list of posts or error message
    """
    try:
        # Get query parameters for filtering
        category = request.args.get('category')
        author = request.args.get('author')
        
        if category:
            posts = PostService.get_posts_by_category(category)
            message = f"Posts for category '{category}' retrieved successfully"
        elif author:
            posts = PostService.get_posts_by_author(author)
            message = f"Posts by author '{author}' retrieved successfully"
        else:
            posts = PostService.get_all_posts()
            message = "Posts retrieved successfully"
        
        return format_list_response(posts, message=message, resource_name="posts")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@posts_bp.route('/posts', methods=['POST'])
def create_post():
    """
    Create a new post.
    
    Returns:
        JSON response with created post data or error message
    """
    try:
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data using Pydantic model
        try:
            create_request = CreatePostRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Process create request
        result = PostService.create_post(create_request)
        
        if result.success:
            return create_success_response(result.message, result.data, 201)
        else:
            return create_bad_request_response(result.message, result.details)
            
    except Exception as e:
        return create_internal_error_response(str(e))


@posts_bp.route('/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    """
    Get a specific post by ID.
    
    Args:
        post_id (str): The unique identifier of the post
        
    Returns:
        JSON response with post data or error message
    """
    try:
        post = PostService.get_post_by_id(post_id)
        
        if not post:
            return create_not_found_response("Post", post_id)
        
        return format_single_item_response(post, resource_name="post")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@posts_bp.route('/posts/<post_id>/like', methods=['POST'])
def like_post(post_id):
    """
    Like a specific post.
    
    Args:
        post_id (str): The unique identifier of the post to like
        
    Returns:
        JSON response with success message or error
    """
    try:
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data using Pydantic model
        try:
            like_request = LikePostRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Process like request
        result = PostService.like_post(post_id, like_request)
        
        if result.success:
            return create_success_response(result.message, result.data, 200)
        else:
            return create_bad_request_response(result.message, result.details)
            
    except Exception as e:
        return create_internal_error_response(str(e))


@posts_bp.errorhandler(404)
def post_not_found(error):
    """Handle 404 errors for post routes."""
    return create_not_found_response("Posts endpoint")


@posts_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for post routes."""
    return create_bad_request_response("Method not allowed for this posts endpoint")