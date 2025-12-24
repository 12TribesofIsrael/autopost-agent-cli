# BMB Autopost

A social media automation platform that helps businesses and content creators streamline their multi-platform posting workflow.

## Overview

BMB Autopost simplifies social media management by automating content distribution across multiple platforms. Whether you're a boxer, gym owner, restaurant, or local business, this platform helps you maintain a consistent social media presence without the manual work.

## Features

- **Multi-Platform Support**: Connect and manage Instagram, TikTok, YouTube, Facebook, and X (Twitter)
- **Automated Workflows**: Set up automated posting workflows between platforms
- **Intake Form**: Easy onboarding process to capture your social media presence and goals
- **User Dashboard**: Manage your connected accounts and posting preferences
- **Customizable Posting Frequency**: Choose from multiple posting schedules to match your content strategy

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui + Radix UI primitives
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Backend**: Lovable Cloud (Supabase)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── onboarding/     # Onboarding wizard components
│   └── intake/         # Intake form components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions
└── pages/              # Route page components
```

## Key Pages

- `/` - Landing page with hero, features, and pricing
- `/intake` - Client intake form for new users
- `/auth` - Authentication (sign in/sign up)
- `/onboarding` - Guided onboarding wizard
- `/dashboard` - User dashboard (authenticated)

## Environment Variables

The project uses environment variables for configuration. These are automatically managed when using Lovable Cloud:

- `VITE_SUPABASE_URL` - Backend API URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Public API key

## Deployment

Deploy easily through Lovable by clicking **Share → Publish** in the editor, or self-host using any static hosting provider that supports Vite/React applications.

## License

Private - All rights reserved
