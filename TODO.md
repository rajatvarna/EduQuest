# EduQuest MVP - Development Plan

This document outlines the development plan for the EduQuest MVP, based on the "Sprint Zero" concept detailed in the strategic blueprint. The goal is to rapidly establish a functional foundation for the application.

---

## Phase 1: Project & Backend Foundation (Equivalent to PDF Days 1-5)

This phase focuses on setting up the project structure, backend services, and deployment pipelines.

### Project Setup & Infrastructure as Code (IaC)
- [x] **Set up modular Frontend project structure:** The React/TypeScript project is organized into components, services, and types.
- [ ] **Initialize Git repository:** Use the GitFlow branching model (`main`, `develop`, `feature/*`, etc.).
- [ ] **Set up modular Node.js project structure:** Organize backend code by domain (`@users`, `@learning`, `@gamification`) as per Section 2.3 of the PDF.
- [ ] **Provision initial AWS infrastructure:** Use an IaC tool like AWS CDK or Terraform to define VPC, RDS for PostgreSQL, and ElastiCache for Redis.

### CI/CD Pipeline Automation
- [ ] **Configure CI/CD pipeline:** Use GitHub Actions or AWS CodePipeline.
- [ ] **Automate workflow:** The pipeline should automatically install dependencies, run linting checks, execute unit tests, and build the application on every push to `develop`.
- [ ] **Set up deployment:** Deploy the built application to a staging environment on AWS Elastic Beanstalk.

### Core Models & API Scaffolding
- [x] **Define core data models on the frontend:** `types.ts` includes `UserStats`, `Lesson`, `Question`, and `Course`.
- [ ] **Define backend database schemas:** Use an ORM like Prisma or TypeORM to create schemas for users, courses, subscriptions, and user progress.
- [ ] **Implement initial API endpoints:**
    - `POST /api/users` (User Registration)
    - `POST /api/auth/login` (User Login)
- [ ] **Implement JWT-based authentication:** Create backend middleware to generate and verify JSON Web Tokens.

---

## Phase 2: Frontend Implementation & Connection (Equivalent to PDF Days 6-7)

This phase focuses on building the user-facing application and connecting it to the backend.

### Frontend Setup & Core UI
- [x] **Initialize React project with TypeScript:** The project is set up and running.
- [x] **Implement core gamification UI:** The `Header` component displays points, streak, and hearts.
- [x] **Implement learning content UI:** The `Dashboard` shows the course path, and the `Lesson` component provides the interactive quiz experience.
- [x] **Implement freemium model UI:** The `SubscriptionModal` provides an upsell when a user runs out of hearts.

### Authentication Flow
- [x] **Create Login/Signup screen:** The `Auth.tsx` component handles user registration and login forms.
- [x] **Implement Social Login UI:** The `Auth.tsx` component includes UI for Google, Facebook, and GitHub sign-in.
- [x] **Implement "Forgot Password" UI flow:** The `Auth.tsx` component includes a full UI flow for password reset.
- [ ] **Connect to backend API:**
    - Implement logic to call the `login` and `register` endpoints.
    - Securely store the received JWT on the client.
    - Implement a call to a protected endpoint (e.g., `/api/me`) to verify the end-to-end authentication flow.

---

## Phase 3: Future MVP Enhancements (Post-Sprint Zero)

These tasks are priorities for evolving the application after the initial foundation is built.

- [ ] **Gamification Logic:**
    - Implement backend logic for daily streak tracking (e.g., daily cron job).
    - Implement backend logic for heart replenishment over time.
    - Add more dynamic UI feedback for earning points and streak increases.
- [ ] **User Profile:**
    - Create a dedicated User Profile page.
    - Allow users to view stats, change their display name, and update their avatar.
- [ ] **Content Management:**
    - Implement a backend system for creating and managing courses, lessons, and questions.
    - Expand lesson types to include 'READING' and 'VIDEO' content.
- [ ] **User Progress:**
    - Implement the `user_progress` data model from the PDF (using JSONB) to track progress.
    - Visually indicate completed lessons on the `Dashboard`.
- [ ] **Payment Integration:**
    - Integrate with a payment provider like Stripe (for web) or RevenueCat (for mobile) to handle subscriptions.
- [ ] **Deployment:**
    - Set up a production-ready environment on AWS.
    - Deploy the complete MVP.
