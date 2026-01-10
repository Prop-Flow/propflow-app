#!/bin/bash
set -e

# Configuration
if [ -f .env ]; then
  echo "📄 Loading environment from .env..."
  set -a
  source .env
  set +a
fi

PROJECT_ID="propflow-ai-483621"
IMAGE_NAME="ssrpropflowai483621"
REGION="us-east4"
ARTIFACT_REGISTRY="us-east4-docker.pkg.dev/$PROJECT_ID/propflow-repo"
IMAGE_TAG="$ARTIFACT_REGISTRY/$IMAGE_NAME:latest"

echo "🚀 Starting Deployment for $PROJECT_ID..."

# 1. Ensure Artifact Registry exists
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

# 2. Build & Push (AMD64)
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

# 3. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $IMAGE_NAME \
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
  --set-env-vars NEXT_PUBLIC_GCP_PROJECT_ID=$NEXT_PUBLIC_GCP_PROJECT_ID,GCP_REGION=$REGION,NEXT_PUBLIC_GCP_REGION=$REGION,NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

echo "✅ Deployment Complete!"
echo "➡️  Service URL: https://ssrpropflowai483621-697138495010.us-east4.run.app"
