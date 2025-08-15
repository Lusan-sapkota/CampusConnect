# Frontend API Client

This module provides a TypeScript API client for communicating with the Flask backend API.

## Features

- **Type Safety**: Full TypeScript support with proper type definitions
- **Error Handling**: Custom `ApiError` class with detailed error information
- **Consistent Interface**: Unified API structure for all endpoints
- **Backward Compatibility**: Legacy functions `getEvents()` and `joinEvent()` for existing code

## Usage

### Basic Usage

```typescript
import { api } from '../api';

// Get all events
const events = await api.events.getAll();

// Get specific event
const event = await api.events.getById('1');

// Join an event
await api.events.join('1', {
  userName: 'John Doe',
  userEmail: 'john@example.com'
});
```

### Legacy Functions

```typescript
import { getEvents, joinEvent } from '../api';

// Get all events (legacy)
const events = await getEvents();

// Join event (legacy)
await joinEvent({
  eventId: '1',
  userName: 'John Doe',
  userEmail: 'john@example.com'
});
```

### Error Handling

```typescript
import { api, ApiError } from '../api';

try {
  const events = await api.events.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Response:', error.response);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## API Endpoints

### Events
- `api.events.getAll()` - Get all events
- `api.events.getById(id)` - Get event by ID
- `api.events.join(id, userData)` - Join an event

### Groups
- `api.groups.getAll()` - Get all groups
- `api.groups.getById(id)` - Get group by ID
- `api.groups.join(id, userData)` - Join a group
s
### Posts
- `api.posts.getAll()` - Get all posts
- `api.posts.create(postData)` - Create a new post
- `api.posts.like(id, userData)` - Like a post

## Configuration

The API client is configured to connect to `http://localhost:5000/api` by default. This can be modified in `api.ts` if needed.

## Types

All TypeScript types are available from the main export:

```typescript
import type { Event, Group, Post, ApiResponse, JoinEventRequest } from '../api';
```