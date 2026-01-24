# InstaPrint — Skip the Queue, Print Smarter

InstaPrint is a simple web application that demonstrates how a real world printing workflow can be handled digitally without confusion, long queues, or manual coordination.

This project focuses on **authentication, role based access, dashboards, and secure workflows**, presented in a clean and beginner friendly way so that anyone can try it out easily.

> 🔗 Live Application:  
> **https://insta-print.onrender.com/**

---

## What this Project is?

InstaPrint lets two types of people use the same system:

- **Users** → People who want to get prints hazzle free by skipping the long waiting queue's and save time.
- **Vendors** → Print shop owners who manage incoming jobs, convert, show case their business online for their growth's and solve the major problem's which are faced by the respective target audience and get their reach. 

Both roles log in differently, see different dashboards, and cannot interfere with each other because of the strictly implementation of the cookies concept.

This project is **not a commercial product** it is a **functional, end-to-end system demo** built to showcase how modern web apps handle authentication, roles, and workflows.

---

## How can you catch up with the live Website?

Please follow the instructions **exactly in this order**.

---

## Option 1: Try the Existing Vendor Account by logging in directly (or) You can create one on-your-own in the live Website

A ready to use vendor account is already created so you can explore the vendor dashboard without creating another vendor account if you are in a hurry.

### Vendor Login Details

- **Phone Number:** `9898989898`
- **Password:** `@StrongPass123`
- **Shop Name:** `B.Tech Print Wala`
- **Owner Name:** `Brad Pitt`

⚠️ **Do not change the password for this phone number** as this account is shared for demo purposes for trailing purpose for the people like you.

### Steps

1. Open the live Website -
 https://insta-print.onrender.com/login/vendor

2. Enter the credentials above

3. Click **Sign In**

4. You will be redirected to the **Vendor Dashboard**

From here, you can:
- View vendor specific pages
- Explore dashboard navigation
- Understand how vendor authentication works

### What you can do as a Vendor? Here's the Walkthrough...

Once you log in as a vendor, You can fully simulate how a real print shop would operate using InstaPrint.

## Here’s the recommended flow to try everything properly:

1. Go to the Vendor Dashboard. After login, you’ll land on the vendor dashboard where you can see an overview of your activity. Forgot your password? No worries as you have an option of resetting your password through the forgot-password page.

2. Open the “Jobs” section. Navigate to Vendor Jobs to view all incoming print requests from users. Any new request will appear as a pending job.

3. Review a Pending Job.

4. Click on a pending job to open its details.

5. Set the Price for the Job by Entering the price you want to charge for that print job, Then proceed with Submitting the final price to the customer.

6. The job will now wait for the user’s price acceptance, Wait for User Acceptance. Once the user accepts the price and completes payment, The job status will update automatically. Only after this step should printing begin.

7. Check the uploaded document and job requirements, Download the File for Printing by Clicking the Download File button provided in the job which is a secure link which doesn't leak your documents. Print the file using your printing machine as usual then Mark the Job as Ready.

8. This indicates that the order can now be collected by the user via OTP Based Pickup Verification

9. The user will receive a pickup OTP

10. Verify the OTP when the customer arrives

11. This ensures the print is handed over to the correct person

12. Settle Earnings by Visiting the Settle / Earnings page. View unsettled amounts, Settle completed jobs to track finalized earnings

This flow mirrors how a real print shop would handle orders from receiving a job to final handover but in a fully digital and organized way.

---

## Option 2: Try User Login on the live Website

User login works using a phone number and OTP (One Time Password).

### Steps

1. Open the live Website -
 https://insta-print.onrender.com/login/user

2. Enter **any valid 10 digit phone number**

3. Click **Send OTP**

4. Since this is a demo environment:
   - The OTP will **appear on the screen**
   - Click **Copy & Fill** to auto enter it

5. Click **Verify OTP**

You will now be logged in as a user and redirected to the user dashboard.

### What you can do as a User? Here's the Walkthrough...

Once you access InstaPrint as a user, you can experience how document printing works end-to-end from uploading a file to collecting the printed document without any confusion.

## Here’s the recommended flow to try everything properly:

