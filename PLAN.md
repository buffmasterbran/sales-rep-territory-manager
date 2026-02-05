# Sales Territory Manager - Implementation Plan

## Overview
A web application to manage sales reps and their territory assignments by zip code and channel. Built with **Next.js 14** (App Router) + **Supabase** + **Tailwind CSS** + **shadcn/ui**.

---

## 1. Database Schema (Supabase)

### Table: `reps`
| Column   | Type        | Constraints                  |
|----------|-------------|------------------------------|
| id       | uuid        | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| name     | text        | NOT NULL                     |
| email    | text        | NOT NULL, UNIQUE             |
| phone    | text        | NULLABLE                     |
| channel  | text        | NOT NULL, CHECK (channel IN ('Golf', 'Promo', 'Gift')) |
| created_at | timestamptz | DEFAULT now()              |

**Note:** Each rep belongs to exactly ONE channel (Golf, Promo, or Gift).

### Table: `assignments`
| Column   | Type        | Constraints                  |
|----------|-------------|------------------------------|
| id       | uuid        | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| zip_code | text        | NOT NULL, CHECK (5-digit US format) |
| channel  | text        | NOT NULL, CHECK (channel IN ('Golf', 'Promo', 'Gift')) |
| rep_id   | uuid        | FOREIGN KEY -> reps(id) ON DELETE CASCADE |
| created_at | timestamptz | DEFAULT now()              |

**Composite Unique Constraint:** `(zip_code, channel)` - ensures one rep per channel per zip.

### Row Level Security (RLS)
- **SELECT:** Public (anyone can read via API)
- **INSERT/UPDATE/DELETE:** Authenticated users only

---

## 2. Project Structure

```
sales-territory-manager/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Redirect to /admin or landing
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (auth protected)
│   │   ├── page.tsx            # Dashboard / Rep Management Tab
│   │   └── territories/
│   │       └── page.tsx        # Territory Upload Tab
│   ├── login/
│   │   └── page.tsx            # Login page (NetSuite OAuth - placeholder)
│   └── api/
│       ├── get-reps/
│       │   └── route.ts        # GET /api/get-reps?zip=12345
│       └── auth/
│           └── netsuite/       # NetSuite OAuth callbacks (when ready)
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── rep-table.tsx           # Rep CRUD table
│   ├── rep-form.tsx            # Add/Edit rep dialog
│   ├── territory-upload.tsx    # CSV upload component
│   └── nav-tabs.tsx            # Tab navigation
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Helper functions
├── middleware.ts               # Next.js middleware for auth
├── .env.local                  # Environment variables
└── package.json
```

---

## 3. Frontend Features

### Tab 1: Rep Management
- **Data Table** showing all reps (name, email, phone, channel)
- **Add Rep** button → Modal form with fields:
  - Name (required)
  - Email (required, unique)
  - Phone (optional)
  - Channel dropdown: Golf / Promo / Gift (required)
- **Edit** button per row → Modal form pre-filled
- **Delete** button per row → Confirmation dialog
- **Filter/Search** by name or channel

### Tab 2: Territory Upload
- **Channel Dropdown** (Golf, Promo, Gift) - REQUIRED selection
- **CSV File Uploader** with drag-and-drop
- **CSV Format Expected:**
  ```csv
  zip,rep_email
  12345,john@example.com
  12346,jane@example.com
  ```
- **Validation Rules:**
  - Zip must be exactly 5 digits (US format)
  - rep_email must exist in `reps` table

- **Upload Logic:**
  1. Parse CSV client-side using PapaParse
  2. Validate columns exist (zip, rep_email)
  3. Validate each row:
     - Zip is 5 digits
     - Look up `rep_id` by `rep_email` in `reps` table
  4. Collect errors for invalid rows
  5. Bulk upsert VALID rows into `assignments`
     - UPSERT on `(zip_code, channel)` conflict → updates rep_id
  6. Show summary:
     - "✓ 150 assignments uploaded successfully"
     - "⚠ 3 rows skipped:" + list of issues

---

## 4. API Endpoint

### `GET /api/get-reps?zip=12345`

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

