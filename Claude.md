# Excellent Driving — Claude Code Project

## Project Overview
Build a full-stack website for **Excellent Driving**, a driving school in Suriname.
- Location: Bonistraat 44
- Languages: English & Dutch (Spanish & Portuguese later)
- Stack: Next.js 14 (App Router), Tailwind CSS, Prisma, PostgreSQL, NextAuth.js

---

## Architecture Overview

```
excellent-driving/
├── app/                   # Next.js App Router
│   ├── (public)/          # Public pages
│   ├── (auth)/            # Login / Register
│   ├── (student)/         # Student dashboard (protected)
│   ├── (admin)/           # Admin dashboard (protected)
│   └── api/               # API routes
├── components/            # Shared UI components
├── lib/                   # Utilities, db client, helpers
├── prisma/                # Schema + migrations
└── public/                # Static assets (logo, images)
```

---

## Sub-Agents

Each sub-agent below is a focused task. Run them in order, or in parallel where marked **[PARALLEL]**.

---

### AGENT 1 — Project Scaffold & Config
**Goal:** Initialize the Next.js project with all dependencies and base config.

```
Tasks:
1. Create Next.js 14 app with TypeScript and Tailwind CSS
2. Install dependencies:
   - prisma, @prisma/client
   - next-auth
   - next-i18next (for EN/NL/ES/PT)
   - zod (validation)
   - react-hook-form
   - @tanstack/react-query
   - lucide-react (icons)
   - date-fns
   - resend (email)
3. Set up .env.local with placeholders:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - WHATSAPP_API_KEY
   - RESEND_API_KEY
4. Configure next.config.js with i18n (en, nl — with es, pt as future)
5. Set up Tailwind with custom brand colors (primary: school brand)
6. Create base folder structure as shown above
```

---

### AGENT 2 — Database Schema [PARALLEL with AGENT 3]
**Goal:** Design and create the full Prisma schema.

```
Models to create:

User {
  id, email, phone, passwordHash
  role: STUDENT | INSTRUCTOR | ADMIN
  name, language (EN | NL)
  createdAt, updatedAt
}

Package {
  id, name (translatable), description
  price, currency
  lessonCount, includesTheory
  isActive
}

Booking {
  id, studentId, instructorId, packageId
  date, timeSlot
  status: PENDING | CONFIRMED | CANCELLED
  paymentMethod: CASH | BANK_TRANSFER
  paymentStatus: PENDING | CONFIRMED
  createdAt
}

Instructor {
  id, userId
  bio, availableDays (MON-SAT)
  isActive
}

Schedule {
  id, instructorId
  dayOfWeek (MON-SAT)
  startTime, endTime
  slotDurationMinutes
}

Module {
  id, title, description
  orderIndex, isPublished
  packageId (optional — or open to all paid)
}

Lesson {
  id, moduleId
  title, type: QUIZ | TEXT | VIDEO
  content (JSON)
  orderIndex
}

StudentProgress {
  id, studentId, lessonId
  status: NOT_STARTED | IN_PROGRESS | PASSED | FAILED
  score (nullable)
  completedAt
}

FAQ {
  id, question, answer
  language: EN | NL
  orderIndex
}

Tasks:
1. Write full schema.prisma
2. Run prisma migrate dev --name init
3. Seed: 1 admin user, 1 sample package, 1 instructor, sample FAQ entries
```

---

### AGENT 3 — Authentication System [PARALLEL with AGENT 2]
**Goal:** Set up NextAuth with credentials + role-based access.

```
Tasks:
1. Configure NextAuth with CredentialsProvider (email + password)
2. Create roles: STUDENT, INSTRUCTOR, ADMIN
3. Protect routes by role using middleware.ts:
   - /student/* → STUDENT only
   - /admin/* → ADMIN only
4. Create pages:
   - /login  (email + password form)
   - /register (name, email, phone, password, language preference)
5. After register: auto-assign STUDENT role, redirect to /student/dashboard
6. Add "Forgot password" flow using Resend email
7. Store sessions in DB via Prisma adapter
```

---

### AGENT 4 — Public Website (Marketing Pages)
**Goal:** Build all public-facing pages.

