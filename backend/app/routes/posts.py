"""
Posts API routes.

This module defines the Flask blueprint for post-related endpoints,
including retrieving posts, creating posts, and liking posts.
"""

from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from app.services.post_service import PostService
from app.models.data_models import LikePostRequest, CreatePostRequest, ApiResponse, ApiErrorResponse

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
        elif author:
            posts = PostService.get_posts_by_author(author)
        else:
            posts = PostService.get_all_posts()
        
        # Convert to dict for JSON serialization
        posts_data = [post.dict() for post in posts]
        
        filter_msg = ""
        if category:
            filter_msg = f" for category: {category}"
        elif author:
            filter_msg = f" by author: {author}"
        
        return jsonify({
            'success': True,
            'message': f'Posts retrieved successfully{filter_msg}',
            'data': posts_data
        }), 200
        
    except Exception as e:
        error_response = ApiErrorResponse(
            message="Failed to retrieve posts",
            error="INTERNAL_ERROR",
            details={"error": str(e)}
        )
        return jsonify(error_response.dict()), 500


@posts_bp.route('/posts', methods=['POST'])
def create_post():
    """
    Create a new post.
    
    Returns:
        JSON response with created post data or error message
    """
    try:
        # Get JSON data from request
        if not request.is_json:
            error_response = ApiErrorResponse(
                message="Request must be JSON",
                error="BAD_REQUEST"
            )
            return jsonify(error_response.dict()), 400
        
        request_data = request.get_json()
        
        # Validate request data using Pydantic model
        try:
            create_request = CreatePostRequest(**request_data)
        except ValidationError as e:
            error_response = ApiErrorResponse(
                message="Invalid request data",
                error="VALIDATION_ERROR",
                details={"validation_errors": e.errors()}
            )
            return jsonify(error_response.dict()), 400
        
        # Process create request
        result = PostService.create_post(create_request)
        
        if result.success:
            return jsonify(result.dict()), 201
        else:
            return jsonify(result.dict()), 400
            
    except Exception as e:
        error_response = ApiErrorResponse(
            message="Failed to create post",
            error="INTERNAL_ERROR",
            details={"error": str(e)}
        )
        return jsonify(error_response.dict()), 500


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
            error_response = ApiErrorResponse(
                message=f"Post with ID {post_id} not found",
                error="NOT_FOUND"
            )
            return jsonify(error_response.dict()), 404
        
        return jsonify({
            'success': True,
            'message': 'Post retrieved successfully',
            'data': post.dict()
        }), 200
        
    except Exception as e:
        error_response = ApiErrorResponse(
            message="Failed to retrieve post",
            error="INTERNAL_ERROR",
            details={"error": str(e)}
        )
        return jsonify(error_response.dict()), 500


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
        # Get JSON data from request
        if not request.is_json:
            error_response = ApiErrorResponse(
                message="Request must be JSON",
                error="BAD_REQUEST"
            )
            return jsonify(error_response.dict()), 400
        
        request_data = request.get_json()
        
        # Validate request data using Pydantic model
        try:
            like_request = LikePostRequest(**request_data)
        except ValidationError as e:
            error_response = ApiErrorResponse(
                message="Invalid request data",
                error="VALIDATION_ERROR",
                details={"validation_errors": e.errors()}
            )
            return jsonify(error_response.dict()), 400
        
        # Process like request
        result = PostService.like_post(post_id, like_request)
        
        if result.success:
            return jsonify(result.dict()), 200
        else:
            return jsonify(result.dict()), 400
            
    except Exception as e:
        error_response = ApiErrorResponse(
            message="Failed to like post",
            error="INTERNAL_ERROR",
            details={"error": str(e)}
        )
        return jsonify(error_response.dict()), 500


@posts_bp.errorhandler(404)
def post_not_found(error):
    """Handle 404 errors for post routes."""
    error_response = ApiErrorResponse(
        message="Post endpoint not found",
        error="NOT_FOUND"
    )
    return jsonify(error_response.dict()), 404


@posts_bp.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors for post routes."""
    error_response = ApiErrorResponse(
        message="Method not allowed for this post endpoint",
        error="METHOD_NOT_ALLOWED"
    )
    return jsonify(error_response.dict()), 405