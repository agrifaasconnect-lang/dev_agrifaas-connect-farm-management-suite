# Quick Start - Deploy to GitHub & Vercel

## Option 1: Automated Setup (Recommended)

### Prerequisites
- GitHub personal access token: https://github.com/settings/tokens
- Gemini API key
- Playwright installed

### Run Automation

```bash
# Install Playwright
npm install -D playwright

# Set environment variables
export GITHUB_USERNAME=your_username
export GITHUB_TOKEN=your_token
export GEMINI_API_KEY=your_key
export REPO_NAME=agrifaas-connect

# Run deployment automation
npx ts-node playwright-deploy.ts
```

The script will:
1. ✅ Initialize git
2. ✅ Create GitHub repository
3. ✅ Push your code
4. ✅ Set up Vercel deployment

---

## Option 2: Manual Setup (Step by Step)

### Step 1: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: AgriFaaS Connect"
```

### Step 2: Create GitHub Repo
1. Go to https://github.com/new
2. Name: `agrifaas-connect`
3. Make it Public
4. Create repository

### Step 3: Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/agrifaas-connect.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Set environment variables:
   - `GEMINI_API_KEY`
   - Firebase config variables
4. Click Deploy

---

## Environment Variables Needed

Create `.env.local` locally:
```
GEMINI_API_KEY=your_key_here
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Add same variables to Vercel dashboard under Settings → Environment Variables.

---

## Verify Deployment

1. **GitHub**: https://github.com/YOUR_USERNAME/agrifaas-connect
2. **Vercel**: Check your Vercel dashboard for deployment status
3. **Live App**: Your Vercel deployment URL

---

## Troubleshooting

**Git push fails?**
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/agrifaas-connect.git
git push -u origin main
```

**Build fails on Vercel?**
- Check environment variables are set
- Run `npm run build` locally to verify

**Missing dependencies?**
```bash
npm install
npm run build
```

---

See `DEPLOYMENT.md` for complete documentation.