```
Pages to build:

/ (Home)
- Hero section: school name, tagline, CTA buttons (Book Now, View Packages)
- Why choose us section (3-4 highlights)
- Meet the instructors preview (max 3)
- Testimonials placeholder
- FAQ preview (top 3)
- Footer: address, phone, WhatsApp button

/packages
- Grid of all active packages
- Each card: name, description, price, what's included
- CTA: Book This Package (→ /booking)

/instructors
- Grid of instructor profiles
- Photo placeholder, name, bio

/faq
- Accordion list of all FAQs
- Filterable by language

/contact
- WhatsApp button (opens wa.me link)
- Phone number
- Address on embedded map (Google Maps iframe)
- Simple contact form (name, email, message) → sends via Resend

Layout requirements:
- Sticky navbar with logo, nav links, Login/Register buttons
- Language switcher (EN / NL)
- Mobile responsive (hamburger menu)
- WhatsApp floating button on all pages
```

---

### AGENT 5 — Booking System
**Goal:** Build the full booking flow for students.

```
Tasks:

1. /booking page (protected — must be logged in):
   Step 1: Choose a package
   Step 2: Choose an instructor
   Step 3: Choose a date (Mon–Sat calendar)
   Step 4: Choose an available time slot
   Step 5: Choose payment method (Cash / Bank Transfer)
   Step 6: Confirm booking → show summary

2. API routes:
   GET  /api/bookings/slots?instructorId=&date=  → return available slots
   POST /api/bookings                            → create booking (status: PENDING)
   GET  /api/bookings/my                         → student's own bookings

3. WhatsApp Bot Confirmation:
   - On booking creation, call WhatsApp Business API
   - Send message to student: booking details + payment instructions
   - Send message to instructor: new booking notification
   - Use template message format

4. Admin can manually confirm bank transfer payments:
   - PATCH /api/admin/bookings/:id/confirm-payment

5. Booking rules:
   - Students can cancel up to 24h before
   - No double booking same slot
   - Mon–Sat only, respect instructor schedule
```

---

### AGENT 6 — Student Dashboard & E-Learning
**Goal:** Build the student portal with progress tracking and quizzes.

```
Pages:

/student/dashboard
- Welcome message
- Active packages / enrolled courses
- Progress overview (% complete per module)
- Upcoming bookings
- Quick links

/student/learn
- List of modules (unlocked only for paying students)
- Progress bar per module

/student/learn/[moduleId]
- List of lessons in order
- Lesson types: TEXT, QUIZ, VIDEO (placeholder)
- Must complete in order

/student/learn/[moduleId]/[lessonId]
- TEXT: render rich content
- QUIZ:
  - Multiple choice questions
  - Show one question at a time
  - Submit all → calculate score
  - PASS (≥70%) → mark complete, unlock next
  - FAIL → show score, allow retry
  - Show correct answers after submission

/student/bookings
- List of all bookings (upcoming + history)
- Status badges (Pending / Confirmed / Cancelled)
- Cancel button (if >24h away)

/student/profile
- Edit name, phone, language preference
- Change password

API routes:
GET  /api/student/progress
POST /api/student/progress/:lessonId  → submit quiz answers
GET  /api/student/bookings
```

---

### AGENT 7 — Admin Dashboard
**Goal:** Build the admin panel for the school owner.

```
Pages (all under /admin):

/admin/dashboard
- Stats: total students, bookings this week, revenue pending
- Recent bookings table
- Quick actions

/admin/packages
- List all packages (active/inactive)
- Create / Edit / Deactivate package
- Fields: name (EN + NL), description, price, lesson count

/admin/instructors
- List instructors
- Add / Edit / Remove instructor
- Set their schedule (days + time slots)

/admin/bookings
- Full bookings table with filters (date, instructor, status)
- Confirm payment (bank transfer)
- Cancel booking
- Export to CSV

/admin/students
- List all students
- View progress per student
- Manually grant/revoke course access

/admin/content
- Manage Modules and Lessons
- Create module (title EN + NL, order)
- Inside module: add lessons (TEXT editor or QUIZ builder)
- Quiz builder:
  - Add question + 4 options + correct answer
  - Reorder questions
  - Preview quiz

/admin/faq
- Add / Edit / Delete FAQ entries
- EN and NL versions per entry

/admin/settings
- School info (name, address, phone, WhatsApp number)
- Language settings
- WhatsApp bot toggle

UI requirements:
- Sidebar navigation
- Data tables with search + filter + pagination
- Simple forms — no complexity
- Confirmation modals for destructive actions
```

