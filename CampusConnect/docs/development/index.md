
# Development Guide

This document explains how to use the frontend API client in **Campus Connect** to communicate with the Flask backend.

---

## Overview

The API client is written in **TypeScript** and provides a clean, type-safe interface to backend endpoints. It supports events, groups, and posts, and includes legacy functions for backward compatibility.

---

## Usage

### Basic Example

```ts
import { api } from '../api';

// Get all events
const events = await api.events.getAll();

// Get an event by ID
const event = await api.events.getById('1');

// Join an event
await api.events.join('1', {
  userName: 'John Doe',
  userEmail: 'john@example.com',
});
````

---

### Legacy Functions

```ts
import { getEvents, joinEvent } from '../api';

// Get events (legacy)
const events = await getEvents();

// Join event (legacy)
await joinEvent({
  eventId: '1',
  userName: 'John Doe',
  userEmail: 'john@example.com',
});
```

---

### Error Handling

```ts
import { api, ApiError } from '../api';

try {
  const events = await api.events.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
  } else {
    console.error('Unexpected Error:', error);
  }
}
```

---

## Endpoints

* **Events**
  `getAll()`, `getById(id)`, `join(id, userData)`
* **Groups**
  `getAll()`, `getById(id)`, `join(id, userData)`
* **Posts**
  `getAll()`, `create(postData)`, `like(id, userData)`

All available under the `api` object.

---

## Configuration

The API base URL is:

```
http://localhost:5000/api
```

You can change it in the `api.ts` file.

---

## Types

The client exports useful types for better development experience:

```ts
import type {
  Event,
  Group,
  Post,
  ApiResponse,
  JoinEventRequest
} from '../api';
```

---

## Summary

* Use `api` methods for all backend interactions.
* Handle errors using `ApiError`.
* TypeScript types ensure safe and clear development.
* Legacy functions are still available if needed.

For questions or contributions, check the project README or contact the development team.

---