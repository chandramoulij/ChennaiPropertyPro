# ChennaiPropertyPro - Management & Deployment Guide

## 🚀 GitHub Update Workflow (From Local PC)
1. **Stage & Commit:**
   ```bash
   git add .
   git commit -m "Update: [Brief description of changes]"
   ```
2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

---

## 🖥️ VPS Deployment Procedure (Terminal)

### 1. Update Code (The "Reset" Method)
If you get a "divergent branches" or "reconcile" error, run these:
```bash
cd /var/www/chennaipropertypro.com/public_html

# Fetch all updates from GitHub
git fetch origin

# Force the local server to match GitHub exactly
git reset --hard origin/main
```

### 2. Environment Setup
Vite requires a `.env` file for API keys.
```bash
nano .env
```
Ensure it contains your `VITE_` keys.

### 3. Build Production Files
```bash
npm install
npm run build
```

### 4. Nginx Configuration
Ensure Nginx is serving the `dist` folder:
```nginx
root /var/www/chennaipropertypro.com/public_html/dist;
```

### 5. Apply Changes
```bash
sudo systemctl restart nginx
```

---

## 🛠️ Troubleshooting
- **Git Error:** Run `git fetch origin` and `git reset --hard origin/main`.
- **White Screen:** Check your `.env` variables (must start with `VITE_`).
- **404 on Refresh:** Add `try_files $uri $uri/ /index.html;` to your Nginx location block.
