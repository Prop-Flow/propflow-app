# Google Cloud Setup Guide for Propflow

This document provides instructions on how to connect your local development environment to the **PropFlow AI** (`propflow-ai-483621`) Google Cloud project.

## Prerequisites

1.  **Google Cloud CLI (`gcloud`):**
    If you haven't installed it, follow the instructions here: [Install the Google Cloud CLI](https://cloud.google.com/sdk/docs/install).

2.  **Access to the Project:**
    Ensure you have been added to the `propflow-ai-483621` project in the [Google Cloud Console](https://console.cloud.google.com/).

## Local Authentication Setup

### 1. Login to gcloud
Run the following command in your terminal:
```bash
gcloud auth login
```

### 2. Set the Project
Set the active project to PropFlow AI:
```bash
gcloud config set project propflow-ai-483621
```

### 3. Service Account Key (Recommended for AI Integration)
For local development that requires Vertex AI or Firebase Admin SDK access:
1.  Go to **IAM & Admin > Service Accounts** in the GCP Console.
2.  Find the `firebase-adminsdk` or create a new one with "Vertex AI User" and "Firebase Admin" roles.
3.  Go to the **Keys** tab and click **Add Key > Create new key**.
4.  Select **JSON** and download the file.
5.  Move this file to your project root as `gcp-key.json` (This file is ignored by `.gitignore` by default if you use standard templates, but double-check!).

## Environment Variables

Update your `.env` file with the following:

```env
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json
NEXT_PUBLIC_GCP_PROJECT_ID=propflow-ai-483621
```

## Verifying the Connection

You can verify your access by running:
```bash
gcloud projects describe propflow-ai-483621
```

If successful, you will see the project details in your terminal.
