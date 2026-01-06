# FeedbackPulse API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://feedbackpulse-sepia.vercel.app`

## Authentication

Most endpoints require authentication via NextAuth.js session cookies. Public endpoints are marked as **[PUBLIC]**.

---

## Authentication Endpoints

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Errors:**
- `400` - Email already exists
- `400` - Invalid email or password format

---

### POST `/api/auth/signin`
Sign in with credentials (handled by NextAuth).

**Note:** The actual sign-in page is at `/signin` (not `/api/auth/signin`). NextAuth handles the API internally.

---

## Project Endpoints

### GET `/api/projects`
Get all projects for authenticated user.

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "name": "My Website",
    "projectKey": "K7MP9XL2",
    "createdAt": "2026-01-06T10:00:00.000Z",
    "updatedAt": "2026-01-06T10:00:00.000Z"
  }
]
```

---

### POST `/api/projects`
Create a new project.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Awesome Website"
}
```

**Validation:**
- `name`: 3-100 characters, required

**Response (201):**
```json
{
  "id": 1,
  "name": "My Awesome Website",
  "projectKey": "K7MP9XL2",
  "embedScript": "<script>...</script>",
  "createdAt": "2026-01-06T10:00:00.000Z"
}
```

**Errors:**
- `400` - Project name is required
- `401` - Unauthorized
- `500` - Failed to generate unique project key

---

### GET `/api/projects/[id]`
Get a specific project by ID.

**Authentication:** Required

**Parameters:**
- `id` - Project ID (integer)

**Response (200):**
```json
{
  "id": 1,
  "userId": 1,
  "name": "My Website",
  "projectKey": "K7MP9XL2",
  "createdAt": "2026-01-06T10:00:00.000Z",
  "updatedAt": "2026-01-06T10:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid project ID
- `401` - Unauthorized
- `404` - Project not found

---

### PATCH `/api/projects/[id]`
Update a project's name.

**Authentication:** Required

**Parameters:**
- `id` - Project ID (integer)

**Request Body:**
```json
{
  "name": "Updated Project Name"
}
```

**Response (200):**
```json
{
  "id": 1,
  "userId": 1,
  "name": "Updated Project Name",
  "projectKey": "K7MP9XL2",
  "createdAt": "2026-01-06T10:00:00.000Z",
  "updatedAt": "2026-01-06T11:30:00.000Z"
}
```

**Errors:**
- `400` - Project name is required
- `401` - Unauthorized
- `403` - Not project owner
- `404` - Project not found

---

### DELETE `/api/projects/[id]`
Delete a project and all associated feedback.

**Authentication:** Required

**Parameters:**
- `id` - Project ID (integer)

**Response (200):**
```json
{
  "message": "Project deleted successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Not project owner
- `404` - Project not found

---

## Feedback Endpoints

### POST `/api/feedback` **[PUBLIC]**
Submit feedback from the widget (no authentication required).

**CORS:** Enabled

**Request Body:**
```json
{
  "projectKey": "K7MP9XL2",
  "type": "bug",
  "message": "The login button doesn't work on mobile",
  "userName": "Jane Doe",
  "userEmail": "jane@example.com"
}
```

**Validation:**
- `projectKey`: Required
- `type`: Required, must be 'bug', 'feature', or 'other'
- `message`: Required, 10-1000 characters
- `userName`: Optional, max 100 characters
- `userEmail`: Optional, valid email format

**Response (201):**
```json
{
  "success": true,
  "id": 42,
  "message": "Feedback submitted successfully"
}
```

**Errors:**
- `400` - Missing required fields
- `400` - Invalid feedback type
- `404` - Invalid project key

---

### GET `/api/projects/[id]/feedback`
Get all feedback for a specific project.

**Authentication:** Required

**Parameters:**
- `id` - Project ID (integer)

**Response (200):**
```json
[
  {
    "id": 1,
    "projectId": 1,
    "type": "bug",
    "message": "The login button doesn't work",
    "userEmail": "user@example.com",
    "userName": "John Doe",
    "sentiment": null,
    "createdAt": "2026-01-06T10:30:00.000Z",
    "labels": [
      {
        "id": 1,
        "feedbackId": 1,
        "label": "high-priority",
        "createdAt": "2026-01-06T11:00:00.000Z"
      }
    ]
  }
]
```

**Errors:**
- `401` - Unauthorized
- `404` - Project not found

---

## Label Endpoints

### POST `/api/feedback/[id]/labels`
Add a label to a feedback item.

**Authentication:** Required

**Parameters:**
- `id` - Feedback ID (integer)

**Request Body:**
```json
{
  "label": "high-priority"
}
```

**Validation:**
- `label`: 2-50 characters, required

**Response (201):**
```json
{
  "id": 1,
  "feedbackId": 1,
  "label": "high-priority",
  "createdAt": "2026-01-06T11:00:00.000Z"
}
```

**Errors:**
- `400` - Label is required
- `401` - Unauthorized
- `403` - Not project owner
- `404` - Feedback not found

---

### DELETE `/api/feedback/[id]/labels/[labelId]`
Remove a label from a feedback item.

**Authentication:** Required

**Parameters:**
- `id` - Feedback ID (integer)
- `labelId` - Label ID (integer)

**Response (200):**
```json
{
  "message": "Label removed successfully"
}
```

**Errors:**
- `400` - Invalid ID
- `401` - Unauthorized
- `403` - Not project owner
- `404` - Label not found

---

## Widget Endpoint

### GET `/api/widget` **[PUBLIC]**
Serves the embeddable widget JavaScript file.

**CORS:** Enabled

**Response (200):**
- Content-Type: `application/javascript`
- Cache-Control: `public, max-age=3600`
- Returns widget.js file content

**Usage:**
```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/api/widget';
    script.dataset.projectKey = 'K7MP9XL2';
    script.dataset.apiUrl = 'https://your-domain.com';
    document.head.appendChild(script);
  })();
</script>
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not allowed to access resource)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- 100 requests/minute for authenticated endpoints
- 10 requests/minute for public feedback submission
- IP-based limiting for widget endpoint

---

## CORS Headers

Public endpoints include these CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Example Usage

### Complete Flow Example

**1. Register & Login**
```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","name":"Test User"}'

# Then sign in via the web interface at /signin
```

**2. Create Project**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"name":"My Website"}'
```

**3. Submit Feedback (from widget)**
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "projectKey":"K7MP9XL2",
    "type":"bug",
    "message":"Found a bug in the login form",
    "userName":"Jane",
    "userEmail":"jane@example.com"
  }'
```

**4. Get Feedback**
```bash
curl http://localhost:3000/api/projects/1/feedback \
  -H "Cookie: next-auth.session-token=..."
```

**5. Add Label**
```bash
curl -X POST http://localhost:3000/api/feedback/1/labels \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"label":"urgent"}'
```

---

## WebSocket Support

Currently not implemented. Future consideration for real-time feedback notifications.

---

## Webhooks

Currently not implemented. Future consideration for:
- New feedback notifications
- Label changes
- Project updates
