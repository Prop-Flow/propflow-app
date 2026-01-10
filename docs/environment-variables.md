# PropFlow Environment Variables

This document provides a comprehensive reference for all environment variables used in the PropFlow application.

## Configuration Files

Environment variables are managed in multiple locations:

1. **`.env`** - Local development (not committed to git)
2. **`.env.example`** - Template for required variables
3. **`cloudbuild.yaml`** - Cloud Build substitutions
4. **GitHub Secrets** - Secrets for GitHub Actions deployment
5. **Cloud Run** - Runtime environment variables

## Required Environment Variables

### Google Cloud Platform

| Variable | Description | Example | Required For |
|----------|-------------|---------|--------------|
| `NEXT_PUBLIC_GCP_PROJECT_ID` | GCP project ID | `propflow-ai-483621` | Build, Runtime |
| `GCP_REGION` | Primary GCP region | `us-east4` | Build, Runtime |
| `NEXT_PUBLIC_GCP_REGION` | Public-facing region | `us-east4` | Build, Runtime |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key | `./gcp-key.json` | Local Dev Only |
| `GCP_CLIENT_EMAIL` | Service account email | `service@project.iam.gserviceaccount.com` | Backend Auth |
| `GCP_PRIVATE_KEY` | Service account private key | `-----BEGIN PRIVATE KEY-----...` | Backend Auth |

### Firebase

| Variable | Description | Example | Required For |
|----------|-------------|---------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSyAbc123...` | Build, Runtime |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `propflow-ai-483621.firebaseapp.com` | Build, Runtime |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `propflow-ai-483621` | Build, Runtime |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `propflow-ai-483621.appspot.com` | Build, Runtime |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789012` | Build, Runtime |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123456789012:web:abc123def456` | Build, Runtime |

### Application Configuration

| Variable | Description | Example | Required For |
|----------|-------------|---------|--------------|
| `NEXT_PUBLIC_APP_URL` | Application base URL | `https://propflow-ai-483621.web.app` | Build, Runtime |
| `NEXTAUTH_URL` | NextAuth base URL (legacy) | `http://localhost:3000` | Local Dev |
| `NODE_ENV` | Node environment | `development` or `production` | All |

### Vertex AI

| Variable | Description | Example | Required For |
|----------|-------------|---------|--------------|
| `VERTEX_AI_REGION` | Vertex AI region for Gemini | `us-central1` | Runtime |
| `VERTEX_AI_PREDICTION_REGION` | Prediction region for Gemma | `us-east4` | Runtime |
| `VERTEX_AI_ENDPOINT_ID` | Vertex AI endpoint ID | `mg-endpoint-338f24d8-...` | Runtime |
| `VERTEX_AI_API_KEY` | Vertex AI API key | `...` | Runtime |

### Database

| Variable | Description | Example | Required For |
|----------|-------------|---------|--------------|
| `DATABASE_URL` | Prisma database connection string | `postgresql://user:pass@host:5432/db` | Runtime |

### Third-Party Services

| Variable | Description | Example | Required For |
|----------|-------------|---------|--------------|
| `PINECONE_API_KEY` | Pinecone vector database API key | `...` | Runtime |
| `N8N_WEBHOOK_URL` | N8N base webhook URL | `https://n8n.example.com/webhook/...` | Runtime |
| `N8N_TENANT_FOLLOWUP_WEBHOOK` | N8N tenant follow-up webhook | `https://n8n.example.com/webhook/tenant-followup` | Runtime |
| `N8N_DOCUMENT_COLLECTION_WEBHOOK` | N8N document collection webhook | `https://n8n.example.com/webhook/docs` | Runtime |
| `N8N_COMPLIANCE_CHECK_WEBHOOK` | N8N compliance check webhook | `https://n8n.example.com/webhook/compliance` | Runtime |

### Feature Flags

| Variable | Description | Example | Required For |
|----------|-------------|---------|--------------|
| `SIGNATURE_PROVIDER` | Signature provider | `mock` or `docusign` | Runtime |

## Setting Up Environment Variables

### Local Development

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Fill in the required values in `.env`

3. Never commit `.env` to version control

### GitHub Actions Deployment

Configure the following secrets in GitHub repository settings (`Settings > Secrets and variables > Actions`):

**Required Secrets:**

- `GCP_SA_KEY` - Full service account JSON key
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

### Cloud Build Triggers

If using Cloud Build triggers directly (not via GitHub Actions), configure substitution variables:

```yaml
substitutions:
  _FIREBASE_API_KEY: "your-api-key"
  _FIREBASE_AUTH_DOMAIN: "your-auth-domain"
  _FIREBASE_PROJECT_ID: "your-project-id"
  _FIREBASE_STORAGE_BUCKET: "your-storage-bucket"
  _FIREBASE_MESSAGING_SENDER_ID: "your-sender-id"
  _FIREBASE_APP_ID: "your-app-id"
```

### Cloud Run Service

Environment variables are automatically set during deployment via `cloudbuild.yaml`. To manually update:

```bash
gcloud run services update ssrpropflowai483621 \
  --region=us-east4 \
  --project=propflow-ai-483621 \
  --set-env-vars="KEY1=value1,KEY2=value2"
```

## Variable Naming Conventions

### `NEXT_PUBLIC_*` Prefix

Variables with this prefix are:

- Embedded in the client-side JavaScript bundle during build
- Publicly accessible in the browser
- Should NOT contain secrets
- Used for client-side configuration

**Examples**: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_APP_URL`

### No Prefix

Variables without prefix are:

- Server-side only
- Not exposed to the client
- Can contain sensitive information
- Used for backend operations

**Examples**: `DATABASE_URL`, `GCP_PRIVATE_KEY`

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use GitHub Secrets** for CI/CD - Never hardcode in workflows
3. **Rotate keys regularly** - Especially service account keys
4. **Minimize `NEXT_PUBLIC_*` variables** - Only use when necessary for client-side
5. **Use Cloud Secret Manager** for production secrets (future enhancement)

## Troubleshooting

### Issue: Environment variables not available at build time

**Symptom**: Build fails with "undefined" errors for env vars

**Solution**: Ensure variables are passed as `--build-arg` in Docker build:

```yaml
--build-arg NEXT_PUBLIC_FIREBASE_API_KEY=${_FIREBASE_API_KEY}
```

### Issue: Environment variables not available at runtime

**Symptom**: Application works locally but fails in Cloud Run

**Solution**: Verify variables are set in Cloud Run deployment:

```yaml
--set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=${_FIREBASE_API_KEY},..."
```

### Issue: Firebase configuration errors

**Symptom**: "Firebase: Error (auth/invalid-api-key)"

**Solution**:

1. Verify Firebase secrets are correctly set in GitHub
2. Check Cloud Build substitutions are properly passed
3. Confirm variables are not empty strings

## Environment-Specific Configuration

### Development (`NODE_ENV=development`)

- Uses `.env` file
- Points to `http://localhost:3000`
- May use mock services

### Production (`NODE_ENV=production`)

- Uses Cloud Run environment variables
- Points to `https://propflow-ai-483621.web.app`
- Uses real services

## Validation

To validate your environment configuration:

```bash
# Check local .env file
npm run env:check  # (if script exists)

# Verify Cloud Run configuration
gcloud run services describe ssrpropflowai483621 \
  --region=us-east4 \
  --project=propflow-ai-483621 \
  --format='value(spec.template.spec.containers[0].env)'
```

## Future Enhancements

- [ ] Migrate to Google Cloud Secret Manager for sensitive values
- [ ] Implement environment variable validation at startup
- [ ] Add automated secret rotation
- [ ] Create staging environment with separate variables
