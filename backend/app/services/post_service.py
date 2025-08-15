"""
Post service module providing business logic for post operations.

This module contains the PostService class that handles all post-related
business logic including retrieving posts, liking posts, creating posts,
and managing post data with database integration.
"""

from typing import List, Optional, Dict, Any
from app.models.data_models import LikePostRequest, CreatePostRequest, ApiResponse
from app.models.auth_models import Post, User, Comment
from app.database import get_db
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PostService:
    """Service class for handling post-related business logic."""

    @classmethod
    def get_all_posts(cls) -> List[Dict[str, Any]]:
        """
        Retrieve all available posts.
        
        Returns:
            List[Dict]: List of all posts from database
        """
        try:
            with get_db() as db:
                posts = db.query(Post).filter(Post.is_active == True).order_by(Post.created_at.desc()).all()
                return [post.to_dict() for post in posts]
        except Exception as e:
            logger.error(f"Error retrieving posts: {str(e)}")
            return []

    @classmethod
    def get_post_by_id(cls, post_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific post by its ID.
        
        Args:
            post_id (str): The unique identifier of the post
            
        Returns:
            Optional[Dict]: The post if found, None otherwise
        """
        try:
            with get_db() as db:
                post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
                return post.to_dict() if post else None
        except Exception as e:
            logger.error(f"Error retrieving post {post_id}: {str(e)}")
            return None

    @classmethod
    def like_post(cls, post_id: str, user_id: str) -> ApiResponse:
        """
        Handle liking a post.
        
        Args:
            post_id (str): The unique identifier of the post to like
            user_id (str): The ID of the user liking the post
            
        Returns:
            ApiResponse: Success or error response
        """
        try:
            with get_db() as db:
                # Find the post
                post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
                if not post:
                    return ApiResponse(
                        success=False,
                        message=f"Post with ID {post_id} not found"
                    )
                
                # Find the user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return ApiResponse(
                        success=False,
                        message="User not found"
                    )
                
                # Check if user has already liked this post
                if user in post.liked_by_users:
                    return ApiResponse(
                        success=False,
                        message="You have already liked this post"
                    )
                
                # Add like
                post.liked_by_users.append(user)
                db.commit()
                
                logger.info(f"User {user.email} liked post {post.title}")
                return ApiResponse(
                    success=True,
                    message=f"Successfully liked post '{post.title}'",
                    data={
                        "post_id": post_id,
                        "post_title": post.title,
                        "user_id": user_id,
                        "new_like_count": post.like_count
                    }
                )
                
        except Exception as e:
            logger.error(f"Error liking post {post_id}: {str(e)}")
            return ApiResponse(
                success=False,
                message="Failed to like post"
            )

    @classmethod
    def unlike_post(cls, post_id: str, user_id: str) -> ApiResponse:
        """
        Handle unliking a post.
        
        Args:
            post_id (str): The unique identifier of the post to unlike
            user_id (str): The ID of the user unliking the post
            
        Returns:
            ApiResponse: Success or error response
        """
        try:
            with get_db() as db:
                # Find the post
                post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
                if not post:
                    return ApiResponse(
                        success=False,
                        message=f"Post with ID {post_id} not found"
                    )
                
                # Find the user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return ApiResponse(
                        success=False,
                        message="User not found"
                    )
                
                # Check if user has liked this post
                if user not in post.liked_by_users:
                    return ApiResponse(
                        success=False,
                        message="You haven't liked this post"
                    )
                
                # Remove like
                post.liked_by_users.remove(user)
                db.commit()
                
                logger.info(f"User {user.email} unliked post {post.title}")
                return ApiResponse(
                    success=True,
                    message=f"Successfully unliked post '{post.title}'",
                    data={
                        "post_id": post_id,
                        "post_title": post.title,
                        "user_id": user_id,
                        "new_like_count": post.like_count
                    }
                )
                
        except Exception as e:
            logger.error(f"Error unliking post {post_id}: {str(e)}")
            return ApiResponse(
                success=False,
                message="Failed to unlike post"
            )

    @classmethod
    def create_post(cls, create_request: CreatePostRequest, author_id: str) -> ApiResponse:
        """
        Handle creating a new post.
        
        Args:
            create_request (CreatePostRequest): The post creation data
            author_id (str): The ID of the user creating the post
            
        Returns:
            ApiResponse: Success or error response with created post data
        """
        try:
            with get_db() as db:
                # Find the author
                author = db.query(User).filter(User.id == author_id).first()
                if not author:
                    return ApiResponse(
                        success=False,
                        message="User not found"
                    )
                
                # Create new post
                new_post = Post(
                    title=create_request.title,
                    description=create_request.content,  # Map content to description
                    category=create_request.category,
                    author_id=author_id
                )
                
                db.add(new_post)
                db.commit()
                db.refresh(new_post)
                
                logger.info(f"User {author.email} created post {new_post.title}")
                return ApiResponse(
                    success=True,
                    message="Post created successfully",
                    data=new_post.to_dict()
                )
                
        except Exception as e:
            logger.error(f"Error creating post: {str(e)}")
            return ApiResponse(
                success=False,
                message="Failed to create post"
            )

    @classmethod
    def update_post(cls, post_id: str, update_request: CreatePostRequest, user_id: str) -> ApiResponse:
        """
        Handle updating a post.
        
        Args:
            post_id (str): The ID of the post to update
            update_request (CreatePostRequest): The updated post data
            user_id (str): The ID of the user updating the post
            
        Returns:
            ApiResponse: Success or error response
        """
        try:
            with get_db() as db:
                # Find the post
                post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
                if not post:
                    return ApiResponse(
                        success=False,
                        message="Post not found"
                    )
                
                # Check if user is the author
                if post.author_id != user_id:
                    return ApiResponse(
                        success=False,
                        message="You can only edit your own posts"
                    )
                
                # Update post
                post.title = update_request.title
                post.description = update_request.content
                post.category = update_request.category
                
                db.commit()
                db.refresh(post)
                
                logger.info(f"User {user_id} updated post {post.title}")
                return ApiResponse(
                    success=True,
                    message="Post updated successfully",
                    data=post.to_dict()
                )
                
        except Exception as e:
            logger.error(f"Error updating post {post_id}: {str(e)}")
            return ApiResponse(
                success=False,
                message="Failed to update post"
            )

    @classmethod
    def delete_post(cls, post_id: str, user_id: str) -> ApiResponse:
        """
        Handle deleting a post.
        
        Args:
            post_id (str): The ID of the post to delete
            user_id (str): The ID of the user deleting the post
            
        Returns:
            ApiResponse: Success or error response
        """
        try:
            with get_db() as db:
                # Find the post
                post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
                if not post:
                    return ApiResponse(
                        success=False,
                        message="Post not found"
                    )
                
                # Check if user is the author
                if post.author_id != user_id:
                    return ApiResponse(
                        success=False,
                        message="You can only delete your own posts"
                    )
                
                # Soft delete
                post.is_active = False
                db.commit()
                
                logger.info(f"User {user_id} deleted post {post.title}")
                return ApiResponse(
                    success=True,
                    message="Post deleted successfully"
                )
                
        except Exception as e:
            logger.error(f"Error deleting post {post_id}: {str(e)}")
            return ApiResponse(
                success=False,
                message="Failed to delete post"
            )

    @classmethod
    def get_posts_by_category(cls, category: str) -> List[Dict[str, Any]]:
        """
        Retrieve posts filtered by category.
        
        Args:
            category (str): The category to filter by
            
        Returns:
            List[Dict]: List of posts in the specified category
        """
        try:
            with get_db() as db:
                posts = db.query(Post).filter(
                    Post.category == category,
                    Post.is_active == True
                ).order_by(Post.created_at.desc()).all()
                return [post.to_dict() for post in posts]
        except Exception as e:
            logger.error(f"Error retrieving posts by category {category}: {str(e)}")
            return []

    @classmethod
    def get_posts_by_author(cls, author_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve posts filtered by author ID.
        
        Args:
            author_id (str): The author ID to filter by
            
        Returns:
            List[Dict]: List of posts by the specified author
        """
        try:
            with get_db() as db:
                posts = db.query(Post).filter(
                    Post.author_id == author_id,
                    Post.is_active == True
                ).order_by(Post.created_at.desc()).all()
                return [post.to_dict() for post in posts]
        except Exception as e:
            logger.error(f"Error retrieving posts by author {author_id}: {str(e)}")
            return []

    @classmethod
    def add_comment(cls, post_id: str, user_id: str, content: str) -> ApiResponse:
        """
        Add a comment to a post.
        
        Args:
            post_id (str): The ID of the post to comment on
            user_id (str): The ID of the user adding the comment
            content (str): The comment content
            
        Returns:
            ApiResponse: Success or error response
        """
        try:
            with get_db() as db:
                # Find the post
                post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
                if not post:
                    return ApiResponse(
                        success=False,
                        message="Post not found"
                    )
                
                # Find the user
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return ApiResponse(
                        success=False,
                        message="User not found"
                    )
                
                # Create comment
                comment = Comment(
                    content=content,
                    post_id=post_id,
                    author_id=user_id
                )
                
                db.add(comment)
                db.commit()
                db.refresh(comment)
                
                logger.info(f"User {user.email} commented on post {post.title}")
                return ApiResponse(
                    success=True,
                    message="Comment added successfully",
                    data=comment.to_dict()
                )
                
        except Exception as e:
            logger.error(f"Error adding comment to post {post_id}: {str(e)}")
            return ApiResponse(
                success=False,
                message="Failed to add comment"
            )

    @classmethod
    def get_post_comments(cls, post_id: str) -> List[Dict[str, Any]]:
        """
        Get comments for a post.
        
        Args:
            post_id (str): The ID of the post
            
        Returns:
            List[Dict]: List of comments for the post
        """
        try:
            with get_db() as db:
                comments = db.query(Comment).filter(
                    Comment.post_id == post_id,
                    Comment.is_active == True
                ).order_by(Comment.created_at.asc()).all()
                return [comment.to_dict() for comment in comments]
        except Exception as e:
            logger.error(f"Error retrieving comments for post {post_id}: {str(e)}")
            return []

    @classmethod
    def check_user_liked_post(cls, post_id: str, user_id: str) -> bool:
        """
        Check if a user has liked a post.
        
        Args:
            post_id (str): The ID of the post
            user_id (str): The ID of the user
            
        Returns:
            bool: True if user has liked the post, False otherwise
        """
        try:
            with get_db() as db:
                post = db.query(Post).filter(Post.id == post_id).first()
                if not post:
                    return False
                
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    return False
                
                return user in post.liked_by_users
        except Exception as e:
            logger.error(f"Error checking if user {user_id} liked post {post_id}: {str(e)}")
            return False