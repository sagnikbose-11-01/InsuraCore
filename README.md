# 🛡️ InsuraCore

<div align="center">

### AI-Powered Insurance Management & Claims Processing Platform

A full-stack enterprise-grade InsurTech platform that streamlines policy management, claim processing, assessor workflows, and administrative operations through a modern AI-enhanced ecosystem.

Built with Next.js 15, TypeScript, MongoDB, JWT Authentication, Role-Based Access Control, and Vercel Blob Storage.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![RBAC](https://img.shields.io/badge/RBAC-Secure-success)
![Vercel Blob](https://img.shields.io/badge/Vercel-BlobStorage-black)

</div>

---

# 📖 Overview

InsuraCore is a modern insurance ecosystem that connects Customers, Assessors, and Administrators through a centralized platform for managing insurance policies, processing claims, monitoring system activity, and delivering intelligent insurance assistance.

The platform provides:

- Multi-role workspaces
- Policy marketplace
- Claim lifecycle management
- Assessor review workflows
- Admin command center
- Real-time notifications
- Secure document storage
- AI-powered insurance assistance

Unlike traditional insurance systems, InsuraCore introduces specialization-based assessor routing, policy approval pipelines, and enterprise-grade dashboards that simulate real-world insurance operations.

---

# 🎯 Core Objectives

InsuraCore was designed to solve common insurance industry challenges:

✅ Complex claim processing

✅ Slow assessor workflows

✅ Poor claim visibility

✅ Lack of centralized administration

✅ Inefficient policy management

✅ Fragmented customer experience

✅ Limited access to insurance guidance

---

# 🏗️ System Architecture

```text
                     ┌─────────────────┐
                     │     Customer    │
                     └────────┬────────┘
                              │
                              ▼
                    Purchase Policies
                    Submit Claims
                    Track Progress
                              │
                              ▼

┌─────────────────────────────────────────────────────┐
│                     InsuraCore                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Policy Marketplace                                │
│  Claim Processing Engine                           │
│  Notification Service                              │
│  AI Copilot Assistant                              │
│  Assessor Assignment Engine                        │
│  Analytics & Reporting                             │
│                                                     │
└─────────────────────────────────────────────────────┘
               │                    │
               ▼                    ▼

      ┌──────────────┐     ┌────────────────┐
      │  Assessors   │     │     Admins     │
      └──────────────┘     └────────────────┘

      Review Claims         Platform Monitoring
      Create Policies       User Management
      Risk Assessment       Policy Approval
      Settlement Review     System Analytics
```

---

# 👥 User Roles

## 👤 Customer

Customers can:

- Browse insurance marketplace
- Purchase insurance policies
- View purchased policies
- Track policy status
- File insurance claims
- Upload supporting documents
- View claim history
- Receive assessor feedback
- Receive real-time notifications
- Use AI Copilot for guidance

---

## 👨‍💼 Assessor

Assessors are specialized insurance reviewers.

Supported specializations:

- Health Insurance
- Auto Insurance
- Property Insurance
- Travel Insurance
- Life Insurance

Assessors can:

- Review claims
- Approve claims
- Reject claims
- Request additional documents
- Add customer-facing remarks
- Maintain internal audit notes
- View work queues
- Track claim history
- Create new insurance policies
- Manage policies within their specialization
- Monitor performance metrics

---

## 👑 Administrator

Administrators have full platform visibility.

Admins can:

- Monitor all customers
- Monitor all assessors
- View system-wide analytics
- Review platform activity logs
- Approve assessor-created policies
- Manage users
- Monitor marketplace health
- Review claim performance
- Track policy adoption
- View audit trails

---

# 🌟 Key Features

## 🛒 Insurance Marketplace

Customers can:

- Explore insurance products
- Compare plans
- View policy details
- Purchase policies
- Track active policies

Supported policy types:

- Health
- Auto
- Property
- Travel
- Life

---

## 📄 Smart Claim Processing

End-to-end digital claim lifecycle.

Features:

- Claim submission
- Document uploads
- Evidence management
- Assessor review
- Approval workflow
- Rejection workflow
- Settlement tracking

Claim statuses:

```text
Draft
↓
Submitted
↓
Under Review
↓
Pending Documents
↓
Approved / Rejected
↓
Settled
```

---

## 🔄 Specialization-Based Routing

One of the core features of InsuraCore.

Claims are automatically assigned based on policy type.

Example:

```text
Health Claim
      ↓
Health Assessor

Property Claim
      ↓
Property Assessor

Travel Claim
      ↓
Travel Assessor
```

This ensures:

- Faster processing
- Better claim accuracy
- Realistic insurance workflows

---

## 🧠 AI Copilot Workspace

Interactive AI-powered insurance assistant.

Capabilities:

- Insurance FAQs
- Coverage explanations
- Claim guidance
- Policy recommendations
- Claim process assistance
- Platform navigation support

---

## 🔔 Real-Time Notifications

Users receive notifications for:

- Policy purchases
- Claim submissions
- Claim approvals
- Claim rejections
- Assessor remarks
- Document requests
- Policy approvals

---

## 📊 Advanced Analytics

### Customer Analytics

- Active Policies
- Claims Submitted
- Claim Success Rate

### Assessor Analytics

- Claims Reviewed
- Approval Rate
- Average Processing Time

### Admin Analytics

- Revenue Metrics
- User Growth
- Marketplace Performance
- System Health

---

## 📝 Audit Logging

All major actions are recorded.

Examples:

- User login
- Policy purchase
- Claim submission
- Claim approval
- Policy creation
- Policy approval

---

# 🔒 Security Features

- JWT Authentication
- Role-Based Access Control (RBAC)
- Protected API Routes
- Secure Password Hashing
- Assessor Specialization Restrictions
- Audit Logging
- Session Validation

---

# ☁️ Document Storage

InsuraCore uses **Vercel Blob Storage** for cloud-based document management.

Stored assets include:

- Claim evidence
- Medical reports
- Property damage photos
- Travel documents
- Policy attachments

Features:

- Secure uploads
- Cloud storage
- Fast retrieval
- Scalable architecture

---

# 🚀 Tech Stack

## Frontend

- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion

## Backend

- Next.js API Routes
- Server Actions
- REST APIs

## Database

- MongoDB Atlas
- Mongoose ODM

## Authentication

- JWT Authentication
- Role-Based Access Control (RBAC)

## Storage

- Vercel Blob Storage

## Validation

- Zod

## UI Components

- Lucide React

## Analytics

- Recharts

---

# ⚙️ Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

ADMIN_INVITE_CODE=your_admin_code

NEXT_PUBLIC_APP_URL=http://localhost:3000

BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

---

# 🛠️ Installation

## Clone Repository

```bash
git clone https://github.com/sagnikbose-11-01/InsuraCore.git

cd InsuraCore
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create:

```bash
.env.local
```

Add all required variables.

## Start Development Server

```bash
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

# 🌐 Deployment

Recommended platform:

## Vercel

Steps:

1. Push repository to GitHub

2. Import into Vercel

3. Configure environment variables

4. Deploy

5. Seed initial policies

```text
https://your-app.vercel.app/api/seed
```

---

# 📈 Future Enhancements

- AI Fraud Detection
- Email Notifications
- SMS Alerts
- Payment Gateway Integration
- OCR Document Verification
- Predictive Claim Risk Analysis
- Multi-language Support
- Mobile Application
- Real-Time Assessor Chat

---

# 🧪 Project Highlights

This project demonstrates:

- Full-Stack Development
- Enterprise Architecture
- Multi-Role Authentication
- JWT Security
- MongoDB Design
- Cloud Storage Integration
- Workflow Automation
- Dashboard Engineering
- Analytics Systems
- AI Integration
- SaaS Product Design

---

# 📄 License

Licensed under the MIT License.

---

# 👨‍💻 Author

### Sagnik Bose

Built as a modern InsurTech platform demonstrating enterprise-level software engineering, role-based architecture, workflow automation, AI integration, and scalable full-stack development.