# 🚀 RENDER DEPLOYMENT - MANUAL STEPS (You're already logged in!)

## ✅ YOU'RE LOGGED IN TO RENDER!

I can see you're authenticated with API key. Now let's create the resources.

---

## STEP 1: CREATE POSTGRESQL DATABASE (1 minute)

**I've opened Render dashboard for you.**

1. In the Render dashboard, click **"New +"** button (top right)
2. Select **"PostgreSQL"**
3. Configure:
   ```
   Name: kafaat-tms-db
   Database: kafaat_tms  
   User: kafaat_admin
   Region: Oregon (US West)
   Plan: Free
   PostgreSQL Version: 16
   ```
4. Click **"Create Database"**
5. Wait 1 minute for provisioning
6. When ready, go to database page
7. **COPY the "Internal Database URL"** (it looks like):
   ```
   postgresql://kafaat_admin:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com/kafaat_tms
   ```

---

## STEP 2: CREATE WEB SERVICE (2 minutes)

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub:
   - If not connected, authorize Render to access GitHub
   - Select repository: **"Hanyshennawy/kafaat-tms"**
   - Click **"Connect"**

3. Configure Service:
   ```
   Name: kafaat-tms
   Region: Oregon (US West) [SAME as database!]
   Branch: main
   Root Directory: (leave blank)
   Runtime: Docker
   Instance Type: Free
   ```

4. Scroll to **"Environment Variables"** section

5. Click **"Add Environment Variable"** and add these one by one:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<PASTE_INTERNAL_URL_FROM_STEP_1>
TOGETHER_API_KEY=not-set-yet
TOGETHER_MODEL=meta-llama/Llama-3.2-3B-Instruct-Turbo
TOGETHER_BASE_URL=https://api.together.xyz/v1
SESSION_SECRET=kafaat-prod-2025-secret
FEATURE_AI_RECOMMENDATIONS=true
FEATURE_PSYCHOMETRIC_ASSESSMENTS=true
FEATURE_MULTI_TENANCY=true
TDRA_COMPLIANCE_ENABLED=true
LOG_LEVEL=info
CORS_ALLOWED_ORIGINS=https://kafaat-tms.onrender.com
```

6. Click **"Create Web Service"**

---

## STEP 3: WAIT FOR DEPLOYMENT (3-5 minutes)

You'll see deployment logs in real-time:

```
Building...
Step 1/10 : FROM node:22-alpine AS builder
...
Successfully deployed!
Your service is live 🎉
```

**Wait for**: "Your service is live 🎉"

---

## STEP 4: RUN DATABASE MIGRATIONS (1 minute)

After deployment succeeds:

1. In your **kafaat-tms** service page
2. Click **"Shell"** tab (in left sidebar)
3. Type this command:
   ```bash
   npm run db:push
   ```
4. Press Enter
5. Wait 30-60 seconds
6. You should see tables being created

---

## STEP 5: VERIFY DEPLOYMENT (30 seconds)

1. Click the URL at top of service page (or visit):
   ```
   https://kafaat-tms.onrender.com
   ```

2. Test health endpoint:
   ```
   https://kafaat-tms.onrender.com/health
   ```
   Should return: `{"status":"ok",...}`

3. Check application loads without errors

---

## ✅ SUCCESS CHECKLIST:

- [ ] PostgreSQL database created: kafaat-tms-db
- [ ] Internal database URL copied
- [ ] Web service created: kafaat-tms
- [ ] Environment variables configured (especially DATABASE_URL)
- [ ] Deployment completed successfully
- [ ] Database migrations run (npm run db:push)
- [ ] Health endpoint returns 200 OK
- [ ] Application homepage loads

---

## 🎉 YOUR DEPLOYED APPLICATION:

- **Live App**: https://kafaat-tms.onrender.com
- **Health Check**: https://kafaat-tms.onrender.com/health
- **API Endpoint**: https://kafaat-tms.onrender.com/api/trpc
- **Render Dashboard**: https://dashboard.render.com

---

## 💰 MONTHLY COST: $0

- PostgreSQL Free: 256MB storage
- Web Service Free: 750 hours/month
- Total: **$0/month**

---

## 🔧 OPTIONAL: Enable AI Features Later

1. Sign up: https://api.together.xyz/signup
2. Get API key
3. Update TOGETHER_API_KEY in Render environment variables
4. Service will auto-redeploy

---

## 🐛 TROUBLESHOOTING:

**Build fails**:
- Check Logs tab in service
- Verify Dockerfile exists in repo
- Ensure all dependencies in package.json

**Database connection error**:
- Verify DATABASE_URL is **Internal** URL (not External)
- Ensure database and service in same region (Oregon)
- Check database is not paused

**Migrations fail**:
- Ensure DATABASE_URL is set correctly
- Try running migrations again
- Check Shell logs for specific error

**App won't start**:
- Check Events tab for crash logs
- Verify all environment variables are set
- Check Logs tab for startup errors

---

## 📞 SUPPORT:

- **Render Docs**: https://render.com/docs
- **GitHub Repo**: https://github.com/Hanyshennawy/kafaat-tms
- **Render Status**: https://status.render.com

---

**Start with Step 1 above!** 🚀

The Render dashboard is open and you're logged in.
