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
        # Debug: Log incoming request headers and raw body
        print("[DEBUG] Incoming /api/posts request headers:", dict(request.headers))
        print("[DEBUG] Incoming /api/posts raw data:", request.data)

        # TODO: Add authentication check to get user_id
        # For now, we'll use a placeholder
        user_id = request.headers.get('X-User-ID', 'user-1')  # Temporary

        # Handle both JSON and FormData
        if request.is_json:
            request_data = request.get_json()
            print("[DEBUG] Incoming /api/posts JSON body:", request_data)
            if not request_data:
                print("[DEBUG] No request body received.")
                return create_bad_request_response("Request body is required")
        else:
            request_data = request.form.to_dict()
            print("[DEBUG] Incoming /api/posts FormData:", request_data)
            if not request_data:
                print("[DEBUG] No form data received.")
                return create_bad_request_response("Request data is required")

        # Validate request data using Pydantic model
        try:
            create_request = CreatePostRequest(**request_data)
        except ValidationError as e:
            print("[DEBUG] Validation error:", e.errors())
            return create_validation_error_response(e.errors())

        # Process create request
        result = PostService.create_post(create_request, user_id)
        if result.success:
            return create_success_response(result.message, result.data, 201)
        else:
            return create_bad_request_response(result.message, result.details)
        
            # Debug: Log incoming request headers and body
            print("[DEBUG] Incoming /api/posts request headers:", dict(request.headers))
            if request.is_json:
                request_data = request.get_json()
                print("[DEBUG] Incoming /api/posts JSON body:", request_data)
                if not request_data:
                    print("[DEBUG] No request body received.")
                    return create_bad_request_response("Request body is required")
            else:
                request_data = request.form.to_dict()
                print("[DEBUG] Incoming /api/posts FormData:", request_data)
                if not request_data:
                    print("[DEBUG] No form data received.")
                    return create_bad_request_response("Request data is required")

            # Validate request data using Pydantic model
            try:
                create_request = CreatePostRequest(**request_data)
            except ValidationError as e:
                print("[DEBUG] Validation error:", e.errors())
                return create_validation_error_response(e.errors())
            
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


@posts_bp.route('/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    """
    Update an existing post.
    
    Args:
        post_id (str): The unique identifier of the post to update
        
    Returns:
        JSON response with updated post data or error message
    """
    try:
        # TODO: Add authentication check to get user_id
        user_id = request.headers.get('X-User-ID', 'user-1')  # Temporary
        
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        
        # Validate request data using Pydantic model
        try:
            update_request = CreatePostRequest(**request_data)
        except ValidationError as e:
            return create_validation_error_response(e.errors())
        
        # Process update request
        result = PostService.update_post(post_id, update_request, user_id)
        
        if result.success:
            return create_success_response(result.message, result.data, 200)
        else:
            return create_bad_request_response(result.message, result.details)
        
    except Exception as e:
        return create_internal_error_response(str(e))


@posts_bp.route('/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    """
    Delete a post.
    
    Args:
        post_id (str): The unique identifier of the post to delete
        
    Returns:
        JSON response with success message or error
    """
    try:
        # TODO: Add authentication check to get user_id
        user_id = request.headers.get('X-User-ID', 'user-1')  # Temporary
        
        # Process delete request
        result = PostService.delete_post(post_id, user_id)
        
        if result.success:
            return create_success_response(result.message, {}, 200)
        else:
            return create_bad_request_response(result.message, result.details)
        
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
        # TODO: Add authentication check to get user_id
        user_id = request.headers.get('X-User-ID', 'user-1')  # Temporary
        
        # Process like request
        result = PostService.like_post(post_id, user_id)
        
        if result.success:
            return create_success_response(result.message, result.data, 200)
        else:
            return create_bad_request_response(result.message, result.details)
            
    except Exception as e:
        return create_internal_error_response(str(e))


@posts_bp.route('/posts/<post_id>/unlike', methods=['POST'])
def unlike_post(post_id):
    """
    Unlike a specific post.
    
    Args:
        post_id (str): The unique identifier of the post to unlike
        
    Returns:
        JSON response with success message or error
    """
    try:
        # TODO: Add authentication check to get user_id
        user_id = request.headers.get('X-User-ID', 'user-1')  # Temporary
        
        # Process unlike request
        result = PostService.unlike_post(post_id, user_id)
        
        if result.success:
            return create_success_response(result.message, result.data, 200)
        else:
            return create_bad_request_response(result.message, result.details)
        
    except Exception as e:
        return create_internal_error_response(str(e))


@posts_bp.route('/posts/<post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    """
    Get comments for a specific post.
    
    Args:
        post_id (str): The unique identifier of the post
        
    Returns:
        JSON response with comments or error message
    """
    try:
        comments = PostService.get_post_comments(post_id)
        return format_list_response(comments, resource_name="comments")
        
    except Exception as e:
        return create_internal_error_response(str(e))


@posts_bp.route('/posts/<post_id>/comments', methods=['POST'])
def add_post_comment(post_id):
    """
    Add a comment to a specific post.
    
    Args:
        post_id (str): The unique identifier of the post
        
    Returns:
        JSON response with success message or error
    """
    try:
        # TODO: Add authentication check to get user_id
        user_id = request.headers.get('X-User-ID', 'user-1')  # Temporary
        
        # Validate request format
        validation_error = handle_request_validation(request, required_json=True)
        if validation_error:
            return validation_error
        
        request_data = request.get_json()
        comment_content = request_data.get('comment', '').strip()
        
        if not comment_content:
            return create_bad_request_response("Comment content is required")
        
        # Process add comment request
        result = PostService.add_comment(post_id, user_id, comment_content)
        
        if result.success:
            return create_success_response(result.message, result.data, 201)
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