"""
Database initialization script.

This script creates the database tables and populates them with sample data
for development and testing purposes.
"""

import os
import sys
from datetime import datetime, timedelta

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_database, create_tables, get_db
from app.models.auth_models import User, Event, Group, Post, Comment
from app.config import Config

def create_sample_users():
    """Create sample users for testing."""
    sample_users = [
        {
            'email': 'john.doe@university.edu',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'Password123!',
            'major': 'Computer Science',
            'year_of_study': 'junior',
            'user_role': 'student',
            'bio': 'Passionate about AI and machine learning. Love coding and solving complex problems.',
            'phone': '+1-555-0101'
        },
        {
            'email': 'jane.smith@university.edu',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'password': 'Password123!',
            'major': 'Business Administration',
            'year_of_study': 'senior',
            'user_role': 'student',
            'bio': 'Future entrepreneur with interests in sustainable business practices.',
            'phone': '+1-555-0102'
        },
        {
            'email': 'mike.johnson@university.edu',
            'first_name': 'Mike',
            'last_name': 'Johnson',
            'password': 'Password123!',
            'major': 'Psychology',
            'year_of_study': 'sophomore',
            'user_role': 'student',
            'bio': 'Studying human behavior and mental health. Aspiring therapist.',
            'phone': '+1-555-0103'
        },
        {
            'email': 'sarah.wilson@university.edu',
            'first_name': 'Sarah',
            'last_name': 'Wilson',
            'password': 'Password123!',
            'major': 'Art History',
            'year_of_study': 'freshman',
            'user_role': 'student',
            'bio': 'Art enthusiast and museum lover. Exploring the intersection of art and technology.',
            'phone': '+1-555-0104'
        },
        {
            'email': 'alex.brown@university.edu',
            'first_name': 'Alex',
            'last_name': 'Brown',
            'password': 'Password123!',
            'major': 'Engineering',
            'year_of_study': 'graduate',
            'user_role': 'teacher',
            'bio': 'PhD candidate in Mechanical Engineering. Research focus on renewable energy systems.',
            'phone': '+1-555-0105'
        }
    ]
    
    users = []
    with get_db() as db:
        for user_data in sample_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == user_data['email']).first()
            if existing_user:
                users.append(existing_user)
                continue
            
            user = User(
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                phone=user_data['phone'],
                major=user_data['major'],
                year_of_study=user_data['year_of_study'],
                user_role=user_data['user_role'],
                bio=user_data['bio'],
                is_verified=True,
                is_active=True
            )
            user.set_password(user_data['password'])
            user.update_full_name()
            
            db.add(user)
            users.append(user)
        
        db.commit()
    
    print(f"Created {len(users)} sample users")
    return users

def create_sample_events():
    """Create sample events for testing."""
    sample_events = [
        {
            'title': 'Tech Career Fair 2024',
            'description': 'Connect with top tech companies and explore career opportunities in software engineering, data science, and more. Representatives from Google, Microsoft, Apple, and many startups will be present.',
            'category': 'career',
            'date': '2024-03-15',
            'time': '10:00 AM - 4:00 PM',
            'location': 'Student Union Building - Main Hall',
            'organizer': 'Career Services Department',
            'max_attendees': 200,
            'image_url': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
        },
        {
            'title': 'Spring Music Festival',
            'description': 'Join us for an evening of live music featuring local bands and student performers. Food trucks and activities for all ages.',
            'category': 'arts',
            'date': '2024-03-20',
            'time': '6:00 PM - 10:00 PM',
            'location': 'Campus Amphitheater',
            'organizer': 'Student Activities Board',
            'max_attendees': 300,
            'image_url': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
        },
        {
            'title': 'Study Abroad Information Session',
            'description': 'Learn about study abroad opportunities and application processes for various international programs. Hear from students who have studied abroad.',
            'category': 'academic',
            'date': '2024-03-18',
            'time': '2:00 PM - 3:30 PM',
            'location': 'International Center - Conference Room A',
            'organizer': 'International Programs Office',
            'max_attendees': 50,
            'image_url': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'
        },
        {
            'title': 'Basketball Tournament Finals',
            'description': 'Cheer on our campus teams in the final championship games of the intramural basketball season. Free pizza and drinks!',
            'category': 'sports',
            'date': '2024-03-22',
            'time': '7:00 PM - 9:00 PM',
            'location': 'Recreation Center Gym',
            'organizer': 'Intramural Sports Department',
            'max_attendees': 150,
            'image_url': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'
        },
        {
            'title': 'Mental Health Awareness Workshop',
            'description': 'Interactive workshop focusing on stress management techniques and mental wellness resources available on campus.',
            'category': 'social',
            'date': '2024-03-25',
            'time': '1:00 PM - 3:00 PM',
            'location': 'Wellness Center - Room 201',
            'organizer': 'Counseling and Psychological Services',
            'max_attendees': 40,
            'image_url': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'
        },
        {
            'title': 'Entrepreneurship Pitch Competition',
            'description': 'Students present their startup ideas to a panel of judges. Winner receives $5,000 in seed funding.',
            'category': 'career',
            'date': '2024-03-28',
            'time': '5:00 PM - 8:00 PM',
            'location': 'Business School Auditorium',
            'organizer': 'Entrepreneurship Center',
            'max_attendees': 100,
            'image_url': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400'
        }
    ]
    
    events = []
    with get_db() as db:
        for event_data in sample_events:
            # Check if event already exists
            existing_event = db.query(Event).filter(Event.title == event_data['title']).first()
            if existing_event:
                events.append(existing_event)
                continue
            
            event = Event(**event_data)
            db.add(event)
            events.append(event)
        
        db.commit()
    
    print(f"Created {len(events)} sample events")
    return events

