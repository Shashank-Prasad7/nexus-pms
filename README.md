# Nexus PMS — Full Stack Project Management System (Web + Mobile)

A production-grade, cross-platform Project and Task Management System designed for modern product teams. A single unified backend serves both the responsive web frontend and the native mobile app, allowing users to register once and manage their projects and tasks seamlessly across all devices with real-time updates and secure token storage.

<img width="1983" height="793" alt="image" src="https://github.com/user-attachments/assets/db640c84-2eee-435e-8349-70f8b8b3b7be" />  

## Demo : https://youtu.be/Z7ug5FsuElg  

---

## 🏗️ Architecture Overview

```
                                  ┌───────────────────────────────┐
                                  │      Client Applications      │
                                  └───────────────┬───────────────┘
                                                  │
                         ┌────────────────────────┴────────────────────────┐
                         ▼                                                 ▼
             ┌───────────────────────┐                         ┌───────────────────────┐
             │   Web Client (React)  │                         │ Mobile Client (Expo)  │
             │   • Vite + TypeScript │                         │ • React Native        │
             │   • Responsive Glass  │                         │ • Android & iOS       │
             │   • Dashboard / CRUD  │                         │ • Secure Store (KS/KC)│
             └───────────┬───────────┘                         └───────────┬───────────┘
                         │                                                 │
                         └────────────────────────┬────────────────────────┘
                                                  │ REST API (JSON / JWT)
                                                  ▼
                                     ┌─────────────────────────┐
                                     │  Unified Node.js Backend│
                                     │  • Express + TypeScript │
                                     │  • Zod Input Validation │
                                     │  • Helmet & CORS        │
                                     │  • IP Rate Limiting     │
                                     │  • Bcrypt / JWT Auth    │
                                     └────────────┬────────────┘
                                                  │ Prisma ORM
                                                  ▼
                                     ┌─────────────────────────┐
                                     │   PostgreSQL Database   │
                                     │  • Normalized Relational│
                                     │  • Foreign Keys / Index │
                                     │  • Cascade Deletions    │
                                     └─────────────────────────┘
```

---

## 🗄️ Database Schema & ER Diagram

```mermaid
erDiagram
    User ||--o{ Project : owns
    User ||--o{ Task : owns
    Project ||--o{ Task : contains

    User {
        String id PK "UUID"
        String name "Full Name"
        String email UK "Unique Email Address"
        String password "Bcrypt Hashed"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
    }

    Project {
        String id PK "UUID"
        String name "Project Name"
        String description "Project Details"
        Enum status "NOT_STARTED | IN_PROGRESS | COMPLETED"
        DateTime startDate "Nullable"
        DateTime endDate "Nullable"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
        String userId FK "Owner Reference"
    }

    Task {
        String id PK "UUID"
        String name "Task Deliverable Name"
        String description "Task Details"
        Enum priority "LOW | MEDIUM | HIGH"
        Enum status "PENDING | IN_PROGRESS | COMPLETED"
        DateTime dueDate "Nullable"
        DateTime createdAt "Timestamp"
        DateTime updatedAt "Timestamp"
        String projectId FK "Parent Project Reference"
        String userId FK "Owner Reference"
    }
```

### Relational Design Highlights
- **Strict User Ownership**: Both `projects` and `tasks` maintain foreign keys to `users(id)`, preventing unauthorized cross-user modifications.
- **Referential Integrity**: Cascading deletes ensure deleting a project safely removes child tasks.
- **Indexing**: High-cardinality foreign keys (`userId`, `projectId`) and query filters (`status`, `priority`) are indexed for sub-millisecond retrieval.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- **PostgreSQL**: Local instance, Docker container, or Cloud provider (Neon / Supabase / Render)

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL connection URL:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pms_db?schema=public"
   JWT_SECRET="your_secure_jwt_secret_key"
   JWT_EXPIRES_IN="7d"
   CORS_ORIGIN="*"
   ```

4. **Initialize Database & Generate Client**:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

5. **Seed Demo Test Data**:
   Populates sample users (`demo@example.com` / `Password123!`), projects, and prioritized tasks:
   ```bash
   npm run prisma:seed
   ```

6. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   Server will run at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

7. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

---

### 2. Web Frontend Setup

1. **Navigate to the web directory**:
   ```bash
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   ```

---

### 3. Mobile App Setup (React Native / Expo)

1. **Navigate to the mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Backend URL for Mobile**:
   By default:
   - **Android Emulator**: Uses `http://10.0.2.2:5000/api` (automatically routes to host machine).
   - **iOS Simulator / Web**: Uses `http://localhost:5000/api`.
   - **Physical Device**: Tap **"⚙️ Backend URL"** on the login screen to enter your computer's local Wi-Fi IP (e.g. `http://192.168.1.50:5000/api`) or your deployed production backend URL!

4. **Launch Expo**:
   ```bash
   npx expo start
   ```
   - Press `a` to run on connected Android emulator / device.
   - Press `i` to run on iOS simulator.
   - Press `w` to run directly in web browser.

---

### 4. Docker Setup (Optional)

Start PostgreSQL database and backend API with a single command:
```bash
docker-compose up --build
```

---

## 📡 API Reference Documentation

All endpoints (except login & registration) require the `Authorization: Bearer <token>` header.

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | No (Rate-limited) |
| `POST` | `/api/auth/logout` | Invalidate client session | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### Projects
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/projects` | List projects (query: `search`, `status`, `sortBy`) | Yes |
| `GET` | `/api/projects/:id`| Retrieve project details and nested tasks | Yes |
| `POST` | `/api/projects` | Create a new project | Yes |
| `PUT` | `/api/projects/:id`| Update project details or status | Yes |
| `DELETE`| `/api/projects/:id`| Delete project and cascade tasks | Yes |

### Tasks
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | List tasks (query: `projectId`, `search`, `status`, `priority`) | Yes |
| `GET` | `/api/tasks/:id` | Retrieve single task | Yes |
| `POST` | `/api/tasks` | Create task under a project | Yes |
| `PUT` | `/api/tasks/:id` | Update task details / status / priority | Yes |
| `DELETE`| `/api/tasks/:id` | Delete task | Yes |

### Dashboard
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard` | Aggregated user metrics, active projects, upcoming deadlines | Yes |

---

## 🔒 Security Implementations

1. **Password Hashing**: Bcrypt with 10 salt rounds ensures plain passwords are never stored or logged.
2. **Authorization & Data Isolation**: All database queries strictly scope to `userId: req.user.id`. Users cannot view or modify others' data.
3. **Secure Mobile Token Storage**: Tokens are saved via `expo-secure-store` using Android Keystore and iOS Keychain rather than unencrypted storage.
4. **Rate Limiting**: Brute-force protection on authentication routes limits attempts to 20 per 15-minute window.
5. **SQL Injection Protection**: Prisma ORM executes parameterized queries for 100% protection against injection vectors.
6. **Input Validation**: Strict Zod schemas sanitize all incoming payloads with descriptive error responses.
7. **Security Headers & CORS**: Configured with `helmet` and custom CORS policies.

---

## 🧪 Testing

Run backend unit and integration tests:
```bash
cd backend
npm test
```
All route handlers, authentication barriers, and validation schemas are verified via automated Jest tests.
