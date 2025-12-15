# 📋 RENDER DEPLOYMENT - COPY/PASTE VALUES

## 🎯 DATABASE CONFIGURATION

```
Name: kafaat-tms-db
Database Name: kafaat_tms
User: kafaat_admin
Region: Oregon (US West)
Plan: Free
PostgreSQL Version: 16
```

---

## 🎯 WEB SERVICE CONFIGURATION

```
Name: kafaat-tms
Repository: Hanyshennawy/kafaat-tms
Branch: main
Region: Oregon (US West)
Root Directory: (leave blank)
Runtime: Docker
Dockerfile Path: ./Dockerfile
Instance Type: Free
Health Check Path: /health
```

---

## 🎯 ENVIRONMENT VARIABLES (Copy all)

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://kafaat_admin:fowuJiBwCSFYsaL3dnPl4Fpn5FWBLayp@dpg-d4vv519r0fns739tu8v0-a/kafaat_tms
RUN_MIGRATIONS_ON_START=true
TOGETHER_API_KEY=not-set-yet
TOGETHER_MODEL=meta-llama/Llama-3.2-3B-Instruct-Turbo
TOGETHER_BASE_URL=https://api.together.xyz/v1
TOGETHER_TIMEOUT=30000
SESSION_SECRET=kafaat-production-secret-2025-change-me
FEATURE_AI_RECOMMENDATIONS=true
FEATURE_PSYCHOMETRIC_ASSESSMENTS=true
FEATURE_MULTI_TENANCY=true
FEATURE_MARKETPLACE_INTEGRATION=true
TDRA_COMPLIANCE_ENABLED=true
TDRA_ALLOWED_REGIONS=ae-north-1,ae-south-1
TDRA_PRIMARY_REGION=ae-north-1
TDRA_CONSENT_RETENTION_DAYS=2555
TDRA_AUDIT_RETENTION_DAYS=1825
LOG_LEVEL=info
CORS_ALLOWED_ORIGINS=https://kafaat-tms.onrender.com,http://localhost:5173
```

---

## 🎯 MIGRATION COMMAND

**Option 1: Automatic (Recommended)**
Add this to environment variables in Step 2:
```
RUN_MIGRATIONS_ON_START=true
```

**Option 2: Manual via Local Terminal**
After deployment, run from your computer:
```bash
DATABASE_URL="<paste_internal_database_url_here>" npm run db:push
```

---

## 🎯 VERIFICATION URLS

After deployment completes, test these:

```
Application: https://kafaat-tms.onrender.com
Health Check: https://kafaat-tms.onrender.com/health
API: https://kafaat-tms.onrender.com/api/trpc
```

---

## 🎯 DEPLOYMENT FLOW

1. **New + → PostgreSQL** (1 min)
   - Create database with config above
   - Copy Internal Database URL
   
2. **New + → Web Service** (2 min)
   - Connect GitHub repo
   - Use web service config above
   - Paste DATABASE_URL from step 1
   - Add all environment variables
   
3. **Wait for Deploy** (3-5 min)
   - Watch logs
   - Wait for "Your service is live 🎉"
   - Migrations run automatically (if you added RUN_MIGRATIONS_ON_START)
   
4. **Test** (30 sec)
   - Visit health check URL
   - Open application URL

**Total Time**: ~7 minutes

---

## ✅ YOU'RE READY!

Open Render dashboard and follow the 5 steps above! 🚀
