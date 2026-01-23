# InstaPrint - Instant Printing Service Platform

## Table of Contents

1. [Project Overview](#project-overview)
2. [Current Capabilities (v1)](#current-capabilities-v1)
3. [Problem Statement](#problem-statement)
4. [Solution](#solution)
5. [Target Audience](#target-audience)
6. [System Architecture](#system-architecture)
7. [Technology Stack](#technology-stack)
8. [Getting Started](#getting-started)
9. [Project Structure](#project-structure)
10. [API Endpoints](#api-endpoints)
11. [Workflow](#workflow)
12. [Security Features](#security-features)
13. [Future Works](#future-works)
14. [Contributing](#contributing)
15. [License](#license)
16. [Support](#support)

---

## Project Overview

InstaPrint is a web-based platform that connects users who need document printing services with verified local print shops. The platform eliminates the inconvenience of visiting physical print shops by allowing users to upload documents online, select from multiple vendors, make secure payments, and collect their prints using a pickup code system.

The application serves two primary user groups: individual customers seeking convenient printing services and print shop vendors looking to expand their customer base through an online presence.

---

## Current Capabilities (v1)

- Phone-based authentication using OTP
- User and vendor role separation
- Document upload and secure storage
- Vendor order management dashboard
- Pickup verification using one-time codes
- Audit logging and role-based access control

---

## Problem Statement

In today's fast-paced world, individuals and businesses frequently require document printing services for various purposes including:

- Students needing course materials, assignments, and project reports printed urgently
- Professionals requiring printed documents for meetings, presentations, and official work
- Small businesses needing marketing materials, flyers, and business cards
- Event organizers requiring banners, posters, and promotional materials

Traditional printing services present several challenges:

- **Time Consumption**: Standing in queues at print shops consumes valuable time that could be spent productively
- **Location Constraints**: Users are limited to print shops in their immediate vicinity
- **Lack of Price Transparency**: Users cannot compare prices across different vendors before committing
- **Quality Uncertainty**: No standardized quality assurance or vendor verification system
- **Payment Limitations**: Many print shops only accept cash, limiting payment flexibility
- **No Order Tracking**: Users have no way to track the status of their print orders

---

## Solution

InstaPrint addresses these challenges through a comprehensive digital platform that offers:

- **Online Document Upload**: Users can upload documents from anywhere using an intuitive drag-and-drop interface
- **Vendor Selection**: Access to multiple verified print shops with transparent pricing and ratings
- **Secure Payments**: Integrated payment processing with multiple payment options
- **Order Tracking**: Real-time status updates from order placement to completion
- **Pickup Verification**: One-time password system ensures only the rightful recipient collects the prints
- **Vendor Dashboard**: Comprehensive tools for print shops to manage orders and track earnings

---

## Target Audience

### Primary Users

**1. Individual Customers**
- Students at universities and colleges who need academic materials printed frequently
- Working professionals who require printed documents for meetings and presentations
- Home users who need occasional printing services without owning a personal printer
- Parents printing educational materials for their children

**2. Small Businesses**
- Startups requiring marketing materials on short notice
- Local shops needing business cards and promotional flyers
- Event planners requiring printing for functions and gatherings

**3. Print Shop Vendors**
- Local print shops looking to expand their customer base
- Independent printing businesses seeking digital presence
- Copy centers and stationery shops wanting to modernize their operations

---

## System Architecture

### Frontend Architecture

The frontend is built using Next.js 14 with the App Router architecture, providing a modern, server-side rendered React application.

**Key Components:**
- **LayoutWrapper**: Manages the overall application layout and navigation
- **Navbar**: Responsive navigation bar with authentication state management
- **UI Components**: Reusable components including Button, Card, Input, Select, Badge, Alert, and Spinner
- **User Dashboard**: Client-side dashboard for managing print jobs
- **Job Management**: Components for creating, viewing, and tracking print orders

**State Management:**
- React hooks for local state management
- API fetch utilities for server state
- Session-based authentication with Next.js middleware

### Backend Architecture

The backend is a RESTful API built with Express.js, providing a clean separation of concerns through a modular route structure.

**Directory Structure:**
```
backend/src/
├── config/         # Environment configuration
├── domain/         # Business logic and validation
├── lib/           # Shared utilities (Prisma, Supabase, logger)
├── middlewares/   # Authentication, rate limiting, file upload
├── routes/        # API route handlers
├── types/         # TypeScript type definitions
└── utils/         # Helper functions (OTP, pagination, errors)
```

**Key Features:**
- JWT-based authentication with role-based access control
- Rate limiting to prevent abuse
- File upload handling with Multer
- Comprehensive audit logging

### Database Architecture

The application uses SQLite for development and PostgreSQL (via Supabase) for production, managed through Prisma ORM.

**Database Models:**

1. **User**: Stores customer information including authentication and verification status
2. **Vendor**: Contains print shop owner details and account status
3. **PrintJob**: Core entity tracking print orders with status, pricing, and relationships
4. **Payment**: Manages payment transactions and gateway integration
5. **VendorEarning**: Tracks vendor earnings and settlement status
6. **AuditLog**: Records all significant actions for security and compliance
7. **OTP Models**: UserOtp and VendorPasswordReset for secure authentication
8. **PickupOtp**: One-time codes for order collection verification

### Storage Architecture

**File Storage:**
- Supabase Storage for document file hosting
- Secure, signed URLs for file access
- Automatic cleanup of old print files via scheduled functions

**Database Storage:**
- Structured data in SQLite (dev) / PostgreSQL (prod)
- Indexed queries for performance optimization
- Relational integrity through foreign key constraints

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Build Tool**: PostCSS

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: Bcrypt
- **File Upload**: Multer
- **Logging**: Pino

### Database & Storage
- **Development**: SQLite
- **Production**: PostgreSQL (Supabase)
- **Object Storage**: Supabase Storage
- **Database Migrations**: Prisma Migrate

### DevOps & Tools
- **Version Control**: Git
- **Package Management**: npm
- **Runtime**: Node.js
- **Code Quality**: TypeScript compiler, ESLint

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn
- Git
- Supabase account (for production deployment)

### Installation Steps

1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/insta-print.git
cd insta-print
```

2. **Setup Backend**

```bash
cd backend
npm install
```

3. **Setup Frontend**

```bash
cd frontend
npm install
```

4. **Environment Configuration**

Create `.env` file in the backend directory:

```bash
# Backend Environment Variables
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-supabase-anon-key"
PORT=3001
```

Create `.env.local` file in the frontend directory:

```bash
# Frontend Environment Variables
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_KEY="your-supabase-anon-key"
```

5. **Initialize Database**

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

6. **Start Development Servers**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

7. **Access the Application**

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Running User and Vendor Sides Simultaneously

When testing both user and vendor functionalities during development, it is important to run them in separate browser windows or profiles. This prevents cookie collision and authentication conflicts that can occur when switching between user and vendor accounts in the same browser session.

**Option 1: Using Different Browser Profiles**

1. Open Chrome and create a new user profile for vendor testing
2. In Profile 1 (Default): Navigate to http://localhost:3000 and log in as a regular user
3. In Profile 2 (Vendor): Navigate to http://localhost:3000 and log in as a vendor
4. Each profile maintains its own cookies and authentication state

**Option 2: Using Incognito/Private Windows**

1. Open a regular browser window and log in as a user
2. Open an incognito/private window (Ctrl+Shift+N or Cmd+Shift+N)
3. Navigate to the same URL and log in as a vendor
4. Incognito mode isolates cookies from the main session

**Option 3: Using Different Browsers**

1. Use Chrome for user testing
2. Use Firefox or Safari for vendor testing
3. Each browser maintains independent cookie storage

**Important Notes:**
- Always use one account type per browser window
- Do not log out and log in with a different account type in the same window
- Clear browser cache if you encounter unexpected authentication issues
- The backend API is shared, so data will be consistent across both views

---

## Project Structure

```
insta-print/
├── .gitignore              # Git ignore rules
├── README.md               # Project documentation
├── TODO.md                 # Development tasks
├── ENV_CHECKLIST.md        # Environment setup checklist
│
├── backend/                # Express.js backend
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── dev.db          # SQLite database
│   │   └── migrations/     # Database migrations
│   └── src/
│       ├── app.ts          # Express app configuration
│       ├── server.ts       # Server entry point
│       ├── config/         # Environment config
│       ├── domain/         # Business logic
│       ├── lib/            # Shared libraries
│       ├── middlewares/    # Express middleware
│       ├── routes/         # API routes
│       ├── types/          # TypeScript types
│       └── utils/          # Utility functions
│
├── frontend/               # Next.js frontend
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css     # Global styles
│   │   ├── login/          # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   ├── admin/          # Admin panel
│   │   └── user/           # User specific pages
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── LayoutWrapper.tsx
│   │   └── ui/             # Reusable UI components
│   └── lib/                # Frontend utilities
│
└── supabase/               # Supabase configuration
    ├── .gitignore
    ├── config.toml         # Supabase CLI config
    └── functions/          # Edge functions
        └── cleanup-old-print-files/
```

---

## API Endpoints

### Authentication
- `POST /api/user/login` - User login with phone and OTP
- `POST /api/user/register` - User registration
- `POST /api/user/send-otp` - Send verification OTP
- `POST /api/vendor/login` - Vendor login
- `POST /api/vendor/register` - Vendor registration

### Print Jobs
- `POST /api/print-jobs` - Create new print job
- `GET /api/print-jobs` - List user's print jobs
- `GET /api/print-jobs/:id` - Get print job details
- `PATCH /api/print-jobs/:id/price` - Vendor accepts price
- `GET /api/print-jobs/:id/otp` - Get pickup OTP

### Payments
- `POST /api/print-jobs/:id/pay` - Initiate payment
- `GET /api/print-jobs/:id/payment/status` - Check payment status

### Admin
- `GET /api/admin/vendors` - List all vendors
- `PATCH /api/admin/vendors/:id` - Update vendor status
- `GET /api/admin/earnings` - View earnings report

---

## Workflow

### User Journey

1. **Registration and Login**
   - User enters phone number
   - Receives OTP via SMS
   - Verifies OTP and creates account

2. **Creating a Print Job**
   - User navigates to create job page
   - Uploads document file (PDF, images, etc.)
   - Selects print options (color mode, paper size, copies)
   - Views available vendors with pricing
   - Selects preferred vendor
   - Confirms order and proceeds to payment

3. **Payment Processing**
   - User selects payment method
   - Payment gateway integration processes transaction
   - Order status updates to "Processing"

4. **Vendor Notification**
   - Vendor receives order notification
   - Vendor views order details
   - Vendor confirms pricing and begins printing

5. **Order Completion**
   - Vendor marks job as ready
   - System generates pickup OTP
   - User receives notification

6. **Pickup**
   - User visits vendor location
   - Provides pickup OTP
   - Vendor verifies and hands over prints
   - Order marked as completed

### Vendor Workflow

1. **Dashboard Overview**
   - View pending orders
   - Monitor earnings
   - Track completed jobs

2. **Order Management**
   - Receive new order notifications
   - Review document and pricing
   - Accept or decline orders
   - Update job status throughout process

3. **Earnings Management**
   - Track daily, weekly, monthly earnings
   - View platform fees
   - Request settlements

---

## Security Features

- **Authentication**: JWT-based authentication with secure token refresh
- **Password Security**: Bcrypt hashing with salt rounds
- **OTP Verification**: Time-limited one-time passwords
- **Role-Based Access**: Separate permissions for users, vendors, and admins
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation for all inputs
- **Audit Logging**: Complete trail of all significant actions
- **Secure File Handling**: Signed URLs for document access

---

## Future Works

> The following features are part of the planned roadmap and are not yet implemented in the current version of the platform.

### Multi-Channel OTP and Notification Infrastructure

The current OTP system operates on a basic implementation that can be significantly improved for better reliability and user reachability. Future development includes integration with local SMS providers such as Twilio, MSG91, and Fast2SMS to ensure OTP delivery across all mobile carriers with high success rates.

Additionally, implementing WhatsApp Business API integration will provide an alternative communication channel that offers higher message delivery rates and lower costs compared to traditional SMS. This will also enable the platform to send rich notifications including order updates, payment confirmations, and promotional messages through WhatsApp's Business platform. The multi-channel approach ensures that users receive important communications regardless of their preferred messaging platform.

### Online Payment Gateway and Transaction Automation

The platform is designed to support a comprehensive payment ecosystem. Future iterations will include integration with major payment gateways such as Razorpay, Stripe, and PayU to enable seamless online payments. This integration will support multiple payment methods including credit cards, debit cards, net banking, UPI, and digital wallets.

Implementing payment webhooks will ensure real-time payment confirmation and automatic order status updates. The system will also support payment links and QR code generation for offline customer acquisition, allowing vendors to collect payments from walk-in customers through the platform. Subscription-based payment options for frequent users and corporate clients will provide additional revenue streams and customer loyalty opportunities.

### Invoice Generation and Management

A complete invoicing system is planned for future implementation to serve both individual customers and business clients. This feature will automatically generate professional invoices upon payment completion, including detailed breakdowns of print job specifications, pricing, taxes, and vendor information.

The system will support customizable invoice templates for different business branding requirements. Digital invoice storage will allow customers to access their transaction history and download invoices for accounting and reimbursement purposes.

Corporate clients will have access to consolidated monthly invoices and detailed expense reports for their organizational needs. The invoice system will also integrate with popular accounting software such as Tally, Zoho Books, and QuickBooks to streamline business financial operations.

### Comprehensive Refund Management System

The platform will implement a full-featured refund management system to handle customer payment reversals transparently and efficiently. This system will include automated refund processing for failed payments and cancelled orders. Support for partial refunds will allow refunds for specific items or services within a print job order.

A dedicated refund tracking dashboard will enable administrators to monitor refund requests, process them within defined SLAs, and generate reports on refund metrics. The system will maintain complete audit trails for all refund transactions, ensuring compliance with financial regulations and providing transparency to all stakeholders.

Customer-facing refund status tracking will allow users to monitor their refund requests in real-time from their dashboard.

### Automated Vendor Payout and Settlement Engine

The vendor earnings system is planned for significant enhancement to provide more tangible and flexible payment options. Future development includes integration with payment disbursement services such as RazorpayX, Paytm Payouts, and Stripe Connect to enable automatic vendor settlements.

Configurable payout schedules will allow vendors to choose between daily, weekly, or monthly settlement cycles based on their business requirements. A comprehensive vendor wallet system will enable vendors to maintain balances within the platform, view detailed transaction histories, and track pending settlements. Bank account verification with automated KYC compliance will ensure secure and compliant fund transfers.

Real-time payment notifications will keep vendors informed about settlement completions and pending amounts. Detailed earning reports including platform fee breakdowns, tax deductions, and net payable amounts will provide complete financial transparency to vendors.

### Additional Planned Enhancements

Beyond the core features mentioned above, several other improvements are planned for future releases. A mobile application for both iOS and Android platforms will provide native user experiences with push notifications and offline capabilities.

Advanced analytics dashboards for vendors will include demand forecasting, peak hour analysis, and customer behavior insights. A vendor rating and review system will help maintain service quality and build customer trust. Multi-language support will make the platform accessible to users across different linguistic regions. Integration with cloud printing services will enable remote printing and delivery options for customers who cannot visit physical pickup locations.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Support

For support, please open an issue in the GitHub repository for bug reports, feature requests, or technical discussions.

