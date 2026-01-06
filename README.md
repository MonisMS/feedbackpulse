# FeedbackPulse

A modern SaaS feedback collection platform that allows you to embed customizable feedback widgets on any website and manage user feedback efficiently.

## Features

- 🔐 **Authentication** - Email/password, Google, and GitHub OAuth
- 📊 **Project Management** - Create multiple projects with unique keys
- 🔌 **Embeddable Widget** - Standalone JavaScript widget (no dependencies)
- 🏷️ **Label System** - Organize feedback with custom labels
- 🔍 **Filtering** - Filter feedback by type (bug, feature, other)
- 📄 **Pagination** - Efficient data handling for large datasets
- ✅ **Form Validation** - Client and server-side validation with Zod
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔔 **Toast Notifications** - User-friendly action feedback

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS 4
- **Validation**: Zod + react-hook-form
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Neon recommended)
- pnpm, npm, or yarn

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd feedbackpulse
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
# or
yarn install
```

3. **Setup database**
```bash
# Generate migrations
pnpm drizzle-kit generate

# Push schema to database
pnpm drizzle-kit push
```

4. **Run development server**
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
feedbackpulse/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Auth pages (signin/signup)
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── feedback/          # Feedback-related components
│   ├── project/           # Project-related components
│   └── providers/         # Context providers
├── db/                    # Database schema
├── docs/                  # Documentation
│   ├── architecture.md    # System architecture
│   └── api.md            # API documentation
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── validations.ts    # Zod schemas
├── public/               # Static files
│   ├── widget.js         # Embeddable widget
│   └── demo.html         # Widget demo page
└── types/                # TypeScript types
```

## Usage

### 1. Create an Account

Visit `/auth/signup` and create an account using:
- Email and password
- Google OAuth
- GitHub OAuth

### 2. Create a Project

1. Navigate to the dashboard
2. Click "Create New Project"
3. Enter a project name
4. Copy the generated embed script

### 3. Embed the Widget

Add the generated script to any HTML page:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your content -->
  
  <!-- Feedback Widget -->
  <script>
    (function() {
      var script = document.createElement('script');
      script.src = 'http://localhost:3000/api/widget';
      script.dataset.projectKey = 'YOUR_PROJECT_KEY';
      script.dataset.apiUrl = 'http://localhost:3000';
      document.head.appendChild(script);
    })();
  </script>
</body>
</html>
```

### 4. View Feedback

1. Go to your project in the dashboard
2. Click "View Details"
3. Navigate to the "Feedback" tab
4. Filter, label, and paginate through submissions

## Testing

### Testing the Complete Flow

1. **Register & Login**
   - Visit `/auth/signup`
   - Create an account
   - Sign in at `/auth/signin`

2. **Create a Project**
   - Click "Create New Project" on dashboard
   - Enter name: "Test Project"
   - Copy the embed script

3. **Test Widget**
   - Open `public/demo.html` in a browser
   - Replace the project key with yours
   - Click the feedback button
   - Submit test feedback

4. **View Feedback**
   - Return to dashboard
   - Click on your project
   - Go to "Feedback" tab
   - See your test submission
   - Add labels like "bug" or "urgent"

5. **CRUD Operations**
   - Update project name
   - Delete labels
   - Delete project

### Using the Demo Page

The `public/demo.html` file provides a ready-to-use testing environment:

```bash
# Open in browser
open public/demo.html
# or on Windows
start public/demo.html
```

Update the project key and API URL in the script, then test all widget features.

## Database Schema

### Users
- `id`, `name`, `email`, `password`, `emailVerified`, `image`

### Accounts (OAuth)
- `userId`, `provider`, `providerAccountId`, `tokens`

### Projects
- `id`, `userId`, `name`, `projectKey` (unique), `createdAt`, `updatedAt`

### Feedback
- `id`, `projectId`, `type`, `message`, `userEmail`, `userName`, `sentiment`, `createdAt`

### Feedback Labels
- `id`, `feedbackId`, `label`, `createdAt`

See [docs/architecture.md](docs/architecture.md) for detailed schema information.

## API Documentation

Full API documentation available at [docs/api.md](docs/api.md).

### Key Endpoints

- `POST /api/auth/register` - Register new user
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `POST /api/feedback` - Submit feedback (public)
- `GET /api/projects/[id]/feedback` - Get project feedback
- `POST /api/feedback/[id]/labels` - Add label

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
# Build
pnpm build

# Start production server
pnpm start
```

### Database Migration

```bash
# Generate migration
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit push
```

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Drizzle migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

## Environment-Specific Configuration

### Development
- Hot reload enabled
- Detailed error messages
- Source maps included

### Production
- Optimized builds
- Minified assets
- Error tracking recommended (Sentry)

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure network connectivity

### Widget Not Loading
- Check CORS settings
- Verify project key is correct
- Check browser console for errors

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check OAuth credentials
- Clear browser cookies

## Contributing

This is an internship assignment project. Contributions are not currently accepted.

## License

MIT

## Contact

For questions or issues, please contact the project maintainer.

---

Built with ❤️ using Next.js and TypeScript
