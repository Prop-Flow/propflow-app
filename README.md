# Propflow (Core Application Hub)

**High-Efficiency Property Management Automation on Google Cloud**

Propflow is a next-generation property management platform built natively on the Google Cloud Ecosystem. It leverages AI and automation to drastically reduce administrative time for property managers, tenants, and owners.

This repository (`propflow-app`) serves as the **Core Application Hub**, containing the user interface (Next.js) and Firebase Cloud Functions.

---

## 🚨 Critical Infrastructure Changes

We have recently migrated our infrastructure to optimize for performance and scalability using Cloud Run and Vertex AI.

### 1. Regional Migration to `us-east4`
*   **Previous**: `us-east5`
*   **New**: `us-east4` (Northern Virginia)
*   **Reason**: To co-locate with **Google Vertex AI (Gemma models)** and low-latency networking services which are optimized in `us-east4`. This reduces inference latency for our AI features.

### 2. New Deployment Architecture
We have moved from a simple Firebase deploy to a robust **Cloud Build** pipeline:
1.  **Docker Build**: The Next.js app is containerized using a multi-stage `Dockerfile`.
2.  **Artifact Registry**: Images are pushed to Google Artifact Registry in `us-east4`.
3.  **Terraform**: Managing infrastructure as code (Firestore rules, permissioning).
4.  **Cloud Run**: The container is deployed to Cloud Run (fully managed), offering better concurrency and cold-start performance than standard Cloud Functions.

### 3. Terraform State Management
*   **Backend**: Google Cloud Storage (GCS)
*   **Benefit**: Prevents deployment conflicts by locking the state file during updates, ensuring that multiple developers (or CI/CD pipelines) don't overwrite each other's infrastructure changes.

---

## 🛠️ Complete Tech Stack

We utilize a modern, fully typed stack designed for reliability.

### Frontend & Core
*   **Framework**: [Next.js 15.1](https://nextjs.org/) (App Router)
*   **Language**: TypeScript 5.x
*   **Styling**: Tailwind CSS + Shadcn UI (Lucide React icons)
*   **State Management**: React Query (TanStack Query)

### Cloud Services (Google Cloud Platform)
*   **Compute**: Cloud Run (Serverless Containers)
*   **Database**: Google Cloud Firestore (NoSQL)
*   **Auth**: Firebase Authentication (Identity Platform)
*   **AI**: Google Vertex AI (Gemma 2 models via `propflow-ai-core`)
*   **Automation**: N8N (Workflow automation)

### Infrastructure & DevOps
*   **IaC**: Terraform
*   **CI/CD**: Google Cloud Build
*   **Containerization**: Docker

---

## 🚀 Local Development Setup

Follow these steps to get your environment ready.

### 1. Required CLI Tools
Install these tools globally on your machine:

*   **Google Cloud SDK (`gcloud`)**: [Install Guide](https://cloud.google.com/sdk/docs/install)
*   **Terraform**: [Install Guide](https://developer.hashicorp.com/terraform/install)
*   **Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```

### 2. Environment Configuration
Create a `.env.local` file in the root of `propflow-app`. Use `.env.example` as a template.

```bash
cp .env.example .env.local
```

**Key Variables Explained:**
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_GCP_PROJECT_ID` | Your GCP Project ID (e.g., `propflow-ai-483621`). |
| `GCP_REGION` | Infrastructure region (`us-east4`). |
| `VERTEX_AI_ENDPOINT_ID` | ID for the deployed Gemma model endpoint. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client-side API key for Firebase Auth/Firestore. |
| `VERTEX_AI_API_KEY` | **Critical**: API key for accessing Vertex AI services. |

### 3. Authentication
Propflow relies on **Application Default Credentials (ADC)** for server-side Google Cloud access (like calling Vertex AI).

**Run this command to authenticate locally:**
```bash
gcloud auth application-default login
```
*This places a credential JSON file in your local system that the Google Cloud libraries automatically detect.*

---

## 💻 Running & Testing

### Start the Development Server
```bash
npm run dev
```
Access the app at `http://localhost:3000`.

### Build Verification
To ensure your code compiles and builds correctly (simulating the CI environment):
```bash
npm run build
```

### Dev Mode Login Bypass
*   The development environment may have a "Dev Login" button or bypass enabled for rapid testing.
*   Check `lib/auth/` or the Login component for "mock" providers if you are having trouble with real Firebase Auth locally.

### Key Features to Test
*   **Dashboard**: Verify property data loads from Firestore.
*   **AI Assistant**: Test the chat interface to ensure it connects to Vertex AI (check browser console for 404/403 errors).
*   **Auth**: Log in and log out to verify session management.

---

## 🏗️ Deployment Workflow

### Automated Deployment (Recommended)
Simply push your changes to the `main` branch.
```bash
git push origin main
```
*   **Trigger**: Cloud Build automatically detects the commit.
*   **Process**: Builds Docker image -> Pushes to Artifact Registry -> Applies Terraform -> Deploys to Cloud Run.

### Manual Deployment
If you need to deploy manually from your local machine (requires permissions):

```bash
gcloud builds submit --config cloudbuild.yaml .
```

### Monitoring
*   **Cloud Build Console**: Check build logs and status.
*   **Cloud Run Console**: View live service logs and metrics.

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Vertex AI 404 or 403 Errors
*   **Symptom**: AI features fail, console shows 404 Not Found or 403 Forbidden.
*   **Fix**:
    1.  Ensure you ran `gcloud auth application-default login`.
    2.  Check your `.env.local` for the correct `VERTEX_AI_ENDPOINT_ID` and `VERTEX_AI_REGION`.
    3.  Verify your IAM user has "Vertex AI User" role.

#### 2. Docker Build "Context Too Large"
*   **Symptom**: Build uploads gigabytes of data and takes forever.
*   **Fix**: Check `.gcloudignore` and `.dockerignore`. Ensure `node_modules` and `.next` are **excluded**.

#### 3. Terraform State Locks
*   **Symptom**: `Error acquiring the state lock`.
*   **Cause**: Another deployment is running or failed mid-way.
*   **Fix**: Wait for the other build to finish. If stuck, you may need to manually unlock via Terraform CLI (use with caution).

#### 4. Firebase Hosting 403 / Permission Denied
*   **Symptom**: "User does not have permission to access this project".
*   **Fix**: Run `firebase login` and ensure you are selected the correct project with `firebase use propflow-ai-483621`.

---

*Propflow Engineering Team*