def create_sample_groups():
    """Create sample groups for testing."""
    sample_groups = [
        {
            'name': 'Computer Science Club',
            'description': 'A community for CS students to collaborate on projects, share knowledge, and prepare for technical interviews.',
            'category': 'academic',
            'meeting_time': 'Wednesdays 7:00 PM',
            'location': 'Engineering Building Room 205',
            'contact': 'cs-club@university.edu',
            'image_url': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400'
        },
        {
            'name': 'Photography Society',
            'description': 'Explore the art of photography through workshops, photo walks, and exhibitions. All skill levels welcome.',
            'category': 'arts',
            'meeting_time': 'Saturdays 2:00 PM',
            'location': 'Art Building Studio 3',
            'contact': 'photo-society@university.edu',
            'image_url': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'
        },
        {
            'name': 'Debate Team',
            'description': 'Develop critical thinking and public speaking skills through competitive debate tournaments.',
            'category': 'academic',
            'meeting_time': 'Tuesdays & Thursdays 6:00 PM',
            'location': 'Liberal Arts Building Room 150',
            'contact': 'debate-team@university.edu',
            'image_url': 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400'
        },
        {
            'name': 'Environmental Action Group',
            'description': 'Working together to promote sustainability and environmental awareness on campus and in the community.',
            'category': 'service',
            'meeting_time': 'Mondays 5:30 PM',
            'location': 'Student Center Room 301',
            'contact': 'green-action@university.edu',
            'image_url': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400'
        },
        {
            'name': 'International Students Association',
            'description': 'Supporting international students and promoting cultural exchange through events and activities.',
            'category': 'social',
            'meeting_time': 'Fridays 4:00 PM',
            'location': 'International Center Lounge',
            'contact': 'isa@university.edu',
            'image_url': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400'
        }
    ]
    
    groups = []
    with get_db() as db:
        for group_data in sample_groups:
            # Check if group already exists
            existing_group = db.query(Group).filter(Group.name == group_data['name']).first()
            if existing_group:
                groups.append(existing_group)
                continue
            
            group = Group(**group_data)
            db.add(group)
            groups.append(group)
        
        db.commit()
    
    print(f"Created {len(groups)} sample groups")
    return groups

