# EXA-ANESVAD

NGO + commerce platform for the EXA-ANESVAD socio-economic empowerment programme.

## Stack
- **Next.js 15** (App Router, Server Actions)
- **Prisma** ORM
- **Neon** PostgreSQL (serverless)
- **NextAuth v5** (credentials, JWT)
- **Cloudinary** (image uploads)
- **TypeScript**

## Quick start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env
# Fill in DATABASE_URL, NEXTAUTH_SECRET, Cloudinary keys

# 3. Database
npm run db:push      # push schema to Neon
npm run db:seed      # seed admin user + sample data

# 4. Run
npm run dev          # http://localhost:3000
```

## Key routes

| Route | Description |
|---|---|
| `/` | Homepage |
| `/shop` | Product catalogue |
| `/activities` | Field activities |
| `/announcements` | News & updates |
| `/gallery` | Photo gallery |
| `/about` | About the programme |
| `/contact` | Contact page |
| `/admin` | **Admin login** |
| `/admin/dashboard` | Dashboard (protected) |
| `/admin/dashboard/products` | Product CRUD |
| `/admin/dashboard/orders` | Order management |
| `/admin/dashboard/activities` | Activity CRUD |
| `/admin/dashboard/announcements` | Announcement CRUD |
| `/admin/dashboard/gallery` | Gallery management |

## Environment variables

```env
DATABASE_URL=             # Neon PostgreSQL connection string
NEXTAUTH_URL=             # e.g. http://localhost:3000
NEXTAUTH_SECRET=          # openssl rand -base64 32
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
ADMIN_EMAIL=              # seed only
ADMIN_PASSWORD=           # seed only
```

## Image uploads

`POST /api/upload` with `multipart/form-data`:
- `file` — image file (JPEG, PNG, WebP, GIF, max 5MB)
- `folder` — optional Cloudinary folder name

Requires a valid admin session cookie.
