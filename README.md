# Security Installer App

A comprehensive security installation management system built with React, Supabase, and Tailwind CSS.

## Features

- Manual & Standards Management
- User Posts & Community Chat
- Site Survey Tools
- Supplier Finder
- AI Assistant
- Dark Mode Support

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Supabase credentials
4. Run development server: `npm run dev`

## Database Setup

1. Create a new Supabase project
2. Run the SQL from `src/lib/combined-database.sql`
3. Set up storage buckets for manuals and standards

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```