1. Go to the User Login Page. Open the live site
 and navigate to the user login page. Enter your phone number and proceed with OTP based login. The OTP will be shown on the screen wherever applicable.

2. Verify OTP and Access the Dashboard. Enter the 6 digit OTP to verify your identity. After successful verification, you’ll be redirected to the User Dashboard where you can see your activity and job history.

3. Create a New Print Job. Navigate to the Create New Job or New Print Job section from the dashboard. Upload the document you want to print using the provided upload option.

4. Submit Print Requirements. Provide the necessary details such as number of copies and any additional instructions related to the print job. Submit the job request to make it visible to vendors.

5. Wait for Vendor Price Quotation. Once a vendor reviews your job, they will set a price for the print request. The job will remain in a pending state until a price is quoted.

6. Review and Accept the Price. When the vendor sets a price, you will be notified on your dashboard. Review the quoted price carefully and proceed with accepting it if you are satisfied.

7. Complete Payment. After accepting the price, complete the payment as prompted. Once payment is successful, the job status updates automatically.

8. After payment, the vendor will download the document and start printing it. You don’t need to take any action during this step.

9. Receive Pickup OTP. Once the vendor marks the job as Ready, a pickup OTP will be generated for your order. This OTP is required to securely collect your printed documents.

10. Collect Your Prints Using OTP Verification. Visit the vendor and provide the pickup OTP. The vendor verifies the OTP to ensure the prints are handed over to the correct person.

11. After OTP verification, the job is marked as Completed.
You can view the completed job details and history from your dashboard.

This flow demonstrates how a user can move from uploading a document to securely collecting printed output all through a smooth, guided, and digital experience.

---

## ⚠️ Important Usage Rules Before Going With The Live Website

Please read this carefully to avoid confusion.

### 1. Do NOT use the same browser window for both roles

User and Vendor sessions are **completely separate**.

Choose ONE of the following:

- Use **two different browsers**  
  (Example: Chrome for User, Firefox for Vendor)

(OR)

- Use **Incognito / Private window** for one role

If you ignore this, authentication may break due to cookie conflicts.

---

### 2. Do NOT refresh randomly during login

- Wait for redirects to complete
- Let the page navigate automatically after login

---

### 3. OTP visibility is intentional

OTP appearing on screen is **expected behavior** in this demo.
This is done so reviewers can test the system **without SMS integration**.

---

## What This Project Demonstrates?

- User Login Through Phone Number with OTP authentication
- Vendor login with secure passwords
- Role based access control (User vs Vendor)
- Cookie based authentication for both the roles
- Protected routes and dashboards
- Clean frontend and backend separation
- Live working end-to-end deployment through Render

This project is meant to show **how things work internally**, not just how they look.

---

## Tech Stack used in this Project

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- App Router
- Cookie based authentication

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT Authentication
- Rate limiting & security middleware

### Database
- SQLite (development)
- PostgreSQL (production)

---

## Project Structure 

