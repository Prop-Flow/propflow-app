#!/bin/bash
set -e

# Configuration
PROJECT_ID="propflow-ai-483621"
REGION="us-east5"
DB_INSTANCE_NAME="propflow-db-east"
DB_NAME="propflow_db"
DB_USER="propflow_user"

echo "Using Project ID: $PROJECT_ID"

# 1. Enable Required APIs
echo "Enabling APIs..."
gcloud services enable \
    aiplatform.googleapis.com \
    sqladmin.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    --project $PROJECT_ID

# 2. Setup Artifact Registry
echo "Setting up Artifact Registry..."
gcloud artifacts repositories create cloud-run-source-deploy \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Cloud Run" \
    --project=$PROJECT_ID || echo "Repository likely already exists"

# 3. Create Cloud SQL Instance (PostgreSQL)
echo "Creating Cloud SQL Instance (This may take 10-15 minutes)..."
gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --cpu=1 \
    --memory=3840MiB \
    --region=$REGION \
    --root-password=root_temp_password_123 \
    --project=$PROJECT_ID || echo "Instance likely already exists"

# 4. Create Database and User
echo "Creating Database and User..."
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME --project=$PROJECT_ID || echo "Database exists"
# Prompt for user password
echo "Generating secure password for $DB_USER..."
DB_PASSWORD=$(openssl rand -base64 16)
gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD \
    --project=$PROJECT_ID || echo "User exists (password update skipped)"

# 5. Configure Secrets (DATABASE_URL)
echo "Configuring Secrets..."

# Construct DATABASE_URL for Prisma (Cloud Run uses Unix Socket)
# Format: postgresql://USER:PASSWORD@localhost/DB_NAME?host=/cloudsql/PROJECT:REGION:INSTANCE
INSTANCE_CONNECTION_NAME="$PROJECT_ID:$REGION:$DB_INSTANCE_NAME"
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost/$DB_NAME?host=/cloudsql/$INSTANCE_CONNECTION_NAME"

# Create/Update Secret
echo "Creating/Updating DATABASE_URL secret..."
printf "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=- --project=$PROJECT_ID --replication-policy="automatic" || \
printf "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL --data-file=- --project=$PROJECT_ID

# Grant Access to Default Compute Service Account (used by Cloud Run)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

echo "Granting Secret Accessor to $SERVICE_ACCOUNT..."
gcloud secrets add-iam-policy-binding DATABASE_URL \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID

echo "---------------------------------------------------"
echo "INFRASTRUCTURE SETUP COMPLETE"
echo "---------------------------------------------------"
echo "Database Connection Info:"
echo "  Instance: $DB_INSTANCE_NAME"
echo "  Connection Name: $INSTANCE_CONNECTION_NAME"
echo "  DB Name: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo "---------------------------------------------------"
echo "Project configured for Cloud Run and Vertex AI."
echo "---------------------------------------------------"
