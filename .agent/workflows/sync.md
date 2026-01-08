---
description: Pull latest changes, integrate local work, verify build, and push to GitHub (Triggers Deployment)
---

// turbo
1. Stage all changes
   `git add .`

2. Commit local changes (if any)
   `git commit -m "chore: local updates before sync" || echo "No local changes to commit"`

// turbo
3. Pull latest changes from remote and rebase local changes
   `git pull --rebase origin main`

// turbo
4. Run project linting
   `npm run lint`

// turbo
5. Verify the project still builds correctly
   `npm run build`

// turbo
6. Run deep architectural and security lint
   `/lint`

// turbo
7. Push the synced and verified changes to GitHub (This will trigger a deployment)
   `git push origin main`

8. Notify the user that the sync is complete and deployment has been triggered.
