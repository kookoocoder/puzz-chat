# Admin System Setup Guide

## Overview

This application now includes a comprehensive admin system with elevated permissions for user management and chat moderation.

## Features

### Admin Capabilities
- ✅ Create new user accounts
- ✅ Delete user accounts
- ✅ Toggle admin status for users
- ✅ Reset user passwords
- ✅ Clear all chat messages
- ✅ Enable/Disable global chat for all users
- ✅ Always access chat even when disabled

### Security Changes
- 🔒 Public signup has been removed
- 🔒 Password reset/forgot password pages are disabled
- 🔒 Only admins can create new accounts
- 🔒 Non-admin users cannot access chat when disabled

## Database Migration

First, run the Prisma migration to add admin fields:

```bash
npx prisma migrate dev --name add_admin_system
npx prisma generate
```

## Creating the First Admin Account

Since signup is disabled, you need to manually set the first admin account in the database:

### Option 1: Using Prisma Studio

```bash
npx prisma studio
```

1. Open the `User` table
2. Find your user account
3. Set `isAdmin` to `true`
4. Save

### Option 2: Using SQL (PostgreSQL)

```sql
UPDATE "user" 
SET "isAdmin" = true 
WHERE email = 'your-email@example.com';
```

### Option 3: Using Prisma Client Script

Create a script `scripts/make-admin.ts`:

```typescript
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: bun run scripts/make-admin.ts user@example.com');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log(`✅ ${user.name} (${user.email}) is now an admin`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
bun run scripts/make-admin.ts your-email@example.com
```

## Accessing the Admin Panel

Once you're an admin:

1. Sign in at `/auth`
2. Navigate to `/admin` or click the Admin Panel button in chat
3. You'll see:
   - Chat Management controls
   - User creation form
   - List of all users with management options

## Admin Panel Routes

- `/admin` - Main admin dashboard (admin only)
- Admin controls visible in `/chat` header for admin users

## Admin Controls in Chat

When you're an admin, you'll see these controls in the chat header:

- 🛡️ **Admin Panel** - Quick link to admin dashboard
- 🔴 **Toggle Chat** - Enable/disable chat for all users
- 🗑️ **Clear Messages** - Delete all chat messages

## Creating New Users

As an admin, you can create new users from `/admin`:

1. Fill in the user creation form:
   - Name
   - Email
   - Password (min. 8 characters)
   - Admin checkbox (optional)
2. Click "Create User"
3. The new user can now sign in at `/auth`

## User Management

For each user (except yourself), you can:

- **Make/Remove Admin** - Toggle admin privileges
- **Reset Password** - Set a new password for the user
- **Delete** - Permanently remove the user and all their data

## Chat Management

### Disable Chat
- Click the disable button to prevent all non-admin users from accessing chat
- Chat page will redirect non-admins to dashboard
- Admins can still access and re-enable chat

### Clear All Messages
- Permanently deletes all messages from the database
- This action cannot be undone
- Use cautiously!

## Security Notes

⚠️ **Important Security Considerations:**

1. **Protect Admin Accounts** - Admin credentials have full system access
2. **Limit Admin Count** - Only grant admin to trusted users
3. **Password Strength** - Use strong passwords for admin accounts
4. **Audit Admin Actions** - Monitor admin activity through chat messages
5. **Backup Before Clearing** - Consider backing up messages before clearing

## Troubleshooting

### Can't Access Admin Panel
- Verify your account has `isAdmin = true` in the database
- Clear browser cache and sign in again
- Check you're accessing `/admin` while signed in

### Password Reset Not Working
- Ensure the user has a credential account (not OAuth)
- Password must be at least 8 characters
- Check database for successful update

### Chat Toggle Not Working
- Refresh the page after toggling
- Check `ChatSettings` table in database
- Verify you're an admin

## Architecture

### New Database Tables/Fields
- `User.isAdmin` - Boolean flag for admin status
- `ChatSettings` - Global chat enable/disable state

### New Routes
- `/admin` - Admin dashboard
- `/admin/actions.ts` - Server actions for admin operations

### New Components
- `AdminClient` - Main admin panel UI
- Admin controls integrated into chat header

### Utility Functions
- `checkIsAdmin()` - Check if current user is admin
- `requireAdmin()` - Throw error if not admin
- `getCurrentUser()` - Get current authenticated user

## Additional Features

- Mobile-responsive admin panel
- Real-time chat status updates
- User statistics (message count, join date)
- Confirmation dialogs for destructive actions
- Toast notifications for all operations

