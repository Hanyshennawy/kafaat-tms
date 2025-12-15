# =============================================================================
# KAFAAT 1.0 - IMMEDIATE DEPLOYMENT STEPS
# =============================================================================
# Execute these commands in order to complete deployment
# =============================================================================

## ✅ STATUS: Repository Ready for Push

Your code is committed to Git locally. Now follow these steps:

---

## 🔥 STEP 1: Create GitHub Repository

### **Option A: Via GitHub Website** (Recommended)

1. **Go to**: https://github.com/new

2. **Repository settings**:
   - Repository name: `kafaat-tms`
   - Description: `UAE MOE Talent Management System - Kafaat 1.0`
   - Visibility: **Public** or **Private** (your choice)
   - **DO NOT** initialize with README (we already have code)
   - **DO NOT** add .gitignore (we already have one)
   - **DO NOT** add license (we have MIT license)

3. **Create repository**

4. **Copy the repository URL** shown (looks like):
   ```
   https://github.com/YOUR_USERNAME/kafaat-tms.git
   ```

### **Option B: Install GitHub CLI** (Alternative)

```powershell
# Install GitHub CLI via winget
winget install --id GitHub.cli

# Then authenticate and create repo
gh auth login
gh repo create kafaat-tms --public --source=. --remote=origin --push
```

---

## 🔥 STEP 2: Push Code to GitHub

After creating the repository on GitHub, run these commands:

```powershell
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/kafaat-tms.git

# Rename branch to main (if not already)
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Expected output**:
```
Enumerating objects: 310, done.
Counting objects: 100% (310/310), done.
Delta compression using up to 8 threads
Compressing objects: 100% (298/298), done.
Writing objects: 100% (310/310), 1.5 MiB | 2.5 MiB/s, done.
Total 310 (delta 156), reused 0 (delta 0)
To https://github.com/YOUR_USERNAME/kafaat-tms.git
 * [new branch]      main -> main