---

### AGENT 8 — i18n (Internationalisation)
**Goal:** Implement English and Dutch translations across all pages.

```
Tasks:
1. Set up next-i18next with locale files:
   - public/locales/en/common.json
   - public/locales/nl/common.json

2. Translate all static UI text:
   - Navigation, buttons, labels, error messages
   - Page headings and descriptions
   - FAQ content (stored in DB per language)
   - Email/WhatsApp templates

3. Language switcher in navbar (EN | NL flag icons)

4. Store user language preference in User model
   - Default to browser language on first visit

5. Prepare empty locale files for:
   - public/locales/es/common.json
   - public/locales/pt/common.json
   (scaffold only — fill in later)
```

---

### AGENT 9 — WhatsApp Bot Integration
**Goal:** Automate WhatsApp notifications using WhatsApp Business API.

```
Tasks:

1. Create /lib/whatsapp.ts helper:
   - sendMessage(to: string, templateName: string, params: string[])
   - Uses WhatsApp Business Cloud API (Meta)

2. Templates to create (register in Meta Business Manager):
   - booking_confirmation: 
     "Hi {name}, your booking with {instructor} on {date} at {time} is confirmed. Payment: {method}."
   - booking_reminder (24h before):
     "Reminder: Your driving lesson is tomorrow at {time} with {instructor}. See you there!"
   - payment_confirmed:
     "Your payment for {package} has been confirmed. You now have access to your online lessons!"
   - booking_cancelled:
     "Your booking on {date} at {time} has been cancelled."

3. Trigger points:
   - On booking creation → booking_confirmation
   - 24h before lesson → booking_reminder (cron job)
   - On payment confirmed → payment_confirmed
   - On cancellation → booking_cancelled

4. Cron job (using Vercel Cron or node-cron):
   - Run daily at 8AM
   - Find all bookings for next day
   - Send reminders

5. Fallback: if WhatsApp fails, log error and send email via Resend
```

---

### AGENT 10 — Testing & QA
**Goal:** Ensure everything works end-to-end before handoff.

```
Tasks:

1. Unit tests (Jest + React Testing Library):
   - Quiz pass/fail logic
   - Booking slot availability logic
   - Auth middleware (role checks)

2. E2E tests (Playwright):
   - Register as student → buy package → see course content
   - Book a lesson → receive WhatsApp confirmation (mock)
   - Admin creates package → student can see it

3. Manual QA checklist:
   - Mobile responsiveness on all pages
   - Language switch EN ↔ NL works correctly
   - Quiz: pass unlocks next lesson, fail allows retry
   - Booking: double booking same slot is blocked
   - Admin: can confirm payment → student gets WhatsApp

4. Accessibility:
   - All forms have labels
   - Color contrast passes WCAG AA
   - Keyboard navigable
```

---

## Deployment Notes

```
Recommended stack:
- Hosting: Vercel (free tier works for start)
- Database: Supabase PostgreSQL (free tier)
- WhatsApp: Meta WhatsApp Business Cloud API
- Email: Resend (free tier: 3000 emails/month)
- Domain: Connect custom domain in Vercel

Environment variables needed before deploy:
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=
RESEND_API_KEY=
```

---

### AGENT 11 — Interactive Maquettes (Design & Prototype)
**Goal:** Design and build pixel-perfect interactive maquettes for every key page BEFORE development starts. These are fully clickable HTML/CSS/JS prototypes — not wireframes.

