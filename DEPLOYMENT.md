# Deployment Guide - AgriFaaS Connect

Complete guide for deploying your Farm Management Suite to GitHub and Vercel.

## Prerequisites

- Node.js 18+
- Git
- GitHub account
- Vercel account
- Gemini API key
- Playwright (for automated setup)

## Quick Setup (Automated with Playwright)

### 1. Install Dependencies

```bash
npm install
npm install -D playwright
```

### 2. Set Environment Variables

```bash
export GITHUB_USERNAME=your_github_username
export GITHUB_TOKEN=your_github_personal_access_token
export REPO_NAME=agrifaas-connect
export GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Playwright Automation

```bash
npx ts-node playwright-deploy.ts
```

This will:
- Initialize git repository
- Create GitHub repository
- Push your code to GitHub
- Set up Vercel deployment
- Configure environment variables

---

## Manual Setup

### Step 1: Initialize Git Repository

```bash
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"
git add .
git commit -m "Initial commit: AgriFaaS Connect Farm Management Suite"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `agrifaas-connect`
3. Add description: "Farm Management Suite with AI-powered insights"
4. Choose "Public"
5. Click "Create repository"

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/agrifaas-connect.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure project:
   - **Project Name**: agrifaas-connect
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - (Add other Firebase config variables as needed)
6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts to:
- Link to your GitHub repository
- Configure environment variables
- Deploy

### Step 5: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

---

## Deployment Scripts

### Build Locally

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

### Deploy to Vercel (Preview)

```bash
npm run deploy:vercel
```

### Deploy to Vercel (Production)

```bash
npm run deploy:vercel:prod
```

---

## Project Structure

```
agrifaas-connect/
├── components/          # React components
├── config/             # Firebase configuration
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── utils/              # Utility functions
├── App.tsx             # Main app component
├── index.tsx           # Entry point
├── vite.config.ts      # Vite configuration
├── vercel.json         # Vercel configuration
├── .env.example        # Environment variables template
└── package.json        # Dependencies and scripts
```

---

## Build Configuration

### Vite Configuration (vite.config.ts)

- **Port**: 3000
- **Host**: 0.0.0.0
- **Framework**: React 19
- **Build Output**: dist/

### Vercel Configuration (vercel.json)

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Environment Prefix**: `VITE_`

---

## Troubleshooting

### Git Push Fails

```bash
# Check remote URL
git remote -v

# Update remote if needed
git remote set-url origin https://github.com/YOUR_USERNAME/agrifaas-connect.git

# Try push again
git push -u origin main
```

### Vercel Build Fails

1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Ensure `npm run build` works locally:
   ```bash
   npm run build
   ```

### Missing Environment Variables

1. Create `.env.local` file locally:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your actual values
3. Add same variables to Vercel dashboard

### Firebase Connection Issues

1. Verify Firebase configuration in `config/firebase.ts`
2. Check Firebase project settings
3. Ensure API keys are correct in environment variables

---

## Continuous Deployment

Once deployed to Vercel:

1. **Automatic Deployments**: Every push to `main` branch triggers automatic deployment
2. **Preview Deployments**: Pull requests get preview URLs
3. **Rollback**: Use Vercel dashboard to rollback to previous deployments

---

## Performance Optimization

### Build Optimization

- Tree-shaking enabled
- Code splitting for routes
- Image optimization
- CSS minification

### Runtime Optimization

- React 19 with automatic batching
- Lazy loading components
- Firebase real-time listeners optimization
- Recharts performance tuning

---

## Security

- Environment variables never committed to git
- `.env.local` in `.gitignore`
- Firebase security rules configured
- API keys restricted to specific domains

---

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Review Firebase console
3. Check browser console for errors
4. Review GitHub Actions (if configured)

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure custom domain (optional)
3. ✅ Set up monitoring and analytics
4. ✅ Configure CI/CD pipeline
5. ✅ Set up automated backups
