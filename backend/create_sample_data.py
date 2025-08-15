#!/usr/bin/env python3
"""
Create sample data for the CampusConnect application.

This script creates sample users, posts, events, and groups for testing.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.models.auth_models import User, Post, Event, Group, Comment
from werkzeug.security import generate_password_hash
import uuid
from datetime import datetime, timedelta

def create_sample_users():
    """Create sample users."""
    # Initialize database first
    from app.database import init_db
    init_db()
    
    users_data = [
        {
            'email': 'sarah.chen@university.edu',
            'first_name': 'Sarah',
            'last_name': 'Chen',
            'major': 'Computer Science',
            'year_of_study': 'Junior',
            'bio': 'Passionate about AI and machine learning. Love organizing study groups!',
            'password': 'password123'
        },
        {
            'email': 'mike.rodriguez@university.edu',
            'first_name': 'Mike',
            'last_name': 'Rodriguez',
            'major': 'Sports Management',
            'year_of_study': 'Senior',
            'bio': 'Captain of the basketball team. Always looking for new players!',
            'password': 'password123'
        },
        {
            'email': 'admin@university.edu',
            'first_name': 'Campus',
            'last_name': 'Admin',
            'major': 'Administration',
            'year_of_study': 'Staff',
            'bio': 'Official campus account for announcements and updates.',
            'password': 'password123'
        },
        {
            'email': 'user1@university.edu',
            'first_name': 'Test',
            'last_name': 'User',
            'major': 'Computer Science',
            'year_of_study': 'Sophomore',
            'bio': 'Test user for development.',
            'password': 'password123',
            'custom_id': 'user-1'  # Fixed ID for frontend
        }
    ]
    
    users = []
    with get_db() as db:
        for user_data in users_data:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data['email']).first()
            if existing_user:
                users.append(existing_user)
                continue
                
            user = User(
                id=user_data.get('custom_id', str(uuid.uuid4())),
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                major=user_data['major'],
                year_of_study=user_data['year_of_study'],
                bio=user_data['bio'],
                is_verified=True,
                is_active=True
            )
            user.set_password(user_data['password'])
            
            db.add(user)
            users.append(user)
        
        db.commit()
        for user in users:
            db.refresh(user)
    
    return users

def create_sample_posts(users):
    """Create sample posts."""
    posts_data = [
        {
            'title': 'Study Group for CS 101 Final Exam',
            'description': "Hey everyone! I'm organizing a study group for the CS 101 final exam next week. We'll be meeting in the library on Saturday at 2 PM. Bring your notes and let's ace this together!",
            'category': 'academic',
            'author_email': 'sarah.chen@university.edu'
        },
        {
            'title': 'Campus Coffee Shop Opens Tomorrow!',
            'description': "Exciting news! The new Brew & Books café is opening tomorrow in the Student Union building. They'll be serving locally roasted coffee and offering 20% discount to all students with valid ID!",
            'category': 'announcement',
            'author_email': 'admin@university.edu'
        },
        {
            'title': 'Looking for Basketball Players',
            'description': "Our intramural basketball team needs 2 more players for the upcoming season. We practice Tuesdays and Thursdays at 6 PM. No experience necessary, just bring your enthusiasm!",
            'category': 'social',
            'author_email': 'mike.rodriguez@university.edu'
        },
        {
            'title': 'Free Tutoring Available',
            'description': "The Academic Success Center is offering free tutoring sessions for Math, Physics, and Chemistry. Sessions are available Monday through Friday, 10 AM to 8 PM. Book your slot online!",
            'category': 'academic',
            'author_email': 'admin@university.edu'
        }
    ]
    
    posts = []
    with get_db() as db:
        for post_data in posts_data:
            # Find author
            author = next((u for u in users if u.email == post_data['author_email']), None)
            if not author:
                continue
                
            post = Post(
                title=post_data['title'],
                description=post_data['description'],
                category=post_data['category'],
                author_id=author.id
            )
            
            db.add(post)
            posts.append(post)
        
        db.commit()
        for post in posts:
            db.refresh(post)
    
    return posts

def create_sample_comments(users, posts):
    """Create sample comments."""
    comments_data = [
        {
            'content': 'This is really helpful! Thanks for sharing.',
            'post_title': 'Study Group for CS 101 Final Exam',
            'author_email': 'mike.rodriguez@university.edu'
        },
        {
            'content': 'Count me in for the study group!',
            'post_title': 'Study Group for CS 101 Final Exam',
            'author_email': 'admin@university.edu'
        },
        {
            'content': 'Finally! I was waiting for a good coffee shop on campus.',
            'post_title': 'Campus Coffee Shop Opens Tomorrow!',
            'author_email': 'sarah.chen@university.edu'
        },
        {
            'content': 'I\'m interested in joining the basketball team!',
            'post_title': 'Looking for Basketball Players',
            'author_email': 'sarah.chen@university.edu'
        }
    ]
    
    with get_db() as db:
        for comment_data in comments_data:
            # Find author
            author = next((u for u in users if u.email == comment_data['author_email']), None)
            if not author:
                continue
                
            # Find post
            post = next((p for p in posts if p.title == comment_data['post_title']), None)
            if not post:
                continue
                
            comment = Comment(
                content=comment_data['content'],
                post_id=post.id,
                author_id=author.id
            )
            
            db.add(comment)
        
        db.commit()

def create_sample_likes(users, posts):
    """Create sample likes."""
    with get_db() as db:
        # Sarah likes Mike's basketball post
        sarah = next((u for u in users if u.email == 'sarah.chen@university.edu'), None)
        basketball_post = next((p for p in posts if 'Basketball' in p.title), None)
        
        if sarah and basketball_post:
            basketball_post.liked_by_users.append(sarah)
        
        # Mike likes Sarah's study group post
        mike = next((u for u in users if u.email == 'mike.rodriguez@university.edu'), None)
        study_post = next((p for p in posts if 'Study Group' in p.title), None)
        
        if mike and study_post:
            study_post.liked_by_users.append(mike)
        
        # Both like the coffee shop announcement
        coffee_post = next((p for p in posts if 'Coffee Shop' in p.title), None)
        if coffee_post:
            if sarah:
                coffee_post.liked_by_users.append(sarah)
            if mike:
                coffee_post.liked_by_users.append(mike)
        
        db.commit()

def main():
    """Main function to create all sample data."""
    print("Creating sample data for CampusConnect...")
    
    try:
        # Create users
        print("Creating sample users...")
        users = create_sample_users()
        print(f"Created {len(users)} users")
        
        # Create posts
        print("Creating sample posts...")
        posts = create_sample_posts(users)
        print(f"Created {len(posts)} posts")
        
        # Create comments
        print("Creating sample comments...")
        create_sample_comments(users, posts)
        print("Created sample comments")
        
        # Create likes
        print("Creating sample likes...")
        create_sample_likes(users, posts)
        print("Created sample likes")
        
        print("\nSample data created successfully!")
        print("\nSample user credentials:")
        print("- sarah.chen@university.edu / password123")
        print("- mike.rodriguez@university.edu / password123")
        print("- admin@university.edu / password123")
        
    except Exception as e:
        print(f"Error creating sample data: {str(e)}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())