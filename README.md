# B2B RFQ Marketplace

A complete, production-ready, and maintainable **B2B RFQ (Request for Quotation) Marketplace** built as a full-stack web application. It connects enterprise **Buyers** who need products and industrial services with verified **Suppliers** who submit competitive price and delivery quotations.

---

## Overview

In traditional B2B procurement, businesses communicate through fragmented email chains, phone calls, and spreadsheets to gather quotes. The **B2B RFQ Marketplace** digitizes this workflow:
- **Buyers** create structured Requests for Quotation (RFQs) with required quantities, delivery locations, and deadlines.
- **Suppliers** discover commercial opportunities, search and filter open requests, and submit structured quotation bids with delivery lead times and pricing.
- **Buyers** review received quotes side-by-side and manage procurement statuses (`OPEN` / `CLOSED`).

---

## Features

### Buyer Capabilities
- **Role-Based Registration & Authentication**: Secure sign-up and JWT-authenticated sessions.
- **Buyer Dashboard**: High-level procurement metrics (Total RFQs, Open RFQs, Closed RFQs, Total Quotations Received) and recent RFQs table.
- **RFQ Creation**: Form with validation (product name, description, positive quantity, delivery location, future deadline).
- **RFQ Management**: View complete RFQ specifications, received quotation bids, edit RFQ details, toggle status (`OPEN` / `CLOSED`), and delete RFQs.
- **Received Quotation Review**: Inspect supplier name, contact email, quoted price (in ₹ INR), estimated delivery timeline, and notes.

### Supplier Capabilities
- **Supplier Dashboard**: View available RFQs count and number of submitted bids.
- **Browse & Discovery**: Browse open RFQs with keyword search across product name, description, and location.
- **Filters**: Filter by delivery location, status (`OPEN`, `CLOSED`, `ALL`), and deadline (`Active`, `Expired`, `All`).
- **RFQ Details & Quote Submission**: View full buyer specifications and submit competitive bids.
- **Duplicate Prevention**: Suppliers cannot submit multiple bids for the same RFQ (enforced in database and service layer).
- **Eligibility Protection**: Prevents quote submission for closed or expired RFQs.
- **My Quotations**: Track quotation history, prices, estimated delivery times, and current RFQ statuses.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, React Hook Form, Zod, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, Zod, JWT (`jsonwebtoken`), `bcrypt`, `helmet`, `cors` |
| **Database** | MySQL (with Prisma Client & Schema Migrations) |
| **Tooling & VCS** | Git, npm, ts-node-dev |

---

## Architecture

The system follows a clean, decoupled client-server architecture:

```text
┌────────────────────────────────────────────────────────┐
│               Frontend (React + Vite)                  │
│  - React Router (Role Guards & Public/Protected pages)  │
│  - AuthContext (JWT state & automatic localStorage)    │
│  - Axios with Auth and 401 Interceptors                │
│  - Tailwind CSS UI + React Hook Form + Zod             │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST (JSON)
                           ▼
┌────────────────────────────────────────────────────────┐
│               Backend (Express + TypeScript)           │
│  - Routes (auth, rfqs, quotations)                     │
│  - Middleware (authMiddleware, authorizeRoles, Zod)    │
│  - Controllers (HTTP status codes & responses)         │
│  - Services (Business logic & database transactions)   │
│  - Centralized Error Handler (ApiError)                │
└──────────────────────────┬─────────────────────────────┘
                           │ Prisma ORM
                           ▼
┌────────────────────────────────────────────────────────┐
│               Database (MySQL)                         │
│  - User (id, name, email, password, role)              │
│  - RFQ (id, buyerId, productName, quantity, deadline)  │
│  - Quotation (id, rfqId, supplierId, quotedPrice, ...) │
└────────────────────────────────────────────────────────┘
```

---

## Database Design

### Schema Models

```prisma
enum Role {
  BUYER
  SUPPLIER
}

enum RfqStatus {
  OPEN
  CLOSED
}

model User {
  id         Int         @id @default(autoincrement())
  name       String      @db.VarChar(100)
  email      String      @unique @db.VarChar(255)
  password   String      @db.VarChar(255)
  role       Role
  rfqs       RFQ[]       @relation("BuyerRfqs")
  quotations Quotation[] @relation("SupplierQuotations")
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  @@index([email])
}

model RFQ {
  id               Int         @id @default(autoincrement())
  buyerId          Int
  buyer            User        @relation("BuyerRfqs", fields: [buyerId], references: [id], onDelete: Cascade)
  productName      String      @db.VarChar(255)
  description      String      @db.Text
  quantity         Int
  deliveryLocation String      @db.VarChar(255)
  deadline         DateTime
  status           RfqStatus   @default(OPEN)
  quotations       Quotation[]
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  @@index([buyerId])
  @@index([status])
  @@index([deadline])
}

model Quotation {
  id                    Int      @id @default(autoincrement())
  rfqId                 Int
  rfq                   RFQ      @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  supplierId            Int
  supplier              User     @relation("SupplierQuotations", fields: [supplierId], references: [id], onDelete: Cascade)
  quotedPrice           Decimal  @db.Decimal(12, 2)
  estimatedDeliveryTime String   @db.VarChar(100)
  message               String?  @db.Text
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([rfqId, supplierId])
  @@index([rfqId])
  @@index([supplierId])
}
```

