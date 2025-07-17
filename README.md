# 🧩 Riddlix

**Challenge Minds. Build Teams.**

Riddlix is a team-based riddle-solving platform that brings teams together through daily challenges, friendly competition, and collaborative problem-solving. Built for organizations looking to engage their teams in fun, intellectual challenges while building stronger connections.

## 🎯 Features

### 🏆 Team Competition
- **Team Formation**: Create or join teams with colleagues and friends
- **Real-Time Leaderboards**: Track individual and team progress with live rankings
- **Streak Tracking**: Maintain solving streaks for bonus points and recognition

### 🧩 Daily Challenges
- **Time-Limited Riddles**: New challenges every day, available for 24 hours
- **Multiple Formats**: Support for multiple choice and freeform answers
- **One Shot Rule**: Single submission per riddle - make it count!

### 🎮 Engaging Experience
- **Smart Scheduling**: Automated riddle delivery on custom timelines
- **Progress Tracking**: Detailed statistics and performance metrics
- **Social Features**: Team collaboration and friendly competition

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations

### Backend
- **Supabase** - Postgres database and real-time features
- **Drizzle ORM** - Type-safe database operations
- **Server Actions** - Modern API patterns
- **Clerk** - Authentication and user management

### Deployment
- **Vercel** - Serverless deployment platform
- **PostgreSQL** - Production database on Supabase

## 🏗️ Project Structure

```
riddlix/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication routes
│   ├── (landing)/         # Landing page
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   ├── leaderboard/       # Rankings and statistics
│   ├── profile/           # User profile management
│   ├── riddles/           # Riddle browsing and solving
│   └── teams/             # Team management
├── lib/                   # Shared utilities
│   ├── actions/           # Server actions
│   ├── components/        # React components
│   └── hooks/             # Custom hooks
├── db/                    # Database schema and config
│   └── schema/            # Table definitions
├── public/                # Static assets
└── supabase/             # Database migrations
```

## 🎮 How It Works

### 1. Join or Create a Team
Get your crew together or join an existing team already solving challenges.

### 2. Solve Daily Riddles
Each day brings a new challenge, available for 24 hours. Miss it, and you'll have to wait for the next one.

### 3. Compete and Climb
Points, streaks, and rankings create friendly competition. Track your progress on real-time leaderboards.

## 🔧 Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Supabase](https://supabase.com/) account
- [Clerk](https://clerk.com/) account
- [Vercel](https://vercel.com/) account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jayrichh/riddlix.git
   cd riddlix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and configure:
   ```env
   # Database
   DATABASE_URL=your_supabase_database_url
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Database Setup

1. **Create Supabase project**
2. **Run migrations**: `npm run db:push`
3. **Configure RLS policies** for security

### Authentication Setup

1. **Create Clerk application**
2. **Configure OAuth providers** (optional)
3. **Set up webhooks** for user sync

## 📊 Admin Features

### Content Management
- **Riddle Creation**: Add new challenges with rich text editor
- **Team Oversight**: Monitor team activities and resolve issues
- **User Management**: Handle user roles and permissions

### Analytics
- **Engagement Metrics**: Track participation and completion rates
- **Performance Insights**: Identify popular riddles and team dynamics
- **Export Data**: Generate reports for organizational insights

## 🛠️ Development

### Code Structure
- **Server Actions**: All database operations use type-safe server actions
- **Component Library**: Consistent UI with Shadcn/ui components
- **Type Safety**: Full TypeScript coverage with strict mode

### Database Schema
- **Users**: Authentication and profile data
- **Teams**: Team information and membership
- **Riddles**: Challenge content and metadata
- **Submissions**: User responses and scoring

---

**Built with ❤️ for teams who love a good challenge**
