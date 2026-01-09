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
GCR_TAG="gcr.io/$PROJECT_ID/$IMAGE_NAME:amd64"

echo "🚀 Starting Deployment for $PROJECT_ID..."

# 1. Build & Push (AMD64)
echo "📦 Building & Pushing Docker image (linux/amd64)..."
docker buildx build --platform linux/amd64 -t $GCR_TAG --push \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
  --build-arg NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
  .

# 2. Deploy
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $IMAGE_NAME \
  --image $GCR_TAG \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID,NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

echo "✅ Deployment Complete!"
echo "➡️  Verify at: https://$PROJECT_ID.web.app/login"