### Relational Integrity & Constraints
- **1:N User (Buyer) to RFQs**: An RFQ belongs to exactly one buyer.
- **1:N RFQ to Quotations**: An RFQ can receive multiple quotations.
- **N:1 Quotation to User (Supplier)**: Each quotation is linked to a supplier.
- **Unique Constraint (`@@unique([rfqId, supplierId])`)**: Prevents duplicate bids by the same supplier for the same RFQ.
- **Cascading Deletions**: Deleting an RFQ cleans up associated quotations automatically.

---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user as `BUYER` or `SUPPLIER` |
| `POST` | `/api/auth/login` | Public | Login with email and password, receives JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Requests for Quotation (RFQs)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/rfqs` | Authenticated | Browse RFQs with search & filters |
| `GET` | `/api/rfqs/my` | `BUYER` only | List RFQs created by authenticated buyer |
| `GET` | `/api/rfqs/:id` | Authenticated | Get RFQ details (includes quotations if owner) |
| `POST` | `/api/rfqs` | `BUYER` only | Create a new RFQ |
| `PUT` | `/api/rfqs/:id` | `BUYER` (Owner) | Update an existing RFQ |
| `DELETE` | `/api/rfqs/:id` | `BUYER` (Owner) | Delete an existing RFQ |

### Quotations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/quotations` | `SUPPLIER` only | Submit quotation bid for an open, active RFQ |
| `GET` | `/api/quotations/my` | `SUPPLIER` only | View all quotations submitted by current supplier |
| `GET` | `/api/rfqs/:id/quotations` | `BUYER` (Owner) | View all quotations received for a specific RFQ |

---

## Authentication & Authorization

1. **Authentication Flow**:
   - Passwords are encrypted using `bcrypt` with 10 salt rounds.
   - On successful registration/login, a signed JWT is issued containing `userId`, `email`, and `role`.
   - The token is sent in the `Authorization: Bearer <token>` header on subsequent requests.
   - Sensitive password hashes are never returned to the frontend.

2. **Role-Based Authorization (RBAC)**:
   - `authMiddleware`: Verifies token signature and attaches decoded user to `req.user`.
   - `authorizeRoles('BUYER')` / `authorizeRoles('SUPPLIER')`: Rejects unauthorized role actions with HTTP `403 Forbidden`.
   - **Resource Ownership**: Services explicitly check `rfq.buyerId === req.user.userId` before allowing `update`, `delete`, or viewing private quotes.

---

## Project Structure

```text
rfq-marketplace/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, StatusBadge, LoadingSpinner, EmptyState, etc.)
│   │   ├── context/            # AuthContext (state, login, register, logout)
│   │   ├── layouts/            # DashboardLayout
│   │   ├── pages/
│   │   │   ├── public/         # LandingPage, LoginPage, RegisterPage
│   │   │   ├── buyer/          # BuyerDashboard, CreateRfqPage, EditRfqPage, RfqDetailsBuyerPage
│   │   │   └── supplier/       # SupplierDashboard, RfqDetailsSupplierPage, MyQuotationsPage
│   │   ├── services/           # Axios API services (auth, rfq, quotation)
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # formatters (₹ INR currency, dates)
│   │   ├── App.tsx             # Route definitions & guards
│   │   ├── main.tsx
│   │   └── index.css           # Tailwind directives
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── vercel.json
├── server/                     # Backend Application (Express + Prisma + MySQL)
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema
│   │   └── seed.ts             # Database seeder with sample accounts
│   ├── src/
│   │   ├── config/             # Environment & Prisma client configuration
│   │   ├── controllers/        # HTTP controllers (auth, rfq, quotation)
│   │   ├── middleware/         # authMiddleware, roleMiddleware, errorHandler, validate
│   │   ├── routes/             # Express route definitions
│   │   ├── services/           # Business logic layer
│   │   ├── validators/         # Zod schemas (auth, rfq, quotation)
│   │   ├── utils/              # ApiError, response helpers, password, jwt
│   │   ├── scripts/            # test-api.ts verification suite
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Server bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── .gitignore
├── package.json                # Root package for workspace management
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- npm

### 1. Clone the repository
```bash
git clone <repository-url>
cd rfq-marketplace
```

### 2. Set Up the Backend
```bash
cd server
npm install
cp .env.example .env
```
Configure your `.env` file with your MySQL credentials:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:root@localhost:3306/rfq_marketplace"
JWT_SECRET="rfq-marketplace-super-secret-jwt-key-for-auth-2026"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

### 3. Initialize & Seed the Database
```bash
# Push schema to MySQL and generate Prisma client
npx prisma db push

