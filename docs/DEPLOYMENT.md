# Deployment Configuration Guide

## Overview

This project uses a **centralized deployment configuration** system to ensure consistency across all deployment mechanisms and prevent configuration drift.

## Configuration Files

### Primary Configuration

**[deployment-config.json](file:///Users/alexandertaylor/Propflow/deployment-config.json)** - Single source of truth for all deployment settings.

```json
{
  "projectId": "propflow-ai-483621",
  "region": "us-east4",
  "serviceName": "ssrpropflowai483621",
  "imageName": "ssrpropflowai483621",
  "artifactRegistry": {
    "location": "us-east4",
    "repository": "cloud-run-source-deploy"
  },
  "cloudSql": {
    "instance": "propflow-db-east",
    "region": "us-east4"
  }
}
```

### Deployment Mechanisms

1. **GitHub Actions** - [.github/workflows/deploy.yml](file:///Users/alexandertaylor/Propflow/.github/workflows/deploy.yml)
   - Automatically validates against `deployment-config.json`
   - Triggers on push to `main` branch
   - Builds Docker image and deploys to Cloud Run

2. **Cloud Build** - [cloudbuild.yaml](file:///Users/alexandertaylor/Propflow/cloudbuild.yaml)
   - Alternative deployment method
   - Uses same configuration values

## How to Update Configuration

### ⚠️ IMPORTANT: Always Update Both Files

When changing deployment configuration, you **must** update:

1. **deployment-config.json** - Update the centralized config
2. **Deployment files** - Update corresponding workflow/build files

### Example: Changing Region

```bash
# 1. Update deployment-config.json
{
  "region": "us-central1",  # ← Change here
  ...
}

# 2. Update .github/workflows/deploy.yml
env:
  REGION: us-central1  # ← Change here
  ...

# 3. Update cloudbuild.yaml
# Update all region references
```

### ✅ Validation Prevents Mistakes

GitHub Actions includes a **validation step** that:

- Compares workflow env vars against `deployment-config.json`
- **Fails the deployment** if values don't match
- Prevents deploying with incorrect configuration

## Deployment Workflow

### Automatic Deployment (GitHub Actions)

```bash
# 1. Make your changes
git add .
git commit -m "feat: your changes"

# 2. Push to main
git push origin main

# 3. GitHub Actions automatically:
#    - Validates configuration
#    - Builds Docker image
#    - Pushes to Artifact Registry
#    - Deploys to Cloud Run
```

### Manual Deployment (Cloud Build)

```bash
# Trigger Cloud Build manually
gcloud builds submit --config=cloudbuild.yaml
```

## Configuration Values

| Setting | Value | Purpose |
|---------|-------|---------|
| **Project ID** | `propflow-ai-483621` | GCP project identifier |
| **Region** | `us-east4` | Cloud Run and Artifact Registry location |
| **Service Name** | `ssrpropflowai483621` | Cloud Run service name |
| **Image Name** | `ssrpropflowai483621` | Docker image name in Artifact Registry |
| **Cloud SQL Instance** | `propflow-db-east` | Database instance name |

## Common Issues

### Configuration Mismatch Error

**Error**: `❌ REGION mismatch! Config: us-east4, Workflow: us-east5`

**Solution**: Update the mismatched value in either `deployment-config.json` or the workflow file to match.

### Image Not Found (404)

**Error**: `Image 'us-east4-docker.pkg.dev/.../wrong-name' not found`

**Cause**: Image name in deployment config doesn't match what was built.

**Solution**: Ensure `imageName` in `deployment-config.json` matches `REPO_NAME` in workflow.

## Local Development

Your local `.env` file should match the deployment configuration:

```bash
# .env
GCP_REGION="us-east4"  # ← Must match deployment-config.json
NEXT_PUBLIC_GCP_PROJECT_ID="propflow-ai-483621"
```

> [!WARNING]
> The `.env` file is gitignored. You must update it manually when deployment configuration changes.

## Best Practices

✅ **Always validate locally** before pushing
✅ **Update both config files** when making changes
✅ **Test in staging** before production deployments
✅ **Monitor GitHub Actions** logs for validation errors
✅ **Keep `.env` in sync** with `deployment-config.json`

❌ **Never** hardcode configuration values in code
❌ **Never** skip the validation step
❌ **Never** commit `.env` to version control
