# Propflow Developer Setup Guide

This guide outlines the tech stack, dependencies, and local environment configuration required to run the Propflow application efficiently.

## 🛠️ Tech Stack

### Core

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Glassmorphism utilities.
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Services

- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v5 beta / Auth.js)
- **Database**: Google Firebase (Firestore)
- **AI Integration**: [Google Vertex AI](https://cloud.google.com/vertex-ai) (Model: **Gemma**)
- **Visualization**: [Recharts](https://recharts.org/) (for Dashboard charts)

---

## 🚀 Prerequisites & Installation

### 1. System Requirements

- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version

### 2. Google Cloud SDK (Critical for AI Features)

To make the AI features (e.g., Gemma Insight Card, AI Composer) work locally, you must authenticate with Google Cloud using Application Default Credentials (ADC).

1. **Download & Install**: [Google Cloud CLI Documentation](https://cloud.google.com/sdk/docs/install)
2. **Initialize**:

    ```bash
    gcloud init
    ```

    *Select the project: `propflow-ai-483621` or your active GCP project.*

3. **Authenticate Application Default Credentials**:
    **This step is required** for the local Next.js server to talk to Vertex AI.

    ```bash
    gcloud auth application-default login
    ```

    *This will open a browser window. Sign in with your authorized Google account.*

### 3. Repository Setup

1. **Clone the repository**:

    ```bash
    git clone https://github.com/Prop-Flow/Propflow.git
    cd Propflow
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

3. **Environment Variables**:
    Create a `.env` file in the root directory. You will need the following keys (ask admin for values):

    ```env
    NEXT_PUBLIC_GCP_PROJECT_ID=propflow-ai-483621
    VERTEX_AI_ENDPOINT_ID=...
    VERTEX_AI_PREDICTION_REGION=us-east4
    VERTEX_AI_PREDICTION_HOST=us-east4-aiplatform.googleapis.com
    AUTH_SECRET=...
    ```

---

## 💻 Running Locally

Start the development server:

```bash
npm run dev
```

Access the application at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Key Features to Test

- **Dashboard**: Check the "Financial Performance" chart and "Gemma Insights" card.
- **Communications**: Try the AI Message Composer.
- **Dev Mode**: Use the "Dev Mode" bypass on the login page with key `debug-shark-9000` for quick access during testing.
