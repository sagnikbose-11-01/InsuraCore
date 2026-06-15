# InsuraCore

InsuraCore is a comprehensive, full-stack insurance management platform built with Next.js 15, TypeScript, Tailwind CSS, and MongoDB. It provides a robust architecture supporting three distinct user roles—Customers, Assessors, and Administrators—each with specialized dashboards and workflows for managing insurance policies and claims.

## 🌟 Key Features

### For Customers
- **Marketplace:** Browse and purchase from a wide array of active insurance policies (Health, Auto, Property, Life, Travel).
- **Portfolio Management:** Track active and past purchased policies.
- **Claims Submission:** Submit claims with incident details and required documentation.
- **Real-time Tracking:** Monitor claim statuses and respond to assessor requests.

### For Assessors
- **Policy Creation:** Design and propose new insurance policies tailored to specific specializations (e.g., Health, Auto).
- **Work Queue:** Manage assigned claims, review documents, and communicate directly with customers.
- **Analytics:** View detailed metrics and performance data for their specialized policies.

### For Administrators
- **Master Dashboard:** Oversee platform activity, revenue, and overall system health.
- **Approvals Queue:** Review and approve/reject newly created policies by Assessors before they go live on the marketplace.
- **User Management:** Monitor customer and assessor activity across the platform.

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) via Mongoose
- **Authentication:** Custom JWT-based Role-Based Access Control (RBAC)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

## ⚙️ Environment Variables

To run this project locally, you will need to add the following environment variables to your `.env.local` file:

```env
# MongoDB Connection String (Required)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/insuracore

# JWT Authentication Secret (Required)
JWT_SECRET=your_super_secret_jwt_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Used for admin signup/registration
ADMIN_INVITE_CODE=YOUR_ADMIN_CODE
```

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/sagnikbose-11-01/InsuraCore.git
   cd InsuraCore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variables**
   Create a `.env.local` file in the root directory and add the variables listed above.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

The easiest way to deploy your InsuraCore app is to use the [Vercel Platform](https://vercel.com/):

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_INVITE_CODE`) in the Vercel dashboard.
4. Deploy!

*(Make sure your MongoDB cluster's network access allows connections from `0.0.0.0/0` so Vercel can connect dynamically).*

5. **Seed the Database**
   Once your app is deployed (or while running locally), you can populate the marketplace with default policies by simply navigating to:
   `https://your-deployment-url.vercel.app/api/seed` (or `http://localhost:3000/api/seed` locally).
   *Note: The seed script will only run if there are 0 policies in your database, preventing accidental duplicates.*

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