# Seed sample buyers, suppliers, RFQs, and quotations
npm run seed
```

### 4. Set Up the Frontend
```bash
cd ../client
npm install
cp .env.example .env
```

---

## Environment Variables

### Backend (`server/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `DATABASE_URL` | MySQL connection string | `mysql://root:root@localhost:3306/rfq_marketplace` |
| `JWT_SECRET` | Secret key used to sign JWTs | Secure random string |
| `JWT_EXPIRES_IN` | JWT expiration duration | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`client/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base API URL | `/api` (uses Vite proxy in dev) |

---

## Running the Application

### Option 1: Run Concurrently from Root
```bash
# Terminal 1 (Backend)
npm run dev:server

# Terminal 2 (Frontend)
npm run dev:client
```

### Option 2: Run Separately
```bash
# In /server
npm run dev

# In /client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## Seed Test Credentials

The database seeder (`npm run seed`) populates the following accounts for immediate testing:

| Role | Name | Email | Password |
|---|---|---|---|
| **Buyer** | Apex Retailers Ltd | `buyer@example.com` | `Password123!` |
| **Buyer** | Zenith Innovations | `buyer2@example.com` | `Password123!` |
| **Supplier** | Global Furniture Solutions | `supplier@example.com` | `Password123!` |
| **Supplier** | TechSource Electronics | `supplier2@example.com` | `Password123!` |

*(Both login pages have one-click "Quick Fill" demo buttons for convenience).*

---

## Testing

### Automated API Test Suite
A comprehensive 19-step test suite verifies all positive and negative security/business flows:
```bash
cd server
npm run test:api
```

**Tested Scenarios**:
1. Health check (`/api/health`)
2. Buyer registration & JWT issuance
3. Supplier registration & JWT issuance
4. Duplicate email rejection (409 Conflict)
5. Invalid password / credentials (401 Unauthorized)
6. Valid login authentication
7. `/api/auth/me` profile verification
8. Supplier attempting to create RFQ (RBAC 403 Forbidden)
9. Past deadline validation rejection (400 Bad Request)
10. Buyer creating valid RFQ (201 Created)
11. Buyer viewing own RFQs with quotation counts
12. Supplier browsing & searching RFQs
13. Buyer attempting to submit quotation (RBAC 403 Forbidden)
14. Supplier submitting valid quotation (201 Created)
15. Duplicate quotation submission rejection (409 Conflict)
16. Supplier viewing own submitted quotations
17. Buyer viewing received quotations for own RFQ
18. Buyer updating own RFQ specs
19. Buyer deleting own RFQ

---

## Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import repository into [Vercel](https://vercel.com).
3. Set **Root Directory** to `client`.
4. Configure Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
5. Deploy. `vercel.json` ensures all client-side routes route through `index.html`.

### Backend (Render / Railway)
1. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
2. Set **Root Directory** to `server`.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `mysql://<user>:<password>@<host>:<port>/<dbname>` (from Railway MySQL, PlanetScale, Aiven, or AWS RDS)
   - `JWT_SECRET`: `<secure-random-secret>`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
6. Run database migrations: `npx prisma db push` or `npx prisma migrate deploy`.

---

## Assumptions

1. **Currency**: All commercial quotations and monetary values are denominated in Indian Rupees (₹ INR).
2. **Quotation Pricing Model**: The quoted price represents the total price for the entire requested quantity specified in the RFQ.
3. **Quotation Updates**: In this version, suppliers submit one firm quotation per RFQ. If a supplier needs to adjust terms, the RFQ owner and supplier coordinate directly based on contact details provided.
4. **Timezones**: RFQ deadlines and submission timestamps are stored in UTC in the database and formatted into local date-time strings on the client.

---

## Limitations

1. **Direct In-App Messaging**: Real-time WebSocket chat is intentionally excluded per assignment scope; buyer and supplier contact emails are provided for offline coordination.
2. **Payment Processing**: Payment gateways (Stripe/Razorpay) and escrow systems are omitted to keep the application focused on the core RFQ and Quotation workflow.
3. **File Attachments**: Spec sheets and blueprints are accepted via text descriptions rather than cloud object storage (S3).
