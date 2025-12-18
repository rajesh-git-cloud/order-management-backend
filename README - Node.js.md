# Order Management Backend

Node.js backend with **Express**, **Prisma**, and **PostgreSQL** for managing orders.  
Optional **Redis** support for caching.

---

## 🚀 Installation
1. **Clone the repository:

git clone <backend-repo-url>
cd order-management-backend

2. **Install dependencies:
npm install

3. **PostgreSQL database setup:
	Make sure PostgreSQL is running
	Create a database for the project

4. **Create a .env file in the root:
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
REDIS_URL="redis://localhost:6379"    # optional
REDIS_DISABLE=true                    # set true if Redis is not required
JWT_SECRET="your_jwt_secret_here"

5. **Prisma setup:
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
npx prisma migrate dev --name add_user_model

6. **(Optional) Seed sample data:
npm run prisma db seed
node prisma/seedUser.ts

- Seeds users with hashed passwords
- Seeds orders with random orderNo, customerName, status, and amount

7. **Start the development server:
npm run dev


** Authentication & Authorization

Users authenticate via /auth/login with username and password
JWT token returned on successful login
Protected routes require valid JWT in Authorization header:

Authorization: Bearer <token>

Expired or invalid tokens return 401 Unauthorized
Middleware handles authentication and authorization for orders endpoints

** Filters, Search, Sorting, and Pagination

All filters/search/sort happen server-side via query parameters:
Global Search
Matches orderNo and customerName
Example: GET /orders?search=John

Status Filter
Multi-select for statuses (e.g. PENDING, COMPLETED)
Example: GET /orders?status[]=PENDING&status[]=COMPLETED

Customer Filter
Text input for exact or partial matches
Example: GET /orders?customerName=Acme

Sorting
Clickable column headers (or API param) toggle asc/desc
Example: GET /orders?sortBy=createdAt&sortDirection=desc

Pagination
Query params: page and pageSize
Example: GET /orders?page=2&pageSize=20

** Order Fields:

id – Auto-increment primary key
orderNo – Unique order number
customerName – Name of the customer
status – Order status (e.g. PENDING, COMPLETED)
amount – Total order amount
createdAt – Date/time order was created
updatedAt – Date/time order was last updated
AuditLog Table:
Logs create/update/delete actions for orders
Fields: orderId, action, actor, before, after, createdAt

** AuditLog Table:
- Logs all create/update/delete actions on orders
- Fields: id, orderId, action (CREATE/UPDATE/DELETE), actor, before, after, createdAt

** How to Run Locally 

- Start PostgreSQL and create the database
- Set .env variables
- Run migrations and generate Prisma client
- Seed sample data (optional)
- Run backend server: ** npm run dev **






NOde.js RUN - nom start

Prisma:
	- npx prisma init
	- npx prisma migrate dev

Run Migration: 
npx prisma migrate dev --name init
