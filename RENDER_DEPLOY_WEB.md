# =============================================================================
# RENDER DEPLOYMENT - WEB INTERFACE GUIDE
# =============================================================================
# Follow these steps to deploy via Render Dashboard
# =============================================================================

## ✅ COMPLETED:

- ✅ **GitHub Repository Created**: https://github.com/Hanyshennawy/kafaat-tms
- ✅ **Code Pushed**: All 359 files committed and pushed
- ✅ **Render Configuration**: render.yaml ready
- ✅ **Dockerfile**: Production-ready

---

## 🚀 NEXT STEPS (10 minutes):

### **STEP 1: Sign Up to Render** (1 minute)

1. Open: https://dashboard.render.com/register
2. Click **"Sign up with GitHub"** (recommended)
3. Authorize Render to access your GitHub account

---

### **STEP 2: Create Web Service** (3 minutes)

1. After login, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your repository:
   - If not connected, click **"Connect account"** → GitHub
   - Find and select: **"Hanyshennawy/kafaat-tms"**
   - Click **"Connect"**

4. **Configure Service**:
   - **Name**: `kafaat-tms`
   - **Region**: **Oregon (US West)** (best for free tier)
   - **Branch**: `master` (or `main` if you renamed it)
   - **Root Directory**: Leave blank
   - **Runtime**: **Docker**
   - **Instance Type**: **Free** ($0/month)

5. Click **"Create Web Service"**

---

### **STEP 3: Configure Environment Variables** (3 minutes)

While the service is deploying, add environment variables:

1. Go to **"Environment"** tab
2. Click **"Add Environment Variable"**

**Required Variables**:

```
NODE_ENV=production
PORT=3000
```

**Database** (from PlanetScale):
```
DATABASE_URL=mysql://USERNAME:PASSWORD@HOST.psdb.cloud/kafaat-tms?ssl={"rejectUnauthorized":true}
```

**AI Service** (from Together.ai):
```
TOGETHER_API_KEY=your_together_api_key_here
TOGETHER_MODEL=meta-llama/Llama-3.2-3B-Instruct-Turbo
TOGETHER_BASE_URL=https://api.together.xyz/v1
TOGETHER_TIMEOUT=30000
```

**Session Secret** (generate random string):
```
SESSION_SECRET=your-random-32-character-secret-string-here
```

**Feature Flags**:
```
FEATURE_AI_RECOMMENDATIONS=true
FEATURE_PSYCHOMETRIC_ASSESSMENTS=true
FEATURE_MULTI_TENANCY=true
FEATURE_MARKETPLACE_INTEGRATION=true
```

**TDRA Compliance**:
```
TDRA_COMPLIANCE_ENABLED=true
TDRA_ALLOWED_REGIONS=ae-north-1,ae-south-1
TDRA_PRIMARY_REGION=ae-north-1
TDRA_CONSENT_RETENTION_DAYS=2555
TDRA_AUDIT_RETENTION_DAYS=1825
```

**Logging**:
```
LOG_LEVEL=info
```

**CORS** (update after deployment):
```
CORS_ALLOWED_ORIGINS=https://kafaat-tms.onrender.com,http://localhost:5173
```

3. Click **"Save Changes"** (this will trigger a redeploy)

---

### **STEP 4: Wait for Deployment** (3-5 minutes)

1. Watch the **"Logs"** tab
2. Wait for message: **"Your service is live 🎉"**
3. Check **"Events"** tab for deployment status

**Expected logs**:
```
==> Building...
==> Deploying...
==> Starting service...
🚀 Kafaat 1.0 TMS Server
📊 Health check: http://localhost:3000/health
✅ Server ready on port 3000
```

---

### **STEP 5: Run Database Migrations** (2 minutes)

After deployment succeeds:

1. Go to **"Shell"** tab in Render dashboard
2. Click **"Open shell"**
3. Run command:
   ```bash
   npm run db:push
   ```
4. Wait for migrations to complete (~30 seconds)
5. You should see: **"✅ Migrations applied successfully"**

---

### **STEP 6: Verify Deployment** (1 minute)

1. **Test Health Endpoint**:
   - URL: `https://kafaat-tms.onrender.com/health`
   - Expected: `{"status":"ok","timestamp":"...","uptime":123}`

2. **Open Application**:
   - Click **"Live"** link at top of Render dashboard
   - Or visit: `https://kafaat-tms.onrender.com`
   - Should see: Kafaat 1.0 landing page

3. **Check Logs**:
   - Go to **"Logs"** tab
   - Should see no errors
   - Look for: "Server ready on port 3000"

---

## 🔍 VERIFICATION CHECKLIST:

- [ ] Render service created and deployed
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] No errors in Render logs
- [ ] AI features accessible (test later)

---

## 🎯 YOUR DEPLOYMENT URLS:

- **Application**: https://kafaat-tms.onrender.com
- **Health Check**: https://kafaat-tms.onrender.com/health
- **API**: https://kafaat-tms.onrender.com/api/trpc
- **GitHub Repo**: https://github.com/Hanyshennawy/kafaat-tms
- **Render Dashboard**: https://dashboard.render.com/web/kafaat-tms

---

## 💡 TROUBLESHOOTING:

### **Build Fails**:
- Check **"Logs"** tab for error messages
- Verify Dockerfile exists in repository
- Ensure all dependencies in package.json

### **Deployment Fails**:
- Check environment variables are set correctly
- Verify DATABASE_URL format is correct
- Check if PlanetScale database is accessible

### **Application Crashes**:
- Go to **"Events"** tab to see crash logs
- Check **"Logs"** tab for error messages
- Verify all required environment variables are set

### **Database Connection Error**:
- Verify DATABASE_URL in environment variables
- Test connection from PlanetScale console
- Check database is not paused or deleted

---

## 🎉 SUCCESS!

Once all steps are complete:

✅ Application deployed at: `https://kafaat-tms.onrender.com`  
✅ Database connected and migrated  
✅ AI services configured  
✅ Auto-deploy enabled (push to GitHub → automatic deploy)

---

## 📞 NEED HELP?

**Quick Links**:
- PlanetScale Setup: Open `PLANETSCALE_SETUP.md`
- Together.ai: https://api.together.xyz/signup
- Render Support: https://render.com/docs

**What to do now**:
1. ✅ GitHub repo: https://github.com/Hanyshennawy/kafaat-tms
2. ⏳ Set up PlanetScale database (use PLANETSCALE_SETUP.md)
3. ⏳ Get Together.ai API key: https://api.together.xyz/signup
4. ⏳ Deploy on Render (follow this guide)

---

**Ready to deploy!** Start with Step 1 above. 🚀
