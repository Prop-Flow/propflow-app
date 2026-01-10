# PropFlow Deployment Runbook

## Overview

This runbook provides step-by-step instructions for deploying the PropFlow application to Google Cloud Run using Cloud Build and GitHub Actions.

## Prerequisites

### Required Tools

- Git
- GitHub account with repository access
- Google Cloud Platform account with project `propflow-ai-483621`
- gcloud CLI (optional, for manual deployments)

### Required Secrets

The following secrets must be configured in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `GCP_SA_KEY` | Google Cloud Service Account JSON key | `{"type": "service_account", ...}` |
| `FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `propflow-ai-483621.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `propflow-ai-483621` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `propflow-ai-483621.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abc123` |

### GCP Permissions

The service account used in `GCP_SA_KEY` must have the following roles:

- Cloud Build Editor
- Cloud Run Admin
- Artifact Registry Administrator
- Service Account User

## Deployment Methods

### Method 1: Automatic Deployment via GitHub Actions (Recommended)

**Trigger**: Any push to the `main` branch

**Process**:

1. Make your code changes locally
2. Commit and push to `main`:

   ```bash
   git add .
   git commit -m "feat: your change description"
   git push origin main
   ```

3. GitHub Actions will automatically trigger the deployment
4. Monitor progress at: <https://github.com/[your-username]/Propflow/actions>
5. View deployment summary in the GitHub Actions run

**Expected Duration**: 8-12 minutes

### Method 2: Manual Deployment via GitHub Actions

**Trigger**: Manual workflow dispatch

**Process**:

1. Navigate to: <https://github.com/[your-username]/Propflow/actions>
2. Select "Deploy to Cloud Run" workflow
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow" button
6. Monitor progress in the Actions tab

### Method 3: Local Deployment via gcloud CLI

**Use Case**: Emergency deployments or testing

**Process**:

```bash
cd /path/to/Propflow

# Authenticate with GCP
gcloud auth login
gcloud config set project propflow-ai-483621

# Submit build to Cloud Build
gcloud builds submit \
  --config=cloudbuild.yaml \
  --region=us-east4 \
  --substitutions=_REGION=us-east4,_PROJECT_ID=propflow-ai-483621,_APP_URL=https://propflow-ai-483621.web.app,_FIREBASE_API_KEY=YOUR_KEY,_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN,_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID,_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET,_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID,_FIREBASE_APP_ID=YOUR_APP_ID
```

## Deployment Pipeline Stages

### Stage 1: Artifact Registry Setup (30-60s)

- Checks if `propflow-repo` exists in Artifact Registry
- Creates repository if missing
- **Success Indicator**: "✅ Artifact Registry ready"

### Stage 2: Docker Build (5-8 minutes)

- Builds Docker image with all environment variables
- Uses layer caching for faster subsequent builds
- Tags image with `:latest` and `:${SHORT_SHA}`
- **Success Indicator**: "Successfully built [image-id]"

### Stage 3: Docker Push (1-2 minutes)

- Pushes both image tags to Artifact Registry
- **Success Indicator**: "Pushed us-east4-docker.pkg.dev/propflow-ai-483621/propflow-repo/ssrpropflowai483621"

### Stage 4: Cloud Run Deployment (1-2 minutes)

- Deploys new revision to Cloud Run
- Configures resource limits (512Mi memory, 1 CPU)
- Sets environment variables
- Configures autoscaling (0-10 instances)
- **Success Indicator**: "Service [ssrpropflowai483621] revision [ssrpropflowai483621-xxxxx] has been deployed"

## Verification Steps

### 1. Check Deployment Status

**GitHub Actions**:

- Navigate to Actions tab
- View deployment summary with service URL

**GCP Console**:

- Visit: <https://console.cloud.google.com/run?project=propflow-ai-483621>
- Verify service `ssrpropflowai483621` shows "Healthy" status
- Check latest revision is serving 100% of traffic

### 2. Test Application Endpoints

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe ssrpropflowai483621 \
  --region=us-east4 \
  --project=propflow-ai-483621 \
  --format='value(status.url)')

# Test health endpoint
curl -I $SERVICE_URL

# Test login page
curl -I $SERVICE_URL/login
```

### 3. Verify Environment Variables

```bash
# Check Cloud Run service configuration
gcloud run services describe ssrpropflowai483621 \
  --region=us-east4 \
  --project=propflow-ai-483621 \
  --format='value(spec.template.spec.containers[0].env)'
```

### 4. Monitor Logs

```bash
# View recent logs
gcloud run services logs read ssrpropflowai483621 \
  --region=us-east4 \
  --project=propflow-ai-483621 \
  --limit=50
