# FIRNEXA - Police FIR Management System

**FIRNEXA** is a centralized, production-grade digital platform for citizen complaint registration, statutory FIR docketing, investigating officer assignments, case diary tracking, evidence custody logging, and official report generation.

---

## 1. System Architecture & UML Overview

The system implements the complete architecture defined in the UML project specification:

- **Frontend Tier**: React 19 + TypeScript + Tailwind CSS with high-density data tables, visual case status progression timeline, role-based dashboards, and official printable FIR dockets (Cr.P.C. Section 154 / BNSS Section 173).
- **Backend Tier**: Java 17 + Spring Boot 3 with layered enterprise architecture:
  - `controller/`: REST API Controllers with Spring Security method-level annotations (`@PreAuthorize`)
  - `service/`: Transactional business logic handling state transitions and notifications
  - `repository/`: Spring Data JPA interfaces with derived query methods
  - `entity/`: JPA entities representing Users, PoliceOfficers, Complaints, FIRs, Investigations, Evidence, and StatusHistory
  - `security/`: Stateless JWT Authentication filter, BCrypt password encoder, and role-based access control
- **Database Tier**: MySQL 8.0+ relational schema (`database/schema.sql`) with foreign key constraints, indexes, and seeded demonstration records (`database/seed.sql`).

---

## 2. Default Test Accounts (Demo Credentials)

| Role | Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **User / Citizen** | Harshitha Sharma | `citizen@example.com` | `citizen123` | Submit complaints, track case timeline, view personal FIRs, update citizen profile |
| **Admin / Police** | Inspector Rajesh Kumar | `police@example.com` | `police123` | Verify complaints, register FIRs, update investigation diary, log evidence, manage status |
| **System Admin** | Comm. Vikram Rathore | `admin@example.com` | `admin123` | All police privileges + manage police roster, system analytics, export all reports |

> **Note on Registration**: Both Citizens and Law Enforcement Staff (Police Officers & Station Administrators) can register new accounts directly from the login portal. Officer registration uses departmental passkey `POLICE2026` or `ADMIN2026`, auto-creates a service badge entry, and links the officer into the active precinct roster.

---

## 3. Core Operational Workflow

```
Citizen Registration / Login
         ↓
Submit Complaint (with Incident Details, Witnesses & Documents)
         ↓
Unique Complaint ID Generated (e.g. CMP-2026-0814)
         ↓
Police / Admin Review & Verification
         ↓
Approved & Converted to First Information Report (FIR)
         ↓
Unique FIR Number Generated (e.g. FIR-2026-0042)
         ↓
Investigating Officer (I.O.) Assigned
         ↓
Investigation Initiated & Case Diary Notes Recorded
         ↓
Forensic / Digital / Physical Evidence Logged with Chain of Custody
         ↓
Case Status Milestone Progression (Under Review / Rework / Case Closed)
         ↓
Instant Notification Dispatched to Complainant
         ↓
Citizen Tracks Visual Status Timeline in Real Time
```

---

## 4. Project Directory Structure

```
Police-FIR-Management-System/
├── backend/
│   ├── pom.xml                                   # Maven build configuration
│   └── src/main/
│       ├── java/com/policefir/
│       │   ├── PoliceFirApplication.java         # Spring Boot entry point
│       │   ├── controller/                       # REST API controllers
│       │   ├── service/                          # Business services
│       │   ├── repository/                       # Spring Data JPA repositories
│       │   ├── entity/                           # JPA Hibernate entities
│       │   ├── dto/                              # Request & Response DTOs
│       │   └── security/                         # JWT Filter & SecurityConfig
│       └── resources/
│           └── application.properties            # MySQL & JWT configurations
├── database/
│   ├── schema.sql                                # Production MySQL 8.0 DDL
│   └── seed.sql                                  # Seed data for immediate demonstration
├── src/
│   ├── components/
│   │   ├── AuthScreen.tsx                        # Role-based login and citizen registration
│   │   ├── Header.tsx                            # Government header with role switcher
│   │   ├── StatusTimeline.tsx                    # Visual case status progress tracker
│   │   ├── FirPrintModal.tsx                     # Official printable FIR document docket
│   │   ├── NotificationDropdown.tsx              # Real-time in-app alert center
│   │   ├── JavaArchitectureModal.tsx             # Interactive Java & UML code explorer
│   │   ├── citizen/
│   │   │   └── CitizenDashboard.tsx              # Complete citizen management portal
│   │   └── police/
│   │       └── PoliceDashboard.tsx               # Police and Admin operations center
│   ├── context/
│   │   └── AppContext.tsx                        # Local state persistence & live workflows
│   ├── data/
│   │   └── initialData.ts                        # Seed complaints, FIRs, evidence & officers
│   ├── types.ts                                  # Complete TypeScript domain contracts
│   ├── App.tsx                                   # Root application entry
│   └── main.tsx                                  # React DOM mounting
└── README.md                                     # System documentation
```

---

## 5. Quick Start Instructions

### Running the Live Interactive Web Application
The interactive application is running on port 3000 via Vite:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. The initial screen presents the **Login Page** with **[ Admin / Police ]** and **[ User / Citizen ]** options, 1-click test fill buttons, and an interactive **"Java Backend & UML"** inspector modal.

### Running the Java Spring Boot Backend (Optional)
To execute the Java Spring Boot backend on port 8080:
1. Ensure MySQL is running on port 3306 and execute `database/schema.sql` and `database/seed.sql`.
2. Navigate to `/backend` and compile with Maven:
```bash
cd backend
mvn clean spring-boot:run
```
3. Access Swagger UI at `http://localhost:8080/swagger-ui.html`.
