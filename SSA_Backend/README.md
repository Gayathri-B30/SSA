# Architect ERP Backend

This is a [Next.js](https://nextjs.org) project bootstrapped with `create-next-app` that serves as the backend architecture for the Architect ERP system.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Architecture**: Modular Monolith organized by domain/feature namespaces under `src/modules` and a shared kernel under `src/shared`.

## Getting Started

1. **Environment Setup**
   Copy the example environment variables file and fill in your local Postgres database details:
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   Start the local dev server using:
   ```bash
   npm start
   # or
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The API routes are exposed under `http://localhost:3000/api/...`.

## Architecture Overview
This project strictly enforces separation of concerns by partitioning code into self-contained domain modules and a shared kernel:

* **`src/shared/`**: Shared Core Kernel (contains TypeORM Database connection pool setup `data-source.ts` and global configuration settings `env.config.ts`).
* **`src/modules/`**: Domain/business feature namespaces.
  * **`src/modules/auth/`**: Complete Authentication & Authorization module.
  * **`src/modules/test/`**: Development test module.
  
Each module is self-contained with its own internal sub-layers:
* `models/`: TypeORM database schema definitions.
* `repositories/`: Database query and data access rules.
* `services/`: Business logic validation, encryption, and token operations.
* `controllers/`: HTTP parsing and REST action dispatching.
* `middlewares/`: Middleware pipeline hooks.
* `enums/`: Constant collections.
* `index.ts`: The module's public entrypoint/facade API exports.

---

## Available APIs

### Auth Endpoints
- **POST** `/api/auth/login` - Authenticates credentials and returns a user profile and signed JWT token.
- **POST** `/api/auth/register` - Registers a new user with secure password hashing.
- **GET** `/api/auth/me` - Returns the logged-in user profile details (protected route, requires `Bearer <token>` authorization).

### Test Endpoint
- **GET** `/api/test` - Demonstration route illustrating modular execution routing flow.
