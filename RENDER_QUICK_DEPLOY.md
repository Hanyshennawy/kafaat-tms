# 🚀 RENDER DEPLOYMENT - COMPLETE AUTOMATION GUIDE

## ✅ WHAT'S DONE:
- ✅ **GitHub Repository**: https://github.com/Hanyshennawy/kafaat-tms
- ✅ **Database Switched**: MySQL → PostgreSQL (for Render compatibility)
- ✅ **Code Updated**: All database drivers updated
- ✅ **Code Pushed**: Latest changes on GitHub

---

## 🎯 DEPLOY NOW (5 MINUTES):

### **STEP 1: Sign Up to Render** (1 minute)

Click here to open: https://dashboard.render.com/register

1. Click **"Sign up with GitHub"**
2. Authorize Render

---

### **STEP 2: Create PostgreSQL Database** (2 minutes)

1. After login, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `kafaat-tms-db`
   - **Database**: `kafaat_tms`
   - **User**: `kafaat_admin`
   - **Region**: **Oregon (US West)**
   - **Plan**: **Free** ($0/month - 256MB storage)
3. Click **"Create Database"**
4. Wait 1 minute for provisioning
5. **COPY** the "Internal Database URL" (starts with `postgresql://`)

**Internal URL Format**:
```
postgresql://kafaat_admin:password@dpg-xxxxx-postgres:5432/kafaat_tms
```

---

### **STEP 3: Create Web Service** (2 minutes)

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository:
   - Select: **"Hanyshennawy/kafaat-tms"**
   - Click **"Connect"**
3. Configure Service:
   - **Name**: `kafaat-tms`
   - **Region**: **Oregon (US West)** (same as database)
   - **Branch**: `main`
   - **Root Directory**: (leave blank)
   - **Runtime**: **Docker**
   - **Instance Type**: **Free** ($0/month)
4. Scroll down to **Environment Variables**
5. Click **"Add Environment Variable"** and add these:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<PASTE_THE_INTERNAL_DATABASE_URL_FROM_STEP_2>
TOGETHER_API_KEY=not-set-yet
TOGETHER_MODEL=meta-llama/Llama-3.2-3B-Instruct-Turbo
TOGETHER_BASE_URL=https://api.together.xyz/v1
SESSION_SECRET=kafaat-2025-production-secret-change-this
FEATURE_AI_RECOMMENDATIONS=true
FEATURE_PSYCHOMETRIC_ASSESSMENTS=true
FEATURE_MULTI_TENANCY=true
TDRA_COMPLIANCE_ENABLED=true
LOG_LEVEL=info
CORS_ALLOWED_ORIGINS=https://kafaat-tms.onrender.com
```

6. Click **"Create Web Service"**
7. Wait 3-5 minutes for deployment (watch the logs)

---

### **STEP 4: Run Database Migrations** (1 minute)

After deployment succeeds (you'll see "Your service is live 🎉"):

1. In Render dashboard, go to your **kafaat-tms** service
2. Click **"Shell"** tab
3. Type this command:
```bash
npm run db:push
```
4. Press Enter
5. Wait 30 seconds for tables to be created

---

### **STEP 5: Verify Deployment** (1 minute)

1. Click the service URL at top: `https://kafaat-tms.onrender.com`
2. Test health: `https://kafaat-tms.onrender.com/health`
3. Should see: `{"status":"ok",...}`

---

## ✅ SUCCESS CHECKLIST:

- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Internal database URL copied
- [ ] Web service created and deployed
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Application loads without errors

---

## 🎉 YOUR DEPLOYED APP:

- **Application**: https://kafaat-tms.onrender.com
- **Health Check**: https://kafaat-tms.onrender.com/health
- **API**: https://kafaat-tms.onrender.com/api/trpc
- **Dashboard**: https://dashboard.render.com

---

## 💰 MONTHLY COST: $0

- **PostgreSQL**: Free (256MB)
- **Web Service**: Free (750 hours/month)
- **Together.ai**: Free (5M tokens/month) - add key later for AI features

---

## 🔧 OPTIONAL: Add AI Features

Later, to enable AI features:

1. Sign up: https://api.together.xyz/signup
2. Get API key
3. In Render dashboard → Environment → Edit `TOGETHER_API_KEY`
4. Service will auto-redeploy

---

## 🐛 TROUBLESHOOTING:

**Build fails**:
- Check Logs tab
- Verify Dockerfile exists

**Database connection error**:
- Verify DATABASE_URL is the "Internal" URL (not External)
- Ensure both database and service are in same region (Oregon)

**App crashes**:
- Check Events tab
- Verify all environment variables are set

---

**Start here**: https://dashboard.render.com/register 🚀

**Estimated time**: 5 minutes total
