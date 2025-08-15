"""
Post service module providing business logic for post operations.

This module contains the PostService class that handles all post-related
business logic including retrieving posts, liking posts, creating posts,
and managing post data with mock data for development.
"""

from typing import List, Optional
from app.models.data_models import Post, LikePostRequest, CreatePostRequest, ApiResponse, Author
import uuid
from datetime import datetime


class PostService:
    """Service class for handling post-related business logic."""
    
    # Mock posts data matching the frontend structure
    _mock_posts = [
        {
            "id": "1",
            "title": "Study Group for CS 101 Final Exam",
            "description": "Hey everyone! I'm organizing a study group for the CS 101 final exam next week. We'll be meeting in the library on Saturday at 2 PM. Bring your notes and let's ace this together!",
            "author": {
                "name": "Sarah Chen",
                "avatar": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
                "role": "Computer Science Student"
            },
            "timestamp": "2 hours ago",
            "likes": 24,
            "comments": 8,
            "category": "academic"
        },
        {
            "id": "2",
            "title": "Campus Coffee Shop Opens Tomorrow!",
            "description": "Exciting news! The new Brew & Books café is opening tomorrow in the Student Union building. They'll be serving locally roasted coffee and offering 20% discount to all students with valid ID!",
            "author": {
                "name": "Campus News",
                "avatar": "https://images.pexels.com/photos/1181605/pexels-photo-1181605.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
                "role": "Official Account"
            },
            "timestamp": "4 hours ago",
            "likes": 156,
            "comments": 32,
            "category": "announcement"
        },
        {
            "id": "3",
            "title": "Looking for Basketball Players",
            "description": "Our intramural basketball team needs 2 more players for the upcoming season. We practice Tuesdays and Thursdays at 6 PM. No experience necessary, just bring your enthusiasm!",
            "author": {
                "name": "Mike Rodriguez",
                "avatar": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
                "role": "Sports Management Student"
            },
            "timestamp": "1 day ago",
            "likes": 43,
            "comments": 15,
            "category": "social"
        },
        {
            "id": "4",
            "title": "Free Tutoring Available",
            "description": "The Academic Success Center is offering free tutoring sessions for Math, Physics, and Chemistry. Sessions are available Monday through Friday, 10 AM to 8 PM. Book your slot online!",
            "author": {
                "name": "Academic Success Center",
                "avatar": "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
                "role": "Campus Resource"
            },
            "timestamp": "2 days ago",
            "likes": 89,
            "comments": 12,
            "category": "academic"
        }
    ]

    @classmethod
    def get_all_posts(cls) -> List[Post]:
        """
        Retrieve all available posts.
        
        Returns:
            List[Post]: List of all posts with validation
        """
        return [Post(**post_data) for post_data in cls._mock_posts]

    @classmethod
    def get_post_by_id(cls, post_id: str) -> Optional[Post]:
        """
        Retrieve a specific post by its ID.
        
        Args:
            post_id (str): The unique identifier of the post
            
        Returns:
            Optional[Post]: The post if found, None otherwise
        """
        post_data = next((post for post in cls._mock_posts if post['id'] == post_id), None)
        return Post(**post_data) if post_data else None

    @classmethod
    def like_post(cls, post_id: str, like_request: LikePostRequest) -> ApiResponse:
        """
        Handle liking a post.
        
        Args:
            post_id (str): The unique identifier of the post to like
            like_request (LikePostRequest): The like request data
            
        Returns:
            ApiResponse: Success or error response
        """
        # Find the post
        post_data = next((post for post in cls._mock_posts if post['id'] == post_id), None)
        
        if not post_data:
            return ApiResponse(
                success=False,
                message=f"Post with ID {post_id} not found"
            )
        
        # In a real implementation, we would:
        # 1. Check if user has already liked this post
        # 2. Toggle like status (like/unlike)
        # 3. Update database
        # 4. Possibly notify post author
        
        # For mock implementation, just increment likes count
        post_data['likes'] += 1
        
        return ApiResponse(
            success=True,
            message=f"Successfully liked post '{post_data['title']}'",
            data={
                "post_id": post_id,
                "post_title": post_data['title'],
                "user_id": like_request.user_id,
                "new_like_count": post_data['likes']
            }
        )

    @classmethod
    def create_post(cls, create_request: CreatePostRequest) -> ApiResponse:
        """
        Handle creating a new post.
        
        Args:
            create_request (CreatePostRequest): The post creation data
            
        Returns:
            ApiResponse: Success or error response with created post data
        """
        # Generate new post ID
        new_post_id = str(uuid.uuid4())
        
        # Create new post data
        new_post_data = {
            "id": new_post_id,
            "title": create_request.title,
            "description": create_request.description,
            "author": {
                "name": create_request.author_name,
                "avatar": create_request.author_avatar,
                "role": create_request.author_role
            },
            "timestamp": "just now",
            "likes": 0,
            "comments": 0,
            "category": create_request.category
        }
        
        # In a real implementation, we would:
        # 1. Validate user permissions
        # 2. Save to database
        # 3. Possibly moderate content
        # 4. Send notifications to followers
        
        # For mock implementation, add to our mock data
        cls._mock_posts.insert(0, new_post_data)  # Add to beginning for newest first
        
        # Create Post object for validation
        new_post = Post(**new_post_data)
        
        return ApiResponse(
            success=True,
            message="Post created successfully",
            data={
                "post": new_post.dict(),
                "post_id": new_post_id
            }
        )

    @classmethod
    def get_posts_by_category(cls, category: str) -> List[Post]:
        """
        Retrieve posts filtered by category.
        
        Args:
            category (str): The category to filter by
            
        Returns:
            List[Post]: List of posts in the specified category
        """
        filtered_posts = [post for post in cls._mock_posts if post['category'] == category]
        return [Post(**post_data) for post_data in filtered_posts]

    @classmethod
    def get_posts_by_author(cls, author_name: str) -> List[Post]:
        """
        Retrieve posts filtered by author name.
        
        Args:
            author_name (str): The author name to filter by
            
        Returns:
            List[Post]: List of posts by the specified author
        """
        filtered_posts = [post for post in cls._mock_posts if post['author']['name'] == author_name]
        return [Post(**post_data) for post_data in filtered_posts]