# FeedbackPulse Architecture

## System Overview

FeedbackPulse is a SaaS application that allows website owners to collect and manage user feedback through an embeddable widget. Built with Next.js 14, it provides a complete feedback management solution with authentication, project management, and real-time feedback collection.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Hook Form + Zod** - Form validation

### Backend
- **Next.js API Routes** - Server-side API
- **NextAuth.js** - Authentication
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database (via Neon)

### Additional Tools
- **bcryptjs** - Password hashing
- **pnpm** - Package manager

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Dashboard (React)          │    Widget (Vanilla JS)         │
│  - Project Management       │    - Feedback Form             │
│  - Feedback Viewing         │    - Cross-domain Support      │
│  - Label Management         │    - No Dependencies           │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  Authentication Routes      │    Public Routes               │
│  - /api/auth/*             │    - /api/feedback             │
│  - NextAuth.js             │    - /api/widget               │
│                            │                                │
│  Protected Routes          │    CORS Enabled                │
│  - /api/projects           │    - Cross-domain access       │
│  - /api/projects/[id]      │    - OPTIONS handlers          │
│  - /api/feedback/[id]      │                                │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer (Drizzle)                     │
├─────────────────────────────────────────────────────────────┤
│  Database Tables:                                            │
│  - user (authentication)                                     │
│  - account (OAuth providers)                                 │
│  - project (user projects)                                   │
│  - feedback (submitted feedback)                             │
│  - feedbackLabel (feedback tags)                             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL/Neon)                  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
feedbackpulse/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── projects/             # Project CRUD
│   │   ├── feedback/             # Feedback & labels
│   │   └── widget/               # Widget serving
│   ├── auth/                     # Auth pages (signin/signup)
│   ├── dashboard/                # Protected dashboard
│   │   └── projects/[id]/        # Project details & feedback
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── feedback/                 # Feedback display components
│   ├── project/                  # Project components
│   └── providers/                # Context providers
├── db/                          # Database
│   └── schema.ts                # Drizzle schema
├── lib/                         # Utilities
│   ├── auth.ts                  # NextAuth config
│   ├── db.ts                    # Database connection
│   ├── validations.ts           # Zod schemas
│   └── project-utils.ts         # Helper functions
├── types/                       # TypeScript types
│   ├── feedback.ts
│   ├── project.ts
│   └── next-auth.d.ts
├── public/                      # Static files
│   ├── widget.js                # Embeddable widget
│   └── demo.html                # Widget demo
└── docs/                        # Documentation
```

## Core Components

### 1. Authentication System
- **Provider**: NextAuth.js
- **Methods**: Credentials (email/password), Google, GitHub
- **Session**: JWT-based sessions
- **Protection**: Server-side session checks on protected routes

### 2. Project Management
- **Creation**: Users create projects for their websites
- **Key Generation**: Auto-generated 8-character alphanumeric keys
- **Embed Script**: Dynamic script generation with project key
- **CRUD**: Full create, read, update, delete operations

### 3. Feedback Collection
- **Widget**: Standalone JavaScript (no dependencies)
- **Submission**: Public API endpoint with CORS
- **Validation**: Client-side and server-side validation
- **Storage**: PostgreSQL with project association

### 4. Feedback Management
- **Viewing**: Paginated list (15 items/page)
- **Filtering**: By type (bug/feature/other)
- **Labeling**: Add/remove custom labels
- **Organization**: User-defined tags for categorization

## Data Models

### User
```typescript
{
  id: number
  email: string (unique)
  name: string | null
  passwordHash: string | null
  createdAt: Date
  updatedAt: Date
}
```

### Project
```typescript
{
  id: number
  userId: number (FK -> user.id)
  name: string
  projectKey: string (unique)
  createdAt: Date
  updatedAt: Date
}
```

### Feedback
```typescript
{
  id: number
  projectId: number (FK -> project.id)
  type: 'bug' | 'feature' | 'other'
  message: string
  userEmail: string | null
  userName: string | null
  sentiment: string | null
  createdAt: Date
}
```

### FeedbackLabel
```typescript
{
  id: number
  feedbackId: number (FK -> feedback.id)
  label: string
  createdAt: Date
}
```

## Security Features

### Authentication
- Passwords hashed with bcryptjs (10 rounds)
- Session-based authentication
- Server-side session validation
- Secure HTTP-only cookies

### Authorization
- Project ownership validation on all operations
- Feedback ownership verified through project relation
- Label operations require project ownership

### Input Validation
- Zod schemas for all user inputs
- Server-side validation on all endpoints
- XSS prevention through proper encoding
- SQL injection prevention via ORM

### CORS Configuration
- Public endpoints: `/api/feedback`, `/api/widget`
- Configured for cross-domain widget embedding
- Restricted methods (POST, GET, OPTIONS only)

## Performance Optimizations

### Database
- Indexed columns: email, projectKey, userId, projectId
- Cascade deletes for data integrity
- Connection pooling via Neon

### Frontend
- Client-side rendering for dashboard
- Loading states for better UX
- Pagination for large datasets
- Toast notifications (auto-dismiss)

### Widget
- Minimal JavaScript footprint
- No external dependencies
- Lazy loading (loaded on demand)
- Cached by CDN (1-hour cache header)

## Scalability Considerations

### Current Architecture
- Serverless deployment ready (Vercel)
- Stateless API routes
- Database connection pooling
- Client-side state management

### Future Enhancements
- Redis caching for frequent queries
- CDN for widget.js distribution
- Database read replicas
- Rate limiting on public endpoints
- Analytics and sentiment analysis
- Webhooks for real-time notifications

## Deployment

### Environment Variables Required
```
DATABASE_URL=                    # PostgreSQL connection string
NEXTAUTH_URL=                    # Application URL
NEXTAUTH_SECRET=                 # Auth secret (openssl rand -base64 32)
GOOGLE_CLIENT_ID=               # Optional: Google OAuth
GOOGLE_CLIENT_SECRET=           # Optional: Google OAuth
GITHUB_ID=                      # Optional: GitHub OAuth
GITHUB_SECRET=                  # Optional: GitHub OAuth
NEXT_PUBLIC_APP_URL=            # Public-facing URL for widget
```

### Deployment Platforms
- **Recommended**: Vercel (zero-config)
- **Database**: Neon (serverless PostgreSQL)
- **Alternatives**: Netlify, Railway, Render

## Development Workflow

1. **Local Setup**: `pnpm install` → `pnpm dev`
2. **Database**: Push schema with `pnpm drizzle-kit push`
3. **Development**: Hot reload enabled
4. **Testing**: Manual testing + type checking
5. **Deployment**: Push to main branch (auto-deploy)

## Best Practices Implemented

- ✅ Type safety with TypeScript
- ✅ Server-side validation
- ✅ Secure authentication
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications
- ✅ Form validation
- ✅ Code organization
- ✅ Reusable components
