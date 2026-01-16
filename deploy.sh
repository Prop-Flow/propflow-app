#!/bin/bash
set -e

# Ensure we use the correct gcloud installation and Python
export PATH=/opt/homebrew/bin:$PATH
export CLOUDSDK_PYTHON=$(which python3)

# Configuration
if [ -f .env ]; then
  echo "📄 Loading environment from .env..."
  set -a
  source .env
  set +a
fi

PROJECT_ID="propflow-ai-483621"
SERVICE_NAME="propflow-app"
REGION="us-east4"
ARTIFACT_REGISTRY="us-east4-docker.pkg.dev/$PROJECT_ID/propflow-repo"
IMAGE_TAG="$ARTIFACT_REGISTRY/$SERVICE_NAME:latest"

# Firebase Public Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyD-MpLQYzlBruNZYcZUiEBIxZRWFMJ6MoU"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="propflow-ai-483621.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="propflow-ai-483621"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="propflow-ai-483621.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="638502512734"
NEXT_PUBLIC_FIREBASE_APP_ID="1:638502512734:web:d5a6d20ddbec647f91eccf"
NEXT_PUBLIC_GCP_PROJECT_ID="propflow-ai-483621"
NEXT_PUBLIC_APP_URL="https://propflow-ai-483621.web.app"

# NextAuth Configuration (loaded from .env file)
# NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET
# should be defined in your .env file

echo "🚀 Starting Deployment for $PROJECT_ID ($SERVICE_NAME)..."

# 1. Configure Docker authentication
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# 2. Ensure Artifact Registry exists
echo "📦 Checking Artifact Registry..."
gcloud artifacts repositories describe propflow-repo \
  --location=$REGION \
  --project=$PROJECT_ID || \
(echo "Creating Artifact Registry repository..." && \
gcloud artifacts repositories create propflow-repo \
  --repository-format=docker \
  --location=$REGION \
  --description="PropFlow Docker repository" \
  --project=$PROJECT_ID)

# 3. Build & Push (AMD64)
echo "🔨 Building & Pushing Docker image (linux/amd64)..."
docker buildx build --platform linux/amd64 -t $IMAGE_TAG --push \
  --build-arg NEXT_PUBLIC_GCP_PROJECT_ID=$NEXT_PUBLIC_GCP_PROJECT_ID \
  --build-arg GCP_REGION=$REGION \
  --build-arg NEXT_PUBLIC_GCP_REGION=$REGION \
  --build-arg NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
  .

# 4. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300 \
  --set-env-vars NEXT_PUBLIC_GCP_PROJECT_ID=$NEXT_PUBLIC_GCP_PROJECT_ID,GCP_PROJECT_ID=$PROJECT_ID,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GCP_REGION=$REGION,NEXT_PUBLIC_GCP_REGION=$REGION,NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID,NEXTAUTH_URL=$NEXTAUTH_URL,NEXTAUTH_SECRET=$NEXTAUTH_SECRET,GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET,TRUST_HOST=true

echo "✅ Deployment Complete!"
echo "➡️  Firebase Hosting URL: https://propflow-ai-483621.web.app"
echo "➡️  Cloud Run Service: $SERVICE_NAME"

