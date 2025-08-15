"""
Group service module providing business logic for group operations.

This module contains the GroupService class that handles all group-related
business logic including retrieving groups, joining groups, and managing
group data with mock data for development.
"""

from typing import List, Optional
from app.models.data_models import Group, JoinGroupRequest, ApiResponse


class GroupService:
    """Service class for handling group-related business logic."""
    
    # Mock groups data matching the frontend structure
    _mock_groups = [
        {
            "id": "1",
            "name": "Robotics Club",
            "description": "Build, program, and compete with robots! We participate in national competitions and work on innovative projects. Perfect for engineering and computer science students.",
            "category": "academic",
            "members": 45,
            "image": "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400",
            "meetingTime": "Wednesdays 7:00 PM",
            "location": "Engineering Lab 204",
            "contact": "robotics@campus.edu",
            "tags": ["STEM", "competition", "technology"]
        },
        {
            "id": "2",
            "name": "Drama Society",
            "description": "Express yourself through theater! We produce 3 major shows per year and offer opportunities for acting, directing, set design, and technical theater.",
            "category": "arts",
            "members": 78,
            "image": "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=400",
            "meetingTime": "Tuesdays & Thursdays 6:00 PM",
            "location": "Theater Arts Building",
            "contact": "drama@campus.edu",
            "tags": ["theater", "performance", "creativity"]
        },
        {
            "id": "3",
            "name": "Environmental Action Group",
            "description": "Making our campus and community more sustainable. We organize clean-up events, sustainability workshops, and advocate for environmental policies.",
            "category": "service",
            "members": 67,
            "image": "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400",
            "meetingTime": "Mondays 5:30 PM",
            "location": "Student Union Room 240",
            "contact": "green@campus.edu",
            "tags": ["environment", "activism", "community"]
        },
        {
            "id": "4",
            "name": "Business Network Society",
            "description": "Connect with future business leaders and industry professionals. We host networking events, guest speaker sessions, and career development workshops.",
            "category": "professional",
            "members": 123,
            "image": "https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400",
            "meetingTime": "Fridays 4:00 PM",
            "location": "Business School Auditorium",
            "contact": "business@campus.edu",
            "tags": ["networking", "career", "business"]
        },
        {
            "id": "5",
            "name": "Ultimate Frisbee Club",
            "description": "Fast-paced, fun, and competitive ultimate frisbee. We practice regularly and compete in regional tournaments. All skill levels welcome!",
            "category": "sports",
            "members": 34,
            "image": "https://images.pexels.com/photos/606539/pexels-photo-606539.jpeg?auto=compress&cs=tinysrgb&w=400",
            "meetingTime": "Tuesdays & Saturdays 4:00 PM",
            "location": "Campus Recreation Fields",
            "contact": "frisbee@campus.edu",
            "tags": ["sports", "fitness", "competition"]
        },
        {
            "id": "6",
            "name": "Cultural Exchange Club",
            "description": "Celebrate diversity and learn about different cultures. We organize cultural events, language exchange programs, and international friendship activities.",
            "category": "social",
            "members": 89,
            "image": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
            "meetingTime": "Thursdays 6:30 PM",
            "location": "International House",
            "contact": "cultural@campus.edu",
            "tags": ["culture", "diversity", "international"]
        },
        {
            "id": "7",
            "name": "Photography Society",
            "description": "Capture the world through your lens! Weekly photo walks, workshops on technique and editing, and annual photography exhibition.",
            "category": "arts",
            "members": 56,
            "image": "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=400",
            "meetingTime": "Sundays 2:00 PM",
            "location": "Art Building Studio 3",
            "contact": "photo@campus.edu",
            "tags": ["photography", "art", "creativity"]
        },
        {
            "id": "8",
            "name": "Volunteer Corps",
            "description": "Make a difference in our community! We coordinate volunteer opportunities at local nonprofits, organize service projects, and promote civic engagement.",
            "category": "service",
            "members": 112,
            "image": "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400",
            "meetingTime": "Wednesdays 7:30 PM",
            "location": "Community Service Center",
            "contact": "volunteer@campus.edu",
            "tags": ["service", "community", "volunteer"]
        }
    ]

    @classmethod
    def get_all_groups(cls) -> List[Group]:
        """
        Retrieve all available groups.
        
        Returns:
            List[Group]: List of all groups with validation
        """
        return [Group(**group_data) for group_data in cls._mock_groups]

    @classmethod
    def get_group_by_id(cls, group_id: str) -> Optional[Group]:
        """
        Retrieve a specific group by its ID.
        
        Args:
            group_id (str): The unique identifier of the group
            
        Returns:
            Optional[Group]: The group if found, None otherwise
        """
        group_data = next((group for group in cls._mock_groups if group['id'] == group_id), None)
        return Group(**group_data) if group_data else None

    @classmethod
    def join_group(cls, group_id: str, join_request: JoinGroupRequest) -> ApiResponse:
        """
        Handle joining a group.
        
        Args:
            group_id (str): The unique identifier of the group to join
            join_request (JoinGroupRequest): The join request data
            
        Returns:
            ApiResponse: Success or error response
        """
        # Find the group
        group_data = next((group for group in cls._mock_groups if group['id'] == group_id), None)
        
        if not group_data:
            return ApiResponse(
                success=False,
                message=f"Group with ID {group_id} not found"
            )
        
        # In a real implementation, we would:
        # 1. Check if user is already a member
        # 2. Add user to group members
        # 3. Send confirmation email to user and group organizers
        # 4. Update database
        
        # For mock implementation, just increment members count
        group_data['members'] += 1
        
        return ApiResponse(
            success=True,
            message=f"Successfully joined '{group_data['name']}'. The group organizers will contact you at {join_request.user_email}.",
            data={
                "group_id": group_id,
                "group_name": group_data['name'],
                "user_name": join_request.user_name,
                "user_email": join_request.user_email,
                "message": join_request.message,
                "new_member_count": group_data['members'],
                "contact": group_data['contact']
            }
        )

    @classmethod
    def get_groups_by_category(cls, category: str) -> List[Group]:
        """
        Retrieve groups filtered by category.
        
        Args:
            category (str): The category to filter by
            
        Returns:
            List[Group]: List of groups in the specified category
        """
        filtered_groups = [group for group in cls._mock_groups if group['category'] == category]
        return [Group(**group_data) for group_data in filtered_groups]

    @classmethod
    def create_group(cls, create_request, user_id: str) -> ApiResponse:
        """
        Create a new group.
        
        Args:
            create_request: The group creation data
            user_id (str): The ID of the user creating the group
            
        Returns:
            ApiResponse: Success or error response with created group data
        """
        try:
            # Generate a new ID for the group
            new_id = str(len(cls._mock_groups) + 1)
            
            # Create new group data
            new_group_data = {
                "id": new_id,
                "name": create_request.name,
                "description": create_request.description,
                "category": create_request.category,
                "members": 1,  # Creator is the first member
                "image": create_request.image or "https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400",
                "meetingTime": create_request.meeting_time,
                "location": create_request.location,
                "contact": create_request.contact,
                "tags": []
            }
            
            # Add to mock groups list
            cls._mock_groups.append(new_group_data)
            
            # Create Group object for validation
            new_group = Group(**new_group_data)
            
            return ApiResponse(
                success=True,
                message="Group created successfully",
                data=new_group_data
            )
            
        except Exception as e:
            return ApiResponse(
                success=False,
                message=f"Failed to create group: {str(e)}"
            )