```

## Troubleshooting

### Issue: Build Fails at Docker Build Stage

**Symptoms**: Error during `docker build` step

**Possible Causes**:

- Missing or invalid Firebase environment variables
- Syntax errors in code
- Missing dependencies in `package.json`

**Resolution**:

1. Check GitHub Secrets are properly configured
2. Review build logs for specific error messages
3. Test Docker build locally:

   ```bash
   docker build \
     --build-arg NEXT_PUBLIC_GCP_PROJECT_ID=propflow-ai-483621 \
     --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=test \
     -t propflow-test .
   ```

### Issue: Artifact Registry Permission Denied

**Symptoms**: "Permission denied" when pushing to Artifact Registry

**Possible Causes**:

- Service account lacks Artifact Registry permissions
- Repository doesn't exist

**Resolution**:

1. Verify service account has "Artifact Registry Administrator" role
2. Manually create repository:

   ```bash
   gcloud artifacts repositories create propflow-repo \
     --repository-format=docker \
     --location=us-east4 \
     --project=propflow-ai-483621
   ```

### Issue: Cloud Run Deployment Timeout

**Symptoms**: Deployment step times out after 10 minutes

**Possible Causes**:

- Application startup is too slow
- Health check failures
- Resource constraints

**Resolution**:

1. Check Cloud Run logs for startup errors
2. Increase timeout in `cloudbuild.yaml` (currently 600s)
3. Review application startup code for blocking operations

### Issue: Application Returns 500 Errors

**Symptoms**: Service deploys successfully but returns 500 errors

**Possible Causes**:

- Missing environment variables at runtime
- Firebase configuration errors
- Database connection issues

**Resolution**:

1. Check Cloud Run logs:

   ```bash
   gcloud run services logs read ssrpropflowai483621 \
     --region=us-east4 \
     --project=propflow-ai-483621 \
     --limit=100
   ```

2. Verify all environment variables are set correctly
3. Test Firebase connection in logs

### Issue: GitHub Actions Workflow Fails

**Symptoms**: Workflow fails before Cloud Build submission

**Possible Causes**:

- Invalid `GCP_SA_KEY` secret
- Missing GitHub secrets
- Network connectivity issues

**Resolution**:

1. Verify all required secrets are configured in GitHub
2. Check service account key is valid JSON
3. Re-run workflow with "Re-run all jobs"

## Rollback Procedures

### Method 1: Rollback via GCP Console (Fastest)

1. Navigate to: <https://console.cloud.google.com/run/detail/us-east4/ssrpropflowai483621/revisions?project=propflow-ai-483621>
2. Find the previous working revision
3. Click "Manage Traffic"
4. Set previous revision to 100% traffic
5. Click "Save"

**Rollback Time**: ~30 seconds

### Method 2: Rollback via gcloud CLI

```bash
# List recent revisions
gcloud run revisions list \
  --service=ssrpropflowai483621 \
  --region=us-east4 \
  --project=propflow-ai-483621

# Rollback to specific revision
gcloud run services update-traffic ssrpropflowai483621 \
  --to-revisions=ssrpropflowai483621-00042-abc=100 \
  --region=us-east4 \
  --project=propflow-ai-483621
```

**Rollback Time**: ~1 minute

### Method 3: Rollback via Git Revert

```bash
# Revert the problematic commit
git revert HEAD
git push origin main

# Wait for automatic deployment (~10 minutes)
```

**Rollback Time**: ~10 minutes

## Environment Variables Reference

### Build-Time Variables (Docker Build Args)

These are passed during the Docker build process:

| Variable | Purpose | Set In |
|----------|---------|--------|
| `NEXT_PUBLIC_GCP_PROJECT_ID` | GCP project identifier | `cloudbuild.yaml` |
| `GCP_REGION` | GCP region | `cloudbuild.yaml` |
| `NEXT_PUBLIC_GCP_REGION` | GCP region (public) | `cloudbuild.yaml` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `cloudbuild.yaml` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | GitHub Secrets |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | GitHub Secrets |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | GitHub Secrets |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | GitHub Secrets |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | GitHub Secrets |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | GitHub Secrets |

### Runtime Variables (Cloud Run Environment)

These are set as environment variables in the Cloud Run service:

All build-time variables are also set as runtime environment variables for consistency.

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Deployment Success Rate**: Track in GitHub Actions
2. **Cloud Run Request Latency**: Monitor in GCP Console
3. **Error Rate**: Check Cloud Run logs
4. **Instance Count**: Verify autoscaling behavior

### Recommended Alerts

Set up alerts in GCP Console for:

- Cloud Run error rate > 5%
- Cloud Run request latency > 2s (p95)
- Cloud Run instance count at max (10 instances)
- Build failures in Cloud Build

## Best Practices

1. **Always test locally before pushing to main**

   ```bash
   npm run build
   npm run start
   ```

2. **Use descriptive commit messages** for easier rollback identification

3. **Monitor the first 5 minutes after deployment** for errors

4. **Keep GitHub Secrets up to date** when Firebase configuration changes

5. **Review Cloud Build logs** for any warnings even on successful deployments

6. **Test in a staging environment** for major changes (if available)

## Additional Resources

- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

## Support Contacts

- **GCP Project**: propflow-ai-483621
- **Region**: us-east4
- **Service Name**: ssrpropflowai483621
- **Artifact Registry**: us-east4-docker.pkg.dev/propflow-ai-483621/propflow-repo
