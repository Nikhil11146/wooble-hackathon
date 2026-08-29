# KaushalSetu

**Verified Skills. Trusted Workers. Faster Hiring.**

A full-stack recruitment platform for India's blue-collar workforce. Connect skilled workers with employers through transparent, trust-based matching.

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Database Design](#database-design)
6. [API Architecture](#api-architecture)
7. [Core Algorithms](#core-algorithms)
8. [Getting Started](#getting-started)
9. [Project Structure](#project-structure)
10. [Security](#security)
11. [Deployment](#deployment)
12. [Demo Credentials](#demo-credentials)
13. [Hackathon Features](#hackathon-features)

---

## Overview

KaushalSetu is a specialized hiring platform designed for blue-collar workers in India. Many workers lack formal resumes, have limited English proficiency, or gained skills through practical experience rather than formal education. KaushalSetu bridges this gap by:

- Creating a **portable digital professional identity** based on verified skills, experience, certifications, and employer ratings
- Providing **transparent trust scoring** (no black-box algorithms)
- Enabling **AI-assisted candidate matching** with explainable results
- Supporting **multiple Indian languages** (English, Telugu, Hindi)
- Offering **accessibility-first design** for users with limited digital literacy
- Featuring a **secure, scalable full-stack implementation**

---

## Key Features

### For Workers

- **Digital Professional Profile**
  - Profile photo, name, location, years of experience
  - Primary occupation, languages spoken
  - Expected salary, availability status
  - Visual skill cards with verification badges

- **Skills Management**
  - Add skills with multiple verification states (self-declared, document, employer, assessment)
  - Track certifications with expiry dates
  - Build work history with employer confirmation
  - See real-time trust score breakdown

- **Job Discovery**
  - "Jobs near you" with distance, salary, required skills
  - Match percentage showing how well you fit each job
  - Filter by location, salary, employment type
  - Apply with one tap

- **Applications & Messaging**
  - Track application status in real-time
  - Receive interview invitations
  - Message directly with recruiters
  - Get notified of job matches

- **Reputation**
  - View employer ratings (1-5 stars)
  - See completed jobs count
  - Track certification status
  - Understand trust score factors

### For Employers

- **Job Posting**
  - Post jobs with required skills, experience, salary, location
  - Specify number of positions, employment type, start date
  - Auto-match against worker database

- **Candidate Search & Discovery**
  - Search workers by skills, location, experience
  - AI-powered recommended candidates ranked by match score
  - Filter by availability, salary expectation, certification
  - See trust score breakdown for every candidate

- **Hiring Pipeline**
  - Kanban-style workflow (New → Shortlisted → Interview → Selected → Hired)
  - Track candidates through hiring stages
  - Time-to-hire analytics
  - Conversion rate tracking

- **Candidate Evaluation**
  - View detailed worker profiles with trust scores
  - See work history and employer ratings
  - Read verification status of skills/certifications
  - Compare multiple candidates side-by-side

- **Ratings & Feedback**
  - Rate workers after hiring (1-5 stars)
  - Provide feedback on professionalism, quality, punctuality, communication
  - Contribute to worker trust score
  - Build employer reputation

### Admin Features

- **User Management**
  - View all workers and employers
  - Approve/reject employer registrations
  - Manage user accounts and permissions

- **Verification Management**
  - Review skill verification requests
  - Approve document-based verifications
  - Approve certification uploads
  - Monitor verification queue

- **Platform Analytics**
  - Total active workers/employers
  - Jobs posted/filled
  - Application metrics
  - Platform health monitoring

---

## System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER (Web/Mobile)                  │
│                                                               │
│  React + TypeScript | Vite | Tailwind CSS | shadcn/ui       │
│                                                               │
│  ├─ Landing Page                                             │
│  ├─ Worker Portal (Dashboard, Profile, Jobs, Applications)  │
│  ├─ Employer Portal (Dashboard, Post Jobs, Candidates)      │
│  ├─ Admin Dashboard (Verification, Users, Analytics)        │
│  └─ Messaging System                                         │
└─────────────────────────────────────────────────────────────┘
                              ↕️ REST API
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER (Backend)                 │
│                                                               │
│  Node.js + Express + TypeScript                             │
│                                                               │
│  ├─ Routes Layer (Authentication, Resources)                │
│  ├─ Controllers (Request handling, validation)              │
│  ├─ Services (Business logic, scoring, matching)            │
│  ├─ Middleware (Auth, validation, error handling)           │
│  └─ Utils (Helpers, algorithms, constants)                  │
└─────────────────────────────────────────────────────────────┘
                              ↕️ Database Queries
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE TIER                           │
│                                                               │
│  MongoDB with Mongoose ODM                                  │
│                                                               │
│  ├─ Users (Workers, Employers, Admins)                      │
│  ├─ Profiles (Worker & Employer metadata)                   │
│  ├─ Skills & Certifications                                 │
│  ├─ Jobs & Applications                                     │
│  ├─ Verification Records                                    │
│  ├─ Ratings & Messages                                      │
│  └─ Analytics Events                                        │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Principles

- **Separation of Concerns**: Routes → Controllers → Services → Models
- **Role-Based Access Control**: WORKER, EMPLOYER, ADMIN roles with fine-grained permissions
- **Stateless API**: JWT-based authentication, no session dependency
- **Database Optimization**: Proper indexing on frequently queried fields
- **Error Handling**: Centralized error management with meaningful HTTP status codes
- **Scalability**: Modular design allows horizontal scaling, caching layer ready

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI components, type safety |
| **Build** | Vite | Fast development, optimized builds |
| **Styling** | Tailwind CSS + shadcn/ui | Responsive, accessible components |
| **Backend Runtime** | Node.js 18+ | JavaScript runtime |
| **Backend Framework** | Express.js | HTTP server, routing, middleware |
| **Backend Language** | TypeScript | Type safety, better DX |
| **Database** | MongoDB 5.0+ | Document-oriented, flexible schema |
| **ORM** | Mongoose 7.x | Schema validation, middleware |
| **Authentication** | JWT + bcryptjs | Stateless auth, password hashing |
| **Validation** | Express-validator | Input validation, sanitization |
| **File Upload** | Multer | Profile photos, documents |
| **Configuration** | dotenv | Environment variable management |
| **Deployment** | Vercel (Frontend) + Railway/Render (Backend) | Serverless, auto-scaling |
| **Optional AI** | Anthropic Claude API | Job description parsing, explanations |

---

## Database Design

### Collections Schema

#### User Collection
```
{
  _id: ObjectId
  email: String (unique, indexed)
  password: String (hashed with bcryptjs)
  role: enum (WORKER, EMPLOYER, ADMIN)
  verified: Boolean
  createdAt: Date
  updatedAt: Date
}
```

#### WorkerProfile Collection
```
{
  _id: ObjectId
  userId: ObjectId (unique, indexed)
  name: String
  phone: String
  location: GeoJSON Point (indexed for geospatial queries)
  profilePhoto: String (URL to image)
  headline: String
  bio: String
  yearsOfExperience: Number
  primaryOccupation: String (indexed)
  languages: Array[String]
  expectedSalary: { min: Number, max: Number, currency: String }
  availability: enum (AVAILABLE, UNAVAILABLE, PART_TIME)
  workHistory: Array[ObjectId] // References to WorkExperience
  skills: Array[{skillId, verificationStatus}]
  certifications: Array[{certId, expiryDate}]
  kaushalTrustScore: Number (0-100)
  trustScoreBreakdown: Object { verifiedSkills: Number, experience: Number, ... }
  averageRating: Number (0-5)
  ratings: Array[ObjectId] // References to Rating
}
```

#### EmployerProfile Collection
```
{
  _id: ObjectId
  userId: ObjectId (unique, indexed)
  companyName: String (indexed)
  industry: String
  companyLogo: String (URL)
  location: GeoJSON Point (indexed)
  description: String
  verified: Boolean
  numberOfEmployees: Number
  registrationNumber: String (unique)
  createdAt: Date
}
```

#### Job Collection
```
{
  _id: ObjectId
  employerId: ObjectId (indexed)
  title: String (indexed)
  category: String (indexed)
  description: String
  requiredSkills: Array[ObjectId] (indexed)
  minExperience: Number
  maxExperience: Number
  salary: { min: Number, max: Number, currency: String }
  location: GeoJSON Point (indexed)
  radius: Number (search radius in km)
  employmentType: enum (FULL_TIME, CONTRACT, TEMPORARY)
  numberOfPositions: Number
  startDate: Date
  status: enum (OPEN, CLOSED, FILLED)
  createdAt: Date
  updatedAt: Date
}
```

#### Application Collection
```
{
  _id: ObjectId
  jobId: ObjectId (indexed)
  workerId: ObjectId (indexed)
  status: enum (APPLIED, SHORTLISTED, INTERVIEW, REJECTED, HIRED)
  matchScore: Number (0-100)
  appliedAt: Date
  movedToInterviewAt: Date
  hiredAt: Date
  notes: String
}
```

#### Skill Collection
```
{
  _id: ObjectId
  name: String (unique, indexed)
  category: String (indexed)
  description: String
  totalWorkers: Number
}
```

#### Certification Collection
```
{
  _id: ObjectId
  name: String (unique)
  issuer: String
  category: String
  validityYears: Number
}
```

#### Verification Collection
```
{
  _id: ObjectId
  workerId: ObjectId (indexed)
  skillId: ObjectId
  verificationStatus: enum (PENDING, APPROVED, REJECTED)
  verificationType: enum (SELF_DECLARED, DOCUMENT, EMPLOYER, ASSESSMENT)
  verifierType: enum (ADMIN, EMPLOYER)
  verifierId: ObjectId
  documentUrl: String
  verifiedAt: Date
  notes: String
}
```

#### Rating Collection
```
{
  _id: ObjectId
  workerId: ObjectId (indexed)
  employerId: ObjectId (indexed)
  jobId: ObjectId (indexed)
  rating: Number (1-5)
  feedback: String
  category: enum (PROFESSIONALISM, QUALITY, PUNCTUALITY, COMMUNICATION)
  createdAt: Date
}
```

#### Message Collection
```
{
  _id: ObjectId
  senderId: ObjectId (indexed)
  recipientId: ObjectId (indexed)
  jobId: ObjectId
  content: String
  read: Boolean
  createdAt: Date
}
```

#### Notification Collection
```
{
  _id: ObjectId
  userId: ObjectId (indexed)
  type: enum (JOB_MATCH, APPLICATION_STATUS, VERIFICATION_COMPLETE, MESSAGE)
  resourceId: ObjectId
  read: Boolean
  createdAt: Date
}
```

### Critical Indexes

- User.email (unique)
- WorkerProfile.userId (unique), location (geospatial)
- WorkerProfile.skills (for filtering)
- EmployerProfile.userId (unique)
- Job.employerId, title, category, status, location
- Application.jobId, workerId, status
- Skill.name (for search)
- Rating.workerId, employerId
- Message.senderId, recipientId
- Notification.userId

---

## API Architecture

### Authentication Endpoints

```
POST   /api/auth/register        Register new user
POST   /api/auth/login            Login with email/password
POST   /api/auth/refresh          Refresh JWT token
POST   /api/auth/logout           Logout (frontend clears token)
```

### Worker Endpoints

```
GET    /api/workers/me             Get current worker profile
PUT    /api/workers/:id            Update profile
GET    /api/workers/:id/profile    Get public profile
PUT    /api/workers/:id/profile    Update profile details
GET    /api/workers/:id/skills     Get worker skills
POST   /api/workers/:id/skills     Add new skill
PUT    /api/workers/:id/skills/:skillId  Update skill
DELETE /api/workers/:id/skills/:skillId  Remove skill
GET    /api/workers/:id/certifications   Get certifications
POST   /api/workers/:id/certifications   Add certification
GET    /api/workers/:id/work-history     Get work history
POST   /api/workers/:id/work-history     Add work experience
GET    /api/workers/:id/trust-score      Get trust score breakdown
GET    /api/workers/:id/ratings          Get received ratings
GET    /api/workers/:id/applications     Get worker's applications
GET    /api/jobs/recommended      Get recommended jobs
GET    /api/jobs/search            Search jobs with filters
GET    /api/jobs/:id               Get job details
```

### Employer Endpoints

```
GET    /api/employers/me           Get current employer profile
PUT    /api/employers/:id          Update profile
GET    /api/employers/:id/jobs     Get employer's jobs
POST   /api/employers/:id/jobs     Create new job
PUT    /api/employers/:id/jobs/:jobId  Update job
DELETE /api/employers/:id/jobs/:jobId  Close/delete job
GET    /api/employers/:id/candidates         Get all candidates
GET    /api/employers/:id/candidates/search  Search candidates
GET    /api/employers/:id/candidates/:workerId/details  Get candidate profile
POST   /api/employers/:id/candidates/:workerId/shortlist  Shortlist candidate
GET    /api/employers/:id/pipeline           Get hiring pipeline
PUT    /api/employers/:id/pipeline/:appId/status  Move candidate in pipeline
GET    /api/employers/:id/analytics          Get recruitment analytics
```

### Verification Endpoints

```
POST   /api/verifications/request     Request skill verification
GET    /api/verifications/:workerId   Get worker's verifications
GET    /api/admin/verifications       List all pending verifications (admin only)
PUT    /api/admin/verifications/:id/approve  Approve verification (admin)
PUT    /api/admin/verifications/:id/reject   Reject verification (admin)
```

### Application Endpoints

```
POST   /api/applications             Worker applies to job
GET    /api/applications/:id         Get application details
PUT    /api/applications/:id/status  Update application status
```

### Messaging Endpoints

```
POST   /api/messages                Get or create conversation
GET    /api/messages/conversations   List user's conversations
GET    /api/messages/:conversationId Get messages in conversation
```

### Rating Endpoints

```
POST   /api/ratings                 Create rating
GET    /api/ratings/worker/:workerId  Get worker's ratings
```

### Admin Endpoints

```
GET    /api/admin/users             List all users
GET    /api/admin/workers           List all workers
GET    /api/admin/employers         List all employers
GET    /api/admin/jobs              List all jobs
GET    /api/admin/analytics         Platform analytics
GET    /api/admin/platform-stats    High-level platform statistics
```

---

## Core Algorithms

### 1. Kaushal Trust Score (0-100)

The Kaushal Trust Score is a transparent, deterministic algorithm combining multiple verified signals.

**Components:**

| Factor | Weight | Description |
|--------|--------|-------------|
| Verified Skills | +25 | Number of verified skills |
| Experience | +18 | Years of work experience |
| Employer Ratings | +20 | Average rating from employers |
| Completed Jobs | +14 | Number of completed jobs |
| Certifications | +10 | Number of certifications |
| Assessment Pass | +8 | Technical assessment results |
| Profile Completeness | +5 | Profile photo, skills, history, etc. |

**Scoring Breakdown:**

**A. Verified Skills (+25 points)**
- 0-2 verified skills: 0 points
- 3-5 verified skills: 10 points
- 6-10 verified skills: 18 points
- 11+ verified skills: 25 points

**B. Experience (+18 points)**
- < 1 year: 3 points
- 1-2 years: 6 points
- 2-5 years: 12 points
- 5-10 years: 16 points
- 10+ years: 18 points

**C. Employer Ratings (+20 points)**
- Average rating = sum(all ratings) / count(ratings)
- < 3.0 stars: 0 points
- 3.0-3.5 stars: 5 points
- 3.5-4.0 stars: 12 points
- 4.0-4.5 stars: 17 points
- 4.5-5.0 stars: 20 points

**D. Completed Jobs (+14 points)**
- 0 jobs: 0 points
- 1-3 jobs: 4 points
- 4-10 jobs: 9 points
- 11-20 jobs: 12 points
- 20+ jobs: 14 points

**E. Certifications (+10 points)**
- 0 certs: 0 points
- 1 cert: 3 points
- 2-3 certs: 6 points
- 4+ certs: 10 points
- Bonus: Safety/Compliance certs: +2 points

**F. Assessment Pass (+8 points)**
- Technical assessment passed (>70%): 8 points
- Not completed or failed: 0 points

**G. Profile Completeness (+5 points)**
- Photo uploaded: 1 point
- Skills added: 1 point
- Work history added: 1 point
- Certifications added: 1 point
- Languages specified: 1 point

**Total:** Sum of all components, capped at 100

**Example:**
```
Verified Skills (7)        +18
Experience (3 years)       +12
Avg Rating (4.3 stars)     +17
Completed Jobs (8)         +9
Certifications (2)         +6
Assessment Passed          +8
Profile Complete (5/5)     +5
─────────────────────────────
TOTAL SCORE                75
```

### 2. AI Candidate Matching Algorithm

Employers see candidates ranked by match percentage. The algorithm is deterministic and explainable.

**Match Score Calculation:**

```
Match Score = Average of (
  Skill Match (0-100) +
  Location Score (0-100) +
  Availability (0-100) +
  Salary Alignment (0-100) +
  Trust Score Weight (0-100)
) * 100
```

**A. Skill Match (0-100)**
- Matches required skills vs worker's verified skills
- Match % = (matched skills / total required skills) × 100
- Example: Job requires [Electrical, Safety, Wiring]
  - Worker has [Electrical ✓, Safety ✓, Wiring ✓] = 100%

**B. Location Score (0-100)**
- Based on distance from worker to job location
- 0-5 km: 100 points
- 5-15 km: 80 points
- 15-30 km: 60 points
- 30-50 km: 40 points
- 50+ km: 20 points

**C. Availability (0/100)**
- Immediately available: 100 points
- Available within 2 weeks: 80 points
- Available within 1 month: 60 points
- Not currently available: 0 points

**D. Salary Alignment (0-100)**
- Compare job salary range vs worker expected salary
- Perfect match: 100 points
- Within 10%: 90 points
- Within 20%: 75 points
- Within 30%: 50 points
- Beyond 30%: 20 points

**E. Trust Score Weight (0-100)**
- Kaushal Trust Score / 100 × 100

**Display to Employer:**
```
92% Match

✓ Industrial electrical experience
✓ 4.2 years experience
✓ Available immediately
✓ Within 18 km
✓ Safety certification verified
✓ 4.7/5 employer rating
```

**Ranking:**
- Sort all candidates by match score (descending)
- Show top 20 recommended candidates
- Optional: Use Claude API for natural language explanations

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB 5.0+ (local or MongoDB Atlas)
- Git
- Vercel account (for frontend deployment, optional)
- Railway/Render account (for backend deployment, optional)

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/kaushal-setu.git
cd kaushal-setu
```

#### 2. Backend Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

#### 3. Frontend Setup

```bash
cd ../client
npm install

# Create .env file
cp .env.example .env
# Edit .env with your backend API URL
```

#### 4. Database Setup

```bash
cd ../server

# Seed the database with demo data
npm run seed
```

#### 5. Start Development Server

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### Verify Installation

1. Navigate to `http://localhost:5173`
2. See the landing page
3. Try demo login with credentials (see Demo Credentials section)
4. Explore worker and employer dashboards

---

## Project Structure

```
kaushal-setu/
├── server/                           # Node.js + Express backend
│   ├── src/
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── WorkerProfile.ts
│   │   │   ├── EmployerProfile.ts
│   │   │   ├── Job.ts
│   │   │   ├── Application.ts
│   │   │   ├── Skill.ts
│   │   │   ├── Certification.ts
│   │   │   ├── Verification.ts
│   │   │   ├── Rating.ts
│   │   │   ├── Message.ts
│   │   │   └── Notification.ts
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── worker.routes.ts
│   │   │   ├── employer.routes.ts
│   │   │   ├── verification.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── index.ts
│   │   ├── controllers/             # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── worker.controller.ts
│   │   │   ├── employer.controller.ts
│   │   │   ├── verification.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/                # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── worker.service.ts
│   │   │   ├── employer.service.ts
│   │   │   ├── matching.service.ts
│   │   │   ├── trust-score.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── verification.service.ts
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── utils/                   # Utilities
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── matching-algo.ts
│   │   │   ├── trust-score-algo.ts
│   │   │   ├── logger.ts
│   │   │   └── constants.ts
│   │   ├── config/                  # Configuration
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   ├── seed/                    # Seed data
│   │   │   ├── index.ts
│   │   │   ├── users.ts
│   │   │   ├── workers.ts
│   │   │   ├── employers.ts
│   │   │   ├── jobs.ts
│   │   │   └── applications.ts
│   │   └── server.ts                # Entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── client/                           # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── WorkerOnboarding.tsx
│   │   │   ├── Worker/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── Skills.tsx
│   │   │   │   ├── JobDiscovery.tsx
│   │   │   │   ├── Applications.tsx
│   │   │   │   └── Messages.tsx
│   │   │   ├── Employer/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── PostJob.tsx
│   │   │   │   ├── CandidateSearch.tsx
│   │   │   │   ├── Pipeline.tsx
│   │   │   │   └── Analytics.tsx
│   │   │   └── Admin/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Verifications.tsx
│   │   │       └── PlatformStats.tsx
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── Cards/
│   │   │   │   ├── JobCard.tsx
│   │   │   │   ├── CandidateCard.tsx
│   │   │   │   └── SkillCard.tsx
│   │   │   ├── Forms/
│   │   │   │   ├── JobForm.tsx
│   │   │   │   ├── ProfileForm.tsx
│   │   │   │   └── SkillForm.tsx
│   │   │   └── Common/
│   │   │       ├── Modal.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       └── TrustScore.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   ├── useLocation.ts
│   │   │   └── useNotifications.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── worker.service.ts
│   │   │   ├── employer.service.ts
│   │   │   └── admin.service.ts
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── worker.ts
│   │   │   ├── employer.ts
│   │   │   ├── job.ts
│   │   │   └── application.ts
│   │   ├── utils/
│   │   │   ├── auth.ts
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── constants.ts
│   │   ├── config/
│   │   │   ├── i18n.ts
│   │   │   └── routes.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
├── .gitignore
└── README.md (this file)
```

---

## Security

### Password Security

- Passwords hashed with bcryptjs (10 rounds)
- No plaintext storage
- Minimum 8 characters enforced
- Strong password validation rules

### API Security

- CORS configured for frontend origin only
- Input validation on all endpoints via express-validator
- SQL/NoSQL injection prevention via Mongoose schema validation
- Rate limiting available for auth endpoints
- No sensitive data in API responses
- Authorization checks before resource access

### Authentication

- JWT (HS256) with 7-day expiration
- Refresh token mechanism (optional)
- Automatic logout on token expiration
- Role-based access control (RBAC)

### Deployment Security

- HTTPS required in production
- Environment variables for all secrets
- No .env files committed to git
- Secure cookie flags
- CORS headers properly configured

---

## Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Auto-deploy on git push

```bash
# Build command
npm run build

# Output directory
dist
```

### Backend Deployment (Railway/Render)

1. Connect GitHub repository to Railway/Render
2. Configure environment variables
3. Set start command: `npm run start`
4. Auto-deploy on git push

```bash
# Build
npm run build

# Start
npm start
```

### Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create a project and cluster
3. Get connection string
4. Add IP whitelist (or allow all for MVP)
5. Use connection string in backend .env

### Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kaushal-setu
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=https://yourdomain.com
ANTHROPIC_API_KEY=optional-for-ai-features
```

**Frontend (.env)**
```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=KaushalSetu
VITE_ENABLE_AI_FEATURES=true
```

---

## Demo Credentials

### Demo Accounts

**Worker Account**
- Email: `worker@demo.com`
- Password: `Demo123!`
- Role: WORKER

**Employer Account**
- Email: `employer@demo.com`
- Password: `Demo123!`
- Role: EMPLOYER

**Admin Account**
- Email: `admin@demo.com`
- Password: `Demo123!`
- Role: ADMIN

### Demo Data Included

- 20 demo workers with profiles, skills, certifications, and ratings
- 10 demo employers with company profiles
- 20+ demo jobs in various categories
- Multiple applications in different stages
- Various skill and certification records
- Ratings and feedback records

---

## Hackathon Features

### What Makes KaushalSetu Stand Out

#### 1. **Transparent Trust Scoring**
- Not a black-box algorithm
- Shows exactly why a worker scored 87/100
- Combines 7 weighted factors (skills, experience, ratings, etc.)
- Recalculated in real-time

#### 2. **Explainable AI Matching**
- No magic LLM predictions
- Deterministic matching algorithm
- Shows match breakdown: skill match, location, availability, salary, trust
- Example: "92% match because: 100% skills, within 5km, 4.7★ rating"

#### 3. **Accessibility First Design**
- Multi-language support (English, Telugu, Hindi)
- Large touch targets (48px minimum)
- Minimal text-heavy interfaces
- Visual skill badges and status indicators
- Mobile-first responsive design

#### 4. **Skill Verification System**
- Four-tier verification (self-declared → document → employer → assessment)
- Show verification status for each skill
- Admin dashboard for verification approval
- Demo verification workflow

#### 5. **Complete Hiring Pipeline**
- Kanban-style workflow
- Track candidates through stages
- Time-to-hire analytics
- Conversion rate tracking

#### 6. **Production-Ready Code**
- TypeScript throughout
- Proper error handling
- Input validation
- Security best practices
- Clean architecture (routes → controllers → services → models)
- Seed data for immediate demo

#### 7. **End-to-End Workflows**
- Worker: Register → Profile → Skills → Discover Jobs → Apply
- Employer: Register → Post Job → View Candidates → Shortlist → Interview → Hire
- Both workflows completely functional

#### 8. **Analytics & Insights**
- Worker dashboard: Trust score, profile completion, recommended jobs
- Employer dashboard: Applications, shortlisted, interviews, hires
- Admin dashboard: Platform statistics, verification queue

---

## API Documentation

For detailed API documentation, see `/server/API.md`

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

---

## License

MIT License - see LICENSE file for details

---

## Support

For questions or issues, please contact the development team or open an issue on GitHub.

---

**Built for Blue Workforce Connect '26 Hackathon**

*Verified Skills. Trusted Workers. Faster Hiring.*
