#!/bin/bash
set -e

# Configuration
# Use existing env var or fallback to gcloud config, then default
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
PROJECT_ID="${PROJECT_ID:-propflow-ai-483621}"
REGION="${GOOGLE_CLOUD_REGION:-us-east5}"
# DB_INSTANCE_NAME="propflow-db-east" (Removed)
# DB_NAME="propflow_db" (Removed)
# DB_USER="propflow_user" (Removed)

echo "Using Project ID: $PROJECT_ID"
echo "Using Region: $REGION"

# 1. Enable Required APIs
echo "Enabling APIs..."
gcloud services enable \
    aiplatform.googleapis.com \
    sqladmin.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    documentai.googleapis.com \
    --project $PROJECT_ID

# 2. Setup Artifact Registry
echo "Setting up Artifact Registry..."
gcloud artifacts repositories create cloud-run-source-deploy \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Cloud Run" \
    --project=$PROJECT_ID || echo "Repository likely already exists"

# 3. Create Cloud SQL Instance (PostgreSQL)
# (Skipped: Project uses Firebase & Vertex AI)

# 4. Create Database and User
# (Skipped: Project uses Firebase & Vertex AI)

# 5. Configure Secrets
echo "Configuring Secrets..."
# Note: DATABASE_URL is not needed for Firebase.
# If other secrets are needed, add them here.

# Grant Access to Default Compute Service Account (used by Cloud Run)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

echo "---------------------------------------------------"
echo "INFRASTRUCTURE SETUP COMPLETE"
echo "---------------------------------------------------"
echo "Project configured for Cloud Run and Vertex AI."
echo "---------------------------------------------------"