```

---

## 🔥 STEP 3: Create PlanetScale Database

### **3A: Sign Up**

1. Go to: https://planetscale.com/signup
2. Sign up with GitHub (easiest)
3. Verify email

### **3B: Create Database**

1. Click **"New database"**
2. **Database name**: `kafaat-tms`
3. **Region**: `AWS us-east-1` (closest to Render Oregon)
4. **Plan**: Select **"Hobby"** (FREE - 5GB storage)
5. Click **"Create database"**

### **3C: Create Password**

1. In your database dashboard, go to **"Settings"** → **"Passwords"**
2. Click **"New password"**
3. **Name**: `render-production`
4. **Role**: Select **"Can read & write"**
5. Click **"Create password"**

### **3D: Save Connection String**

You'll see a connection string like:
```
mysql://USERNAME:PASSWORD@HOST.psdb.cloud/kafaat-tms?ssl={"rejectUnauthorized":true}
```

**SAVE THIS!** You'll need it in Step 5.

---

## 🔥 STEP 4: Get Together.ai API Key (Optional but Recommended)

### **4A: Sign Up**

1. Go to: https://api.together.xyz/signup
2. Sign up (free tier: 5M tokens/month)
3. Verify email

### **4B: Create API Key**

1. Go to: https://api.together.xyz/settings/api-keys
2. Click **"Create API key"**
3. **Name**: `kafaat-render-production`
4. Click **"Create"**
5. **SAVE THIS!** You won't see it again.

---

## 🔥 STEP 5: Deploy to Render

### **5A: Sign Up to Render**

1. Go to: https://dashboard.render.com/register
2. Sign up with GitHub (recommended - easier integration)

### **5B: Authenticate Render CLI**

```powershell
# Login (opens browser)
render login
```

Follow the browser prompts to authenticate.

### **5C: Create Web Service**

**Via Render Dashboard** (Easier):

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `kafaat-tms`
4. **Settings**:
   - **Name**: `kafaat-tms`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: Docker
   - **Instance Type**: **Free**
5. Click **"Create Web Service"**

**Via Render CLI** (Alternative):

```powershell
render services:create
```

### **5D: Set Environment Variables**

After service is created, set environment variables:

**Via Dashboard**:
1. Go to service → **"Environment"** tab
2. Add these variables:

```
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST.psdb.cloud/kafaat-tms?ssl={"rejectUnauthorized":true}
TOGETHER_API_KEY=your_together_api_key_here
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-random-32-char-secret-here
TOGETHER_MODEL=meta-llama/Llama-3.2-3B-Instruct-Turbo
TOGETHER_BASE_URL=https://api.together.xyz/v1
TOGETHER_TIMEOUT=30000
FEATURE_AI_RECOMMENDATIONS=true
FEATURE_PSYCHOMETRIC_ASSESSMENTS=true
FEATURE_MULTI_TENANCY=true
TDRA_COMPLIANCE_ENABLED=true
TDRA_ALLOWED_REGIONS=ae-north-1,ae-south-1
TDRA_PRIMARY_REGION=ae-north-1
LOG_LEVEL=info
CORS_ALLOWED_ORIGINS=https://kafaat-tms.onrender.com,http://localhost:5173
```

**Via CLI**:

```powershell
# Replace values with your actual credentials
render env:set DATABASE_URL="mysql://USERNAME:PASSWORD@HOST.psdb.cloud/kafaat-tms?ssl={\"rejectUnauthorized\":true}"
render env:set TOGETHER_API_KEY="your_together_api_key_here"
render env:set SESSION_SECRET="$(openssl rand -base64 32)"
```

3. Click **"Save Changes"** (this will trigger a redeploy)

---

## 🔥 STEP 6: Run Database Migrations

Once deployment completes (5-10 minutes):

**Via Dashboard**:
1. Go to service → **"Shell"** tab
2. Run command: `npm run db:push`
3. Wait for migrations to complete

**Via CLI**:
```powershell
render shell kafaat-tms
npm run db:push
exit
```

---

## 🔥 STEP 7: Verify Deployment

```powershell
# Check service status
render services:get kafaat-tms

# View logs
render logs kafaat-tms

# Test health endpoint
curl https://kafaat-tms.onrender.com/health

# Open in browser
render open kafaat-tms
```

**Expected Health Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T12:34:56.789Z",
  "uptime": 123
}
```

---

## ✅ SUCCESS CHECKLIST

After completing all steps, verify:

- [ ] Code pushed to GitHub successfully
- [ ] PlanetScale database created and password saved
- [ ] Together.ai API key obtained
- [ ] Render service created and deployed
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Application loads in browser
- [ ] No errors in Render logs

---

## 🎯 YOUR DEPLOYMENT URLS

After deployment, save these URLs:

- **Application**: `https://kafaat-tms.onrender.com`
- **Health Check**: `https://kafaat-tms.onrender.com/health`
- **API**: `https://kafaat-tms.onrender.com/api/trpc`
- **Render Dashboard**: https://dashboard.render.com
- **PlanetScale Console**: https://app.planetscale.com
- **Together.ai Dashboard**: https://api.together.xyz/dashboard

---

## 💡 NEXT STEPS

1. **Test AI features**: Try career recommendations, resume parsing
2. **Create first user**: Register a test account
3. **Explore features**: Navigate through all modules
4. **Share with team**: Get feedback
5. **Monitor**: Check logs daily for first week

---

## 🐛 IF SOMETHING GOES WRONG

**Build fails**:
```powershell
render logs kafaat-tms --build
```

**Database connection fails**:
```powershell
render shell kafaat-tms
node -e "console.log(process.env.DATABASE_URL)"
```

**Application crashes**:
```powershell
render logs kafaat-tms --tail
```

---

## 📞 SUPPORT

- **Render Docs**: https://render.com/docs
- **PlanetScale Docs**: https://planetscale.com/docs
- **Together.ai Docs**: https://docs.together.ai

---

**Ready to deploy!** Start with Step 1. 🚀
