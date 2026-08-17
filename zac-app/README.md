# Zoology Animal Club (ZAC)

A modern, responsive, full-stack web application focused on animal protection, biodiversity awareness, and conservation education.

## Features
- **Nature-themed Design:** Rich aesthetics, dynamic animations, and responsive layouts.
- **Animal Database:** Filter and search animals by habitat, category, and conservation status.
- **Red List & Deep Sea Pages:** Dedicated themes for highlighting specific species.
- **Extinct Archive:** Explore animals lost to history, along with the causes.
- **Admin Dashboard:** Secure login to add animals and facts.
- **Persistent Storage:** MongoDB integration ensures all data is saved securely.

## Tech Stack
- **Frontend:** Next.js (App Router), React, Framer Motion, Vanilla CSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB (Mongoose)

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment Variables**
   Create a \`.env.local\` file in the root directory and add your MongoDB connection string.
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/zac
   \`\`\`
   *If you do not create this file, the app will automatically attempt to connect to \`mongodb://localhost:27017/zac\`.*

3. **Run the Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   The application will be available at [http://localhost:3000](http://localhost:3000).

4. **Seed the Database**
   The database will automatically be seeded with initial data (Bengel Tiger, Giant Panda, etc.) upon first visit to the homepage. If you need to re-seed, simply clear your database and visit the homepage again.

5. **Admin Access**
   Visit `/admin` to add new animals. The default password is `admin123`.

## Architecture & Code Quality
- Modular UI components (Navbar, Footer, AnimalCard).
- Type-safe models using Mongoose and TypeScript.
- Smooth framer-motion animations for all cards.
- Dark-mode and alternative themes implemented cleanly using Vanilla CSS variables.