**Logic:**
1. Validate zip is 5-digit format
2. Query `assignments` WHERE `zip_code = ?`
3. JOIN with `reps` table to get rep details
4. Return object keyed by channel (null if no rep assigned)

---

## 5. Authentication Flow

**Current Plan:** NetSuite OAuth/SSO (details TBD)

**Temporary Implementation:**
- Build with Supabase Auth as placeholder
- All authenticated users can access admin
- Easy to swap to NetSuite OAuth when credentials are available

**Flow:**
1. Admin visits `/admin` → Middleware checks auth
2. If not authenticated → Redirect to `/login`
3. Login → Authenticate (NetSuite SSO when ready)
4. On success → Redirect to `/admin`
5. Logout button in admin header

---

## 6. Tech Stack Summary

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | Next.js 14 (App Router)       |
| Styling    | Tailwind CSS + shadcn/ui      |
| Database   | Supabase (Postgres)           |
| Auth       | NetSuite OAuth (TBD) / Supabase Auth (placeholder) |
| CSV Parse  | PapaParse                     |
| Forms      | React Hook Form + Zod         |
| State      | React Query (TanStack Query)  |

---

## 7. Implementation Order

### Phase 1: Project Setup
1. Initialize Next.js project
2. Install dependencies (Tailwind, shadcn/ui, Supabase client, etc.)
3. Configure Tailwind and shadcn/ui
4. Set up Supabase client utilities

### Phase 2: Database Setup (Supabase)
1. Create Supabase project (manual step - I'll guide you)
2. Run SQL to create tables, constraints, RLS policies
3. Create initial admin user (for testing)

### Phase 3: Authentication (Placeholder)
1. Build login page with Supabase Auth
2. Set up middleware for protected routes
3. Add logout functionality
4. **Future:** Swap to NetSuite OAuth when credentials ready

### Phase 4: Rep Management
1. Build rep data table with sorting/filtering
2. Add/Edit rep modal forms
3. Delete confirmation dialog
4. Connect to Supabase CRUD operations

### Phase 5: Territory Upload
1. Build CSV uploader UI (drag & drop)
2. Implement parsing + validation logic
3. Build bulk upsert function
4. Add success/error feedback UI

### Phase 6: Public API
1. Create `/api/get-reps` route
2. Add input validation
3. Test with sample queries

### Phase 7: Polish
1. Error handling & loading states
2. Form validation messages
3. Responsive design tweaks
4. Testing

---

## 8. Supabase SQL (To Run After Project Creation)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create reps table
CREATE TABLE reps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('Golf', 'Promo', 'Gift')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code TEXT NOT NULL CHECK (zip_code ~ '^\d{5}$'),
  channel TEXT NOT NULL CHECK (channel IN ('Golf', 'Promo', 'Gift')),
  rep_id UUID NOT NULL REFERENCES reps(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (zip_code, channel)
);

-- Enable RLS
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reps
CREATE POLICY "Public read access" ON reps
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert" ON reps
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON reps
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON reps
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for assignments
CREATE POLICY "Public read access" ON assignments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert" ON assignments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON assignments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON assignments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for fast zip lookups
CREATE INDEX idx_assignments_zip ON assignments(zip_code);

-- Create index for channel filtering
CREATE INDEX idx_reps_channel ON reps(channel);
CREATE INDEX idx_assignments_channel ON assignments(channel);
```

---

## 9. Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NetSuite OAuth (when available)
NETSUITE_CLIENT_ID=
NETSUITE_CLIENT_SECRET=
NETSUITE_ACCOUNT_ID=
```

---

## 10. Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Rep → Channel | One-to-one | Each rep works in exactly one channel |
| Zip format | 5-digit US only | Validates against typos, consistent format |
| CSV errors | Skip & report | One bad row doesn't kill whole upload |
| Auth | NetSuite SSO (placeholder: Supabase) | Company SSO, swappable later |
| Channel assignment | Via upload CSV | Bulk territory management, not per-rep setting |

---

## Ready to Proceed?

Once you approve this plan, I'll:
1. Initialize the Next.js project with all dependencies
2. Walk you through creating the Supabase project
3. Build the entire application step by step

**Estimated build time:** 30-45 minutes of implementation

