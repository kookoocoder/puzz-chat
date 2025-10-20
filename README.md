# Sunx - Next.js Authentication Template

A modern, production-ready authentication template built with Next.js 15, Better Auth, Prisma ORM, and shadcn/ui components.
<div align="center">
  <img src="https://github.com/user-attachments/assets/1cde1a61-5b6d-4ef7-a912-a90f81b9dda2" alt="Sign In Page" width="300" height="200" style="border-radius: 8px; margin: 8px;" />
  <img src="https://github.com/user-attachments/assets/a5d9f67a-da94-483d-bae0-a585c67c9feb" alt="Sign Up Page" width="300" height="200" style="border-radius: 8px; margin: 8px;" />
  <img src="https://github.com/user-attachments/assets/731c5049-93e8-45ea-b256-bbd57319d41c" alt="Dashboard" width="300" height="200" style="border-radius: 8px; margin: 8px;" />
</div>
## ✨ Features

- 🔐 **Complete Authentication Flow** - Sign up, sign in, password reset
- 💬 **Real-time Global Chat** - Live messaging with typing indicators and online status
- 🎨 **Modern UI** - Beautiful dark theme with glassmorphism effects
- ⚡ **Next.js 15** - Latest App Router with server actions
- 🗄️ **PostgreSQL Database** - Production-ready database with Prisma ORM
- 🔒 **Better Auth** - Secure authentication with session management
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎯 **TypeScript** - Full type safety throughout
- 🎨 **shadcn/ui** - Professional UI components
- 🔄 **Server Actions** - Form handling with Zod validation
- ✏️ **Message Management** - Edit and delete your own messages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- bun, yarn, or pnpm

### 1. Clone and Install

```bash
git clone https://github.com/rajofearth/sunx.git
cd sunx
bun install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Database - PostgreSQL required for chat feature
# For local development with Prisma.io Accelerate:
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
# For production with Prisma.io:
# DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
DATABASE_URL="postgresql://user:password@localhost:5432/puzz_chat"

# App URL (no trailing slash)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Note**: This project requires PostgreSQL. You can use:
- Local PostgreSQL installation
- [Prisma.io Accelerate](https://www.prisma.io/data-platform/accelerate) - Recommended for Vercel deployment
- [Supabase](https://supabase.com) - Free PostgreSQL hosting
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Easy PostgreSQL deployment

### 3. Database Setup

```bash
# Generate Prisma client
bun run prisma:generate

# Push schema to database
bun run db:push
```

### 4. Start Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── page.tsx              # Auth page (protected from logged-in users)
│   │   └── action.ts             # Server actions for auth
│   ├── chat/
│   │   ├── page.tsx              # Real-time chat page (protected)
│   │   └── actions.ts            # Server actions for chat
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard
│   ├── forgot-password/
│   │   └── page.tsx              # Password reset request
│   ├── reset-password/
│   │   └── page.tsx              # Password reset form
│   ├── api/auth/[...all]/
│   │   └── route.ts              # Better Auth API routes
│   ├── globals.css               # Global styles & Tailwind
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects to auth/dashboard)
├── components/
│   ├── auth-client.tsx           # Auth UI with tabs
│   ├── sign-in.tsx               # Sign in form
│   ├── sign-up.tsx               # Sign up form
│   ├── forgot-password-client.tsx # Forgot password UI
│   ├── reset-password-client.tsx # Reset password UI
│   ├── chat/
│   │   ├── chat-client.tsx       # Main chat container with SWR polling
│   │   ├── message-list.tsx      # Message list with auto-scroll
│   │   ├── message-item.tsx      # Individual message with edit/delete
│   │   ├── message-input.tsx     # Message input with typing detection
│   │   ├── typing-indicator.tsx  # Shows who's typing
│   │   └── online-users.tsx      # Online users sidebar
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── auth.ts                   # Better Auth configuration
│   ├── auth-client.ts            # Client-side auth utilities
│   ├── action-helpers.ts         # Server action utilities
│   ├── types.ts                  # Zod schemas
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Utility functions
└── generated/
    └── prisma/                   # Generated Prisma client
```

## 🔧 Configuration

### Better Auth Setup

The authentication is configured in `src/lib/auth.ts`:

```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    async sendResetPassword({ user, url, token }, request) {
      // TODO: Implement your email sending logic here
      console.log(`Password reset email for ${user.email}: ${url}`);
    },
  },
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  plugins: [nextCookies()],
});
```

### Database Schema

The Prisma schema includes all necessary tables for Better Auth and Chat:

- **User** - User information and authentication data
- **Session** - User sessions for authentication
- **Account** - OAuth and credential accounts
- **Verification** - Email verification tokens
- **Message** - Chat messages with soft delete and edit tracking
- **TypingStatus** - Real-time typing indicators

