# Restaurant Voting App

A Next.js application for team restaurant voting and order management with Discord authentication and Firebase backend.

## Features

- **Discord Authentication**: Secure login with Discord OAuth2
- **Role-based Access**: Admin and user roles with different permissions
- **Restaurant Voting**: Create polls, vote on restaurants, and view results
- **Order Management**: Place orders after voting closes
- **Real-time Updates**: Live voting results and order tracking
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 13 (App Router), TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Discord provider
- **Database**: Firebase Firestore
- **UI Components**: Radix UI components with shadcn/ui
- **Forms**: React Hook Form with Zod validation

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd restaurant-voting-app
npm install
```

### 2. Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URI: `http://localhost:3000/api/auth/callback/discord`
5. Copy Client ID and Client Secret

### 3. Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Get your Firebase config from Project Settings
4. Create the following collections in Firestore:
   - `users` - User profiles and roles
   - `polls` - Restaurant voting polls
   - `votes` - User votes (subcollection under polls)
   - `orders` - User orders (subcollection under polls)

### 4. Environment Variables

Create a `.env.local` file and add:

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## User Roles

### Admin Users
- Can create new restaurant polls
- Can close polls manually
- Can view all orders and calculate totals

### Regular Users
- Can vote on active polls
- Can place orders after polls close
- Can view voting results

## How It Works

1. **Authentication**: Users sign in with Discord
2. **User Creation**: First-time users are automatically added to Firestore with 'user' role
3. **Poll Creation**: Admins create polls with restaurant options and end times
4. **Voting**: Users vote for their preferred restaurant
5. **Results**: Real-time voting results with percentage breakdown
6. **Orders**: After poll closes, users can place their food orders
7. **Summary**: View all orders and total costs

## Database Structure

### Users Collection
```typescript
{
  uid: string
  name: string
  email: string
  role: "admin" | "user"
}
```

### Polls Collection
```typescript
{
  id: string
  title: string
  restaurantOptions: string[]
  createdBy: string
  votingEndsAt: Timestamp
  closed: boolean
  selectedRestaurant: string | null
}
```

### Votes Subcollection
```typescript
{
  userId: string
  restaurant: string
  createdAt: Timestamp
}
```

### Orders Subcollection
```typescript
{
  userId: string
  dish: string
  notes: string
  cost: number
  createdAt: Timestamp
}
```

## Deployment

This app can be deployed to Vercel, Netlify, or any other platform that supports Next.js.

1. Build the application: `npm run build`
2. Deploy to your preferred platform
3. Update environment variables in production
4. Update Discord OAuth redirect URI for production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License