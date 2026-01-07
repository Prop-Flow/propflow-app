---
description: Pull latest changes, integrate local work, verify build, and push to GitHub
---

// turbo
1. Stage all changes
   `git add .`

// turbo
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
7. Push the synced and verified changes to GitHub
   `git push origin main`