## 💬 Chat Feature

The chat feature provides a real-time messaging experience with:

### Features
- **Global Chat Room** - Single chat room accessible to all authenticated users
- **Real-time Updates** - Messages update every 3 seconds using SWR polling
- **Message Management** - Edit and delete your own messages
- **Typing Indicators** - See who's currently typing (updates every 2 seconds)
- **Online Status** - View all users online in the last 5 minutes (updates every 10 seconds)
- **Message History** - Last 100 messages are displayed
- **Date Separators** - Messages grouped by date for better readability
- **Character Limit** - 1000 characters per message

### Usage
1. Navigate to `/chat` (requires authentication)
2. Type your message in the input box
3. Press Enter to send (Shift+Enter for new line)
4. Hover over your messages to edit or delete them
5. See online users in the right sidebar

### Technical Details
- **Polling Strategy**: Uses SWR with different intervals for different data types
  - Messages: 3 seconds
  - Typing status: 2 seconds  
  - Online users: 10 seconds
- **Authentication**: All chat actions require valid session
- **Soft Deletes**: Deleted messages remain in database but show as "deleted"
- **Edit Tracking**: Edited messages are marked with "(edited)" label

## 🎨 Customization

### Styling

The template uses Tailwind CSS v4 with a custom dark theme. Customize by modifying:

- `src/app/globals.css` - Global styles and CSS variables
- Component-specific classes in the components
- The theme uses CSS variables for easy customization

### Email Provider

To enable email functionality (password reset, verification), implement the email sending functions in `src/lib/auth.ts`:

```typescript
async sendResetPassword({ user, url, token }, request) {
  // Example with Resend
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to: user.email,
      subject: 'Reset your password',
      html: `<a href="${url}">Reset Password</a>`,
    }),
  });
}
```

Popular email providers:
- [Resend](https://resend.com) - Developer-friendly email API
- [SendGrid](https://sendgrid.com) - Enterprise email service
- [Postmark](https://postmarkapp.com) - Transactional email
- [AWS SES](https://aws.amazon.com/ses/) - Amazon's email service

## 🚀 Deployment

### Deploying to Vercel with Prisma.io

For the best experience on Vercel, we recommend using Prisma.io Accelerate:

1. **Set up Prisma.io Accelerate**
   - Sign up at [Prisma.io](https://www.prisma.io/data-platform)
   - Create a new project and get your Accelerate connection string
   - The connection string will look like: `prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY`

2. **Configure your Vercel project**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import the project in Vercel
   - Set environment variables:
     ```env
     DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
     NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
     ```

3. **Deploy**
   - Vercel will automatically run the build
   - The Prisma client is generated during build time
   - Your chat will be live with near real-time updates!

### Alternative PostgreSQL Providers

You can also use other PostgreSQL providers:

- **Supabase**: Free tier available, good for small projects
  ```env
  DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
  ```

- **Neon**: Serverless PostgreSQL with generous free tier
  ```env
  DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
  ```

- **Railway**: Easy one-click PostgreSQL deployment
  - Connection string provided in project settings

### Environment Variables

Required environment variables for production:

```env
DATABASE_URL="your-production-postgresql-url"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Deployment Platforms

This template works with all major deployment platforms:

- **Vercel** - Recommended for Next.js apps
- **Netlify** - Great for static sites
- **Railway** - Easy database + app deployment
- **Render** - Simple deployment with PostgreSQL
- **AWS/GCP/Azure** - Enterprise deployments

## 🛠️ Development

### Available Scripts

```bash
bun dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run typecheck    # TypeScript type checking
bun run prisma:generate  # Generate Prisma client
bun run db:push      # Push schema to database
```

### Adding New Features

1. **New Pages**: Add to `src/app/` following the existing pattern
2. **Components**: Create in `src/components/` with proper TypeScript
3. **Server Actions**: Use the `validatedAction` helper in `src/lib/action-helpers.ts`
4. **Database**: Add models to `prisma/schema.prisma`

## 🔒 Security Features

- **Password Hashing** - Uses scrypt for secure password hashing
- **Session Management** - Secure session handling with expiration
- **Input Validation** - Zod schemas for all form inputs
- **CSRF Protection** - Built-in CSRF protection with Better Auth
- **Rate Limiting** - Configurable rate limiting for auth endpoints
- **Type Safety** - Full TypeScript coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Better Auth](https://better-auth.com) - Authentication library
- [Prisma](https://prisma.io) - Database toolkit
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - CSS framework

---

**Ready to build something amazing?** 🚀

This template provides a solid foundation for any Next.js application requiring authentication. Just add your business logic and deploy!