```
Design Principles:
- Tone: Clean, confident, professional — trustworthy driving school
- Color palette: Deep navy (#0F1F3D) + vibrant amber (#F5A623) + white
- Typography: Display font (e.g. Sora or Outfit) + readable body font
- Mobile-first responsive layouts
- Smooth micro-interactions and transitions
- No placeholder grey boxes — use real content from the brief

Pages to maquette (in order):

1. HOMEPAGE (/)
   - Sticky navbar: logo left, nav links center, Login + Book Now right
   - Hero: full-width, headline "Learn to Drive with Confidence", 
     subtext, two CTAs (Book a Lesson / View Packages)
   - Stats bar: X students, X instructors, Mon–Sat availability
   - Packages preview: 3 cards with hover effect
   - How it works: 3 steps (Register → Book → Learn)
   - Meet the instructors: horizontal scroll cards
   - FAQ accordion: top 5 questions
   - Footer: logo, links, address, WhatsApp button, phone
   - Floating WhatsApp button (bottom right, pulsing)

2. PACKAGES PAGE (/packages)
   - Page header with subtle background pattern
   - Package cards grid (3 columns desktop, 1 mobile)
   - Each card: package name, price, included items list, 
     Book This Package CTA button
   - Hover: card lifts with shadow + amber border

3. BOOKING FLOW (/booking)
   - Multi-step form with progress bar (5 steps)
   - Step 1: Select package (visual cards)
   - Step 2: Select instructor (photo + name cards)
   - Step 3: Date picker (Mon–Sat calendar, Sundays disabled)
   - Step 4: Time slot grid (morning/afternoon/evening buttons)
   - Step 5: Payment method (Cash / Bank Transfer toggle)
   - Confirmation summary card with all details
   - Animated step transitions (slide in/out)

4. STUDENT DASHBOARD (/student/dashboard)
   - Sidebar navigation (collapse on mobile)
   - Welcome header with student name
   - Progress cards: modules started, quizzes passed, lessons completed
   - Active package card with progress bar
   - Upcoming booking card (date, instructor, time)
   - Continue learning CTA → /student/learn

5. QUIZ PAGE (/student/learn/[moduleId]/[lessonId])
   - Clean focused layout (no distractions)
   - Question number + progress bar at top
   - Question text large and readable
   - 4 answer options as clickable cards
   - Selected state: amber highlight
   - After submit: green (correct) / red (wrong) feedback
   - Score screen: big % number, PASS (green) or FAIL (red)
   - Retry / Next Lesson buttons

6. ADMIN DASHBOARD (/admin/dashboard)
   - Dark sidebar with icon + label navigation
   - Top bar with school name + admin avatar
   - Stats row: total students, this week's bookings, 
     pending payments, active packages
   - Recent bookings table: student name, package, date, 
     instructor, payment status badge, action buttons
   - Quick action buttons: Add Package, Add Instructor, 
     View All Bookings

Implementation rules:
- Each maquette is a standalone HTML file with embedded CSS + JS
- Files saved to: /maquettes/*.html
- Use Google Fonts (loaded via @import)
- CSS custom properties for all colors and spacing
- JS only for: tab switching, accordion, step transitions, 
  quiz interactions — NO external libraries
- All maquettes link to each other for a clickable prototype flow
- Include an index.html in /maquettes/ as the prototype entry point
  showing all screens in a clickable overview grid

Deliverables:
/maquettes/index.html         ← prototype overview
/maquettes/01-homepage.html
/maquettes/02-packages.html
/maquettes/03-booking.html
/maquettes/04-student-dashboard.html
/maquettes/05-quiz.html
/maquettes/06-admin-dashboard.html

After maquettes are approved by the owner, AGENTS 4–7 use them
as the exact design reference. Developers must match the maquettes
pixel-for-pixel when building the real pages.
```

---

## Build Order

```
Phase 0 (Design — must be approved before coding):
  AGENT 11 → Owner review → Approve / Request changes

Phase 1 (Foundation):
  AGENT 1 → AGENT 2 + AGENT 3 (parallel)

Phase 2 (Core features — follow approved maquettes):
  AGENT 4 + AGENT 5 + AGENT 6 (parallel)

Phase 3 (Admin + Integrations):
  AGENT 7 + AGENT 8 + AGENT 9 (parallel)

Phase 4 (QA):
  AGENT 10
```

---

## Notes for Owner (Non-Technical)

- All text content (packages, FAQ, lessons) is managed through the Admin dashboard — no coding needed.
- To add a new language (Spanish/Portuguese), translate the locale files and add to i18n config.
- WhatsApp bot requires a verified Meta Business account before it can send messages.
- Bank transfer payments must be manually confirmed by the admin after checking the bank.