def create_sample_posts(users):
    """Create sample posts for testing."""
    # Get user IDs from the database to avoid session issues
    with get_db() as db:
        user_ids = [db.query(User).filter(User.email == user.email).first().id for user in users]
    
    sample_posts = [
        {
            'title': 'Tips for Acing Technical Interviews',
            'description': 'Just finished my internship interviews and wanted to share some tips that helped me succeed. Practice coding problems daily, understand system design basics, and don\'t forget to ask good questions!',
            'category': 'academic',
            'author_id': user_ids[0]  # John Doe
        },
        {
            'title': 'Looking for Study Group - Organic Chemistry',
            'description': 'Anyone interested in forming a study group for Organic Chemistry? I\'m struggling with reaction mechanisms and could use some help. Let\'s meet at the library!',
            'category': 'academic',
            'author_id': user_ids[2]  # Mike Johnson
        },
        {
            'title': 'Amazing Art Exhibition Downtown',
            'description': 'Just visited the new contemporary art exhibition at the downtown gallery. The installations are mind-blowing! Highly recommend checking it out before it ends next month.',
            'category': 'social',
            'author_id': user_ids[3]  # Sarah Wilson
        },
        {
            'title': 'Startup Idea: Campus Food Delivery',
            'description': 'Working on a business plan for a campus-specific food delivery service. Would love to get feedback from fellow students. What features would you want to see?',
            'category': 'announcement',
            'author_id': user_ids[1]  # Jane Smith
        },
        {
            'title': 'Research Opportunity in Renewable Energy',
            'description': 'Our lab is looking for undergraduate research assistants to work on solar panel efficiency projects. Great opportunity to gain hands-on experience. PM me for details!',
            'category': 'academic',
            'author_id': user_ids[4]  # Alex Brown
        }
    ]
    
    posts = []
    with get_db() as db:
        for post_data in sample_posts:
            # Check if post already exists
            existing_post = db.query(Post).filter(Post.title == post_data['title']).first()
            if existing_post:
                posts.append(existing_post)
                continue
            
            post = Post(**post_data)
            db.add(post)
            posts.append(post)
        
        db.commit()
    
    print(f"Created {len(posts)} sample posts")
    return posts

def create_sample_relationships(users, events, groups, posts):
    """Create sample relationships between users and content."""
    with get_db() as db:
        # Refresh objects in current session to avoid detached instance errors
        fresh_users = [db.query(User).filter(User.email == user.email).first() for user in users]
        fresh_events = [db.query(Event).filter(Event.title == event.title).first() for event in events]
        fresh_groups = [db.query(Group).filter(Group.name == group.name).first() for group in groups]
        fresh_posts = [db.query(Post).filter(Post.title == post.title).first() for post in posts]
        
        # Users join events
        if len(fresh_users) >= 3 and len(fresh_events) >= 3:
            fresh_users[0].joined_events.extend([fresh_events[0], fresh_events[2]])  # John joins tech fair and study abroad
            fresh_users[1].joined_events.extend([fresh_events[0], fresh_events[1]])  # Jane joins tech fair and music festival
            fresh_users[2].joined_events.extend([fresh_events[3], fresh_events[4]])  # Mike joins basketball and mental health
            
            # Users save events
            fresh_users[0].saved_events.append(fresh_events[1])  # John saves music festival
            fresh_users[1].saved_events.append(fresh_events[2])  # Jane saves study abroad
            
        # Users join groups
        if len(fresh_users) >= 3 and len(fresh_groups) >= 3:
            fresh_users[0].joined_groups.extend([fresh_groups[0], fresh_groups[2]])  # John joins CS club and debate team
            fresh_users[1].joined_groups.extend([fresh_groups[3], fresh_groups[4]])  # Jane joins environmental and international
            fresh_users[2].joined_groups.append(fresh_groups[1])  # Mike joins photography
            
        # Users like posts
        if len(fresh_users) >= 3 and len(fresh_posts) >= 3:
            fresh_users[1].liked_posts.extend([fresh_posts[0], fresh_posts[4]])  # Jane likes John's and Alex's posts
            fresh_users[2].liked_posts.extend([fresh_posts[0], fresh_posts[3]])  # Mike likes John's and Jane's posts
            fresh_users[3].liked_posts.append(fresh_posts[1])  # Sarah likes Mike's post
        
        db.commit()
    
    print("Created sample relationships between users and content")

def main():
    """Main function to initialize the database with sample data."""
    print("Initializing database...")
    
    # Initialize database
    init_database(Config.SQLALCHEMY_DATABASE_URI)
    create_tables()
    
    print("Creating sample data...")
    
    # Create sample data
    users = create_sample_users()
    events = create_sample_events()
    groups = create_sample_groups()
    posts = create_sample_posts(users)
    
    # Create relationships
    create_sample_relationships(users, events, groups, posts)
    
    print("\nDatabase initialization completed successfully!")
    print(f"Created:")
    print(f"  - {len(users)} users")
    print(f"  - {len(events)} events")
    print(f"  - {len(groups)} groups")
    print(f"  - {len(posts)} posts")
    print("\nYou can now start the Flask application and test the complete functionality.")

if __name__ == "__main__":
    main()