```text
insta-print/
├── .gitignore
├── .node-version
├── ENV_CHECKLIST.md
├── README.md
│
├── backend/
│   ├── .gitignore
│   ├── ENV_CHECKLIST.md
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       └── 20260123075014_init_postgres/
│   │           └── migration.sql
│   │
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── test.ts
│       │
│       ├── config/
│       │   └── env.ts
│       │
│       ├── domain/
│       │   ├── audit.ts
│       │   └── ledgerGuards.ts
│       │
│       ├── lib/
│       │   ├── logger.ts
│       │   ├── prisma.ts
│       │   ├── requireRole.ts
│       │   ├── supabase.ts
│       │   └── types.ts
│       │
│       ├── middlewares/
│       │   ├── authGuard.ts
│       │   ├── customLimiters.ts
│       │   ├── rateLimit.ts
│       │   ├── requestId.ts
│       │   ├── requestLogger.ts
│       │   ├── upload.ts
│       │   └── webhookAuth.ts
│       │
│       ├── routes/
│       │   ├── admin.routes.ts
│       │   ├── printjob.routes.ts
│       │   ├── user.routes.ts
│       │   └── vendor.routes.ts
│       │
│       ├── types/
│       │   └── (reserved for shared types)
│       │
│       └── utils/
│           ├── AppError.ts
│           ├── asyncHandler.ts
│           ├── cookies.ts
│           ├── otp.ts
│           ├── pagination.ts
│           ├── request.ts
│           ├── sendSms.ts
│           └── sms.ts
│
├── frontend/
│   ├── ENV_CHECKLIST.md
│   ├── middleware.ts
│   ├── next-env.d.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   │
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── login/
│   │   │   ├── layout.tsx
│   │   │   └── user/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   └── vendors/
│   │   │       └── page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── jobs/
│   │   │       └── page.tsx
│   │   │
│   │   └── user/
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       │   ├── page.tsx
│   │       │   └── user-dashboard-client.tsx
│   │       └── jobs/
│   │           ├── page.tsx
│   │           ├── user-job-list-client.tsx
│   │           ├── new/
│   │           │   ├── page.tsx
│   │           │   └── create-job-client.tsx
│   │           └── [jobId]/
│   │               ├── page.tsx
│   │               └── user-job-detail-client.tsx
│   │
│   ├── components/
│   │   ├── LayoutWrapper.tsx
│   │   ├── Navbar.tsx
│   │   └── ui/
│   │       ├── Alert.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── FileUpload.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       └── Spinner.tsx
│   │
│   └── lib/
│       ├── apiFetch.ts
│       ├── auth.ts
│       └── utils.ts
│
└── supabase/
    ├── .gitignore
    ├── ENV_CHECKLIST.md
    ├── config.toml
    └── functions/
        └── cleanup-old-print-files/
            ├── .npmrc
            ├── deno.json
            └── index.ts

---

## What to Explore as a Reviewer

If you are reviewing this project, try:

- Logging in as a **Vendor**
- Logging in as a **User**
- Switching dashboards using separate browser sessions
- Observing how authentication behaves securely
- Inspecting protected routes (they block unauthorized access)

---

### Project Scope & Version Roadmap (v1)

## The current live deployment of InstaPrint represents Version 1 (v1) of the platform.

This version is intentionally designed to prove the core idea end-to-end focusing on authentication, job flow, vendor and user interaction, and operational correctness before expanding into advanced features.

## What Version 1 Focuses On?

Version 1 prioritizes the fundamental workflow of a real print shop, including:

- OTP based authentication for users and vendors

- Clear separation of user, vendor, and admin roles

- Secure document upload and access

- Vendor driven pricing and job management

- User price acceptance flow

- OTP based pickup verification

- Earnings tracking and settlement visibility

These features together demonstrate the complete lifecycle of a print job, from request creation to final handover.

## Features Planned for Future Versions

Some capabilities are intentionally deferred to future versions to keep the initial release stable, understandable, and easy to evaluate.

# These include:

- Online payment gateway integrations (planned with Razorpay / Stripe / UPI support)

- Delivery and logistics workflows (currently designed for in-person pickup using OTP verification)

- Location based vendor discovery (distance, maps, and geo-filtering)

- Automated vendor payouts and settlements (currently tracked logically, with manual settlement simulation)

- Production grade SMS and notification providers
(OTP is surfaced on screen in development for transparency and testing)

## Why This Approach Was Chosen?

- By limiting the scope in Version 1, InstaPrint ensures:

- The core business logic is solid and testable

- Evaluators can easily understand how the system works

- Each feature can be demonstrated clearly without external dependencies

- Future enhancements can be added incrementally without redesign

- This approach mirrors how real world platforms evolve starting with a strong operational foundation and expanding into payments, logistics, and automation once the workflow is proven.

In short: Version 1 proves the idea works. Future versions make it bigger, smarter, and more automated.

---

## Final Notes

This project is best understood by **using it**, not just reading the code.

If something doesn’t work, it’s usually because:
- The same browser session is being reused
- Cookies were blocked
- Steps were skipped
- Render being busy when try to deploy

Follow the guide carefully and everything will work smoothly.

---

## License

This project is licensed under the MIT License.

---

## Support

If you’re exploring this as a reviewer, student, or developer:
- Feel free to fork it
- Test it
- Break it
- Learn from it

That’s exactly what it’s built for.