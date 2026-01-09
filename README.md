# Propflow (Core Application Hub)

**High-Efficiency Property Management Automation on Google Cloud**

Propflow is a next-generation property management platform built natively on the Google Cloud Ecosystem. It leverages AI and automation to drastically reduce administrative time for property managers, tenants, and owners.

This repository (`propflow-app`) serves as the **Core Application Hub**, containing the user interface (Next.js) and Firebase Cloud Functions. Shared operational workflows and infrastructure configurations reside in the `propflow-shared-ops` repository.

## 🚀 Tech Stack (Google-Native)

We have pivoted to a fully Google-native architecture to ensure scalability, security, and seamless integration.

-   **Frontend**: [Next.js 15](https://nextjs.org/) (React 19)
-   **Core Backend & Database**:
    -   [Firebase Authentication](https://firebase.google.com/docs/auth) (Identity Platform)
    -   [Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL Database)
    -   [Cloud Functions for Firebase](https://firebase.google.com/docs/functions) (Serverless Backend)
-   **AI & Logic**:
    -   [Google Vertex AI](https://cloud.google.com/vertex-ai) running **Gemma** models.
-   **Hosting & CI/CD**:
    -   [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) (Next.js Native/Containerized)
    -   [Firebase Hosting](https://firebase.google.com/docs/hosting) (Static Assets)

## 📂 Project Structure

```bash
propflow-app/
├── app/                  # Next.js App Router (Pages & Layouts)
├── components/           # Reusable UI Components
├── lib/                  # Application Logic
│   ├── ai/               # Vertex AI & Gemma Integration
│   ├── auth/             # Firebase Auth Wrappers
│   ├── gcp/              # Direct Google Cloud Platform Clients
│   ├── firebase-client.ts # Client-side Firebase Initialization
│   └── ...
├── public/               # Static Assets
├── scripts/              # Utility Scripts
├── firestore.rules       # Security Rules for Firestore
└── firebase.json         # Firebase Configuration
```

## 🛠️ Getting Started

### Prerequisites

-   **Node.js**: v18+ recommended
-   **Firebase CLI**: Install globally via `npm install -g firebase-tools`
-   **Google Cloud Project**: You need access to the Propflow GCP project.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/propflow-app.git
    cd propflow-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase & Google Cloud Authentication:**
    Propflow uses OIDC-based flows and local Application Default Credentials (ADC) for development.

    ```bash
    # Login to Firebase CLI
    firebase login

    # Initialize / Configure Project (if needed)
    firebase init hosting:github
    ```

4.  **Environment Configuration:**
    Ensure you have the necessary `.env.local` variables for client-side Firebase keys.
    *(See `.env.example` for the required keys)*

    ```bash
    cp .env.example .env.local
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 📦 Deployment

Deployment is handled via Firebase App Hosting or Firebase Hosting, typically triggered by merging into `main`.

To deploy manually (if you have permissions):

```bash
firebase deploy
```

## 🤝 Contribution Guidelines

1.  **Feature Branches**: Create a branch for your feature (`feat/my-feature`).
2.  **Google-Native Context**: Ensure new features utilize Firebase or GCP native services where possible.
3.  **Lint & Test**: Run `npm run lint` before committing.

---

*Propflow - streamlining property management with the power of Google Cloud.*
