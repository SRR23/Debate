
# Community Debate

A full-stack web platform where users can create and join debates, post arguments, vote on responses, and track their performance on a public scoreboard.

Built using Next.js 15 (App Router), Prisma, PostgreSQL, NextAuth, Cloudinary, and Tailwind CSS.


## Features

- User authentication with GitHub login via NextAuth.js.
- Debate creation with title, description, tags, category, image, and duration.
- Users join one side (Support or Oppose) per debate.
- Argument posting system with vote count and edit/delete option (within 5 minutes).
- Voting system: one vote per argument per user
- Debate auto-close after timer ends, winner decided by vote count.
- Scoreboard leaderboard with weekly/monthly/all-time filters.
- Auto-moderation to block banned words in arguments (e.g., “stupid”, “idiot”, “dumb”).
- Mobile responsive UI with dark/light mode toggle.
- Search and filter debates by tag, title, or category.

## Installation

    Clone the Repository:

    git clone https://github.com/SRR23/Debate.git
    cd Debate
    
## Configure Environment Variable

    DATABASE_URL=postgresql://user:password@localhost:5432/dbname
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    NEXTAUTH_URL=http://localhost:3000
    GITHUB_ID=your_github_client_id
    GITHUB_SECRET=your_github_client_secret


## Run Prisma

    npx prisma generate
    npx prisma migrate dev

## Start Server

    npm run dev

## Technologies Used

    Next.js
    Tailwind CSS
    Prisma
    Postgresql
    Cloudinary # For store image
    NextAuth.js
    Zod
    React Hook Form
    Framer Motion
