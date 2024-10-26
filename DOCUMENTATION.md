# Security Installer App Documentation

## Project Overview
A comprehensive web application for security installation professionals to manage manuals, standards, and collaborate with the community.

## Core Features

### 1. Authentication System
- User registration and login
- Role-based access (Admin/User)
- Protected routes and features
- Session management with Supabase Auth

### 2. Document Management

#### Manuals
- Upload/download technical manuals
- PDF file support
- Categorization system
- Search functionality
- Favorite/bookmark system
- Admin-only deletion

#### Standards
- Industry standards repository
- Admin-controlled uploads
- Public viewing
- Favorite/bookmark system
- Category organization

### 3. Community Features

#### User Posts
- Create/edit/delete posts
- Rich text content
- Like/favorite system
- Preview with "Read More"
- Author attribution

#### Community Chat
- Real-time messaging
- User presence
- Message history
- Chat rooms/topics

### 4. Tools & Utilities

#### Site Survey Tool
- Customer information capture
- System type selection
  - Intruder
  - CCTV
  - Access Control
  - Other
- Equipment details
- Notes and specifications
- Survey history

#### Supplier Finder
- Google Maps integration
- Multiple supplier categories:
  - Security suppliers
  - Electrical suppliers
  - Local amenities
- Location-based search
- Contact information

#### AI Assistant
- Manual-aware responses
- Technical guidance
- Installation support
- Chat interface

## Technical Stack

### Frontend
- React 18.3.1
- TypeScript
- Tailwind CSS
- Lucide Icons
- React Google Maps

### Backend (Supabase)
- Authentication
- PostgreSQL Database
- Storage
- Real-time subscriptions

## Database Schema

### Users Table
```sql
create table public.users (
    id uuid references auth.users primary key,
    email text unique,
    role text default 'user',
    full_name text,
    created_at timestamptz,
    updated_at timestamptz
);
```

### Posts Table
```sql
create table public.posts (
    id uuid primary key,
    title text,
    content text,
    author_id uuid,
    likes integer,
    comments integer,
    created_at timestamptz,
    updated_at timestamptz
);
```

### Favorites Table
```sql
create table public.favorites (
    id uuid primary key,
    user_id uuid,
    item_id uuid,
    item_type text,
    created_at timestamptz
);
```

### Standards Table
```sql
create table public.standards (
    id uuid primary key,
    title text,
    description text,
    category text,
    file_url text,
    uploaded_by uuid,
    created_at timestamptz
);
```

## File Structure

```
src/
├── components/
│   ├── AiAssistant.tsx
│   ├── AuthModal.tsx
│   ├── CommunityChat.tsx
│   ├── Favorites.tsx
│   ├── FeatureRequest.tsx
│   ├── Home.tsx
│   ├── ManualList.tsx
│   ├── ManualUpload.tsx
│   ├── PostView.tsx
│   ├── Sidebar.tsx
│   ├── Standards.tsx
│   ├── SupplierFinder.tsx
│   ├── Survey.tsx
│   └── UserPosts.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useFavorites.ts
│   └── useSupabaseQuery.ts
├── lib/
│   ├── database.sql
│   ├── database.types.ts
│   ├── favorites.sql
│   ├── posts.sql
│   ├── standards.sql
│   └── supabase.ts
└── config/
    └── suppliers.ts
```

## Environment Setup

1. Create `.env` file in project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to hosting service of choice (Netlify recommended)

## Future Development

1. Enhanced AI capabilities
2. Mobile app version
3. Offline access
4. Video content integration
5. Advanced search features
6. Analytics dashboard
7. Team collaboration tools
8. Integration with supplier APIs

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - See LICENSE file for details