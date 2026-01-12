---
description: Pull latest changes, integrate local work, verify build, and push to GitHub
---

// turbo
1. Pull latest changes: `git pull`
2. Run validation (Type Check): `npx tsc --noEmit`
3. Add changes: `git add .`
4. Commit changes: `git commit -m "chore: sync with remote"`
5. Push changes: `git push`
