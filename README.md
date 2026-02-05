# Sales Territory Manager

A web application to manage sales reps and their territory assignments by zip code and channel. Built with **Next.js 14** (App Router), **Supabase**, **Tailwind CSS**, and **shadcn/ui**.

## Features

- **Rep Management**: Full CRUD interface to add, edit, and delete sales reps
- **Territory Upload**: Bulk CSV upload to assign zip codes to reps by channel
- **Public API**: REST endpoint to query reps by zip code
- **Authentication**: NetSuite OAuth integration for secure admin access
- **Row Level Security**: Public read access, authenticated write access

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | NetSuite OAuth 1.0a |
| CSV Parsing | PapaParse |
| Forms | React Hook Form + Zod |

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Copy the contents of `supabase-setup.sql` and run it
4. This creates the `reps` and `assignments` tables with proper RLS policies

### 3. Configure Environment Variables

Create/update `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NetSuite OAuth (for authentication)
NETSUITE_RESTLET_URL=https://your-account.restlets.api.netsuite.com/...
NETSUITE_ACCOUNT_ID=your-account-id
NETSUITE_CONSUMER_KEY=your-consumer-key
NETSUITE_CONSUMER_SECRET=your-consumer-secret
NETSUITE_TOKEN_ID=your-token-id
NETSUITE_TOKEN_SECRET=your-token-secret
NETSUITE_REALM=your-realm

# Session
SESSION_SECRET=your-random-secret-key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Table: `reps`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| phone | text | NULLABLE |
| channel | text | NOT NULL, CHECK (Golf/Promo/Gift) |
| created_at | timestamptz | DEFAULT now() |

### Table: `assignments`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| zip_code | text | NOT NULL, 5-digit format |
| channel | text | NOT NULL, CHECK (Golf/Promo/Gift) |
| rep_id | uuid | FK -> reps(id) ON DELETE CASCADE |
| created_at | timestamptz | DEFAULT now() |

**Composite Unique:** `(zip_code, channel)` - One rep per channel per zip.

## API Endpoint

### GET `/api/get-reps?zip=12345`

Returns all reps covering a specific zip code.

**Response:**

```json
{
  "zip": "12345",
  "reps": {
    "Golf": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-1234"
    },
    "Promo": {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "555-5678"
    },
    "Gift": null
  }
}
```

## CSV Upload Format

For territory assignments, upload a CSV with these columns:

```csv
zip,rep_email
12345,john@example.com
12346,jane@example.com
90210,john@example.com
```

- **zip**: 5-digit US zip code
- **rep_email**: Email of an existing rep in the system

The upload performs an **upsert** - existing assignments for the same zip+channel are updated.

## Project Structure

```
sales-territory-manager/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirects to /admin
│   ├── login/page.tsx          # Login page
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with header
│   │   └── page.tsx            # Admin dashboard with tabs
│   └── api/
│       ├── get-reps/route.ts   # Public API endpoint
│       ├── auth/               # Auth endpoints
│       ├── reps/               # Rep CRUD endpoints
│       └── assignments/        # Assignment upload endpoint
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── rep-table.tsx           # Rep management table
│   ├── rep-form.tsx            # Add/Edit rep dialog
│   └── territory-upload.tsx    # CSV upload component
├── lib/
│   ├── supabase/              # Supabase clients
│   ├── types.ts               # TypeScript types
│   ├── utils.ts               # Utility functions
│   ├── session.ts             # JWT session management
│   └── netsuite-auth.ts       # NetSuite OAuth
├── middleware.ts              # Route protection
└── supabase-setup.sql         # Database setup script
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build for production:

```bash
npm run build
npm start
```

## License

MIT
