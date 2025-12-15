# Kafaat 1.0 - Render Deployment Checklist

**Target**: Deploy to Render (Free Tier initially, scale to Pro)  
**Timeline**: 2-3 days for basic deployment, 1 week for production-ready  
**AI Strategy**: Ollama (local LLM) for cost-free AI features

---

## 📊 **Progress Overview**

- [ ] **Phase 1**: Pre-Deployment Setup (4-6 hours)
- [ ] **Phase 2**: Ollama AI Integration (3-4 hours)
- [ ] **Phase 3**: Database Configuration (2-3 hours)
- [ ] **Phase 4**: Render Configuration (2-3 hours)
- [ ] **Phase 5**: File Storage Setup (1-2 hours)
- [ ] **Phase 6**: Deployment & Testing (2-3 hours)
- [ ] **Phase 7**: Production Hardening (4-6 hours)
- [ ] **Phase 8**: Monitoring & Optimization (2-3 hours)

**Total Estimated Time**: 20-30 hours

---

## 🎯 **PHASE 1: PRE-DEPLOYMENT SETUP**

### 1.1 Environment Configuration
- [ ] Create `.env.production` file
- [ ] Generate secure secrets:
  ```bash
  # Generate SESSION_SECRET (32+ characters)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Generate JWT_SECRET (32+ characters)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Generate QR_VERIFICATION_SECRET
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Document all required environment variables
- [ ] Create `.env.example.render` with Render-specific values

### 1.2 External Database Setup (Choose ONE)
- [ ] **Option A: PlanetScale** (Free 5GB, Recommended)
  - [ ] Sign up at planetscale.com
  - [ ] Create database: `kafaat-tms`
  - [ ] Get connection string
  - [ ] Enable automatic backups
  
- [ ] **Option B: Railway** ($5/month, 1GB free)
  - [ ] Sign up at railway.app
  - [ ] Add MySQL plugin
  - [ ] Get connection string
  
- [ ] **Option C: Aiven** (Free 1GB)
  - [ ] Sign up at aiven.io
  - [ ] Create MySQL service
  - [ ] Get connection string

### 1.3 Database Migration
- [ ] Test connection locally:
  ```bash
  DATABASE_URL="mysql://user:pass@host:port/db" npm run db:push
  ```
- [ ] Run migrations on external database
- [ ] Verify all 52 tables created
- [ ] Seed initial data (admin user, license types, etc.)
- [ ] Test database queries

### 1.4 Code Audit & Cleanup
- [ ] Remove unused dependencies
- [ ] Fix any TypeScript errors: `npm run check`
- [ ] Format code: `npm run format`
- [ ] Update package.json scripts for production
- [ ] Remove development-only code

---

## 🤖 **PHASE 2: OLLAMA AI INTEGRATION**

### 2.1 Create Ollama Service Wrapper
- [ ] Create `server/services/ollama.service.ts`
- [ ] Implement OpenAI-compatible interface
- [ ] Add retry logic and error handling
- [ ] Add fallback to mock data if Ollama unavailable
- [ ] Test locally with Ollama

### 2.2 Modify LLM Core
- [ ] Update `server/_core/llm.ts` to support Ollama
- [ ] Add `OLLAMA_BASE_URL` environment variable
- [ ] Add `OLLAMA_MODEL` environment variable (default: `llama3.1:8b`)
- [ ] Add provider selection logic (OpenAI vs Ollama)
- [ ] Handle JSON schema differences

### 2.3 Update AI Service
- [ ] Modify `server/services/ai.service.ts` to use Ollama
- [ ] Adjust prompts for better Ollama compatibility
- [ ] Add JSON parsing with fallback
- [ ] Test all AI features:
  - [ ] Resume parsing
  - [ ] Career recommendations
  - [ ] Sentiment analysis
  - [ ] Candidate matching
  - [ ] Performance insights
  - [ ] Interview questions

### 2.4 Local Ollama Testing
- [ ] Install Ollama locally:
  ```bash
  # Windows
  winget install Ollama.Ollama
  
  # Or download from ollama.com/download
  ```
- [ ] Download model:
  ```bash
  ollama pull llama3.1:8b
  ```
- [ ] Test Ollama API:
  ```bash
  curl http://localhost:11434/api/generate -d '{
    "model": "llama3.1:8b",
    "prompt": "Why is the sky blue?"
  }'
  ```
- [ ] Run full application test with Ollama

### 2.5 Ollama Deployment Options (Choose ONE)

#### Option A: Ollama on Render Pro+ ($49/mo)
- [ ] Plan to upgrade to Render Pro+ (8GB RAM)
- [ ] Create Dockerfile for Ollama sidecar
- [ ] Configure model persistence
- [ ] Test in Render staging

#### Option B: External Ollama Service (Recommended, $10-15/mo)
- [ ] **Modal.com** (Serverless GPU)
  - [ ] Sign up at modal.com
  - [ ] Deploy Ollama endpoint
  - [ ] Get API URL
  
- [ ] **RunPod** (Serverless Pods)
  - [ ] Sign up at runpod.io
  - [ ] Deploy Ollama container
  - [ ] Get endpoint URL
  
- [ ] **Railway** (Self-hosted)
  - [ ] Deploy Ollama on Railway
  - [ ] Configure persistent storage
  - [ ] Get public URL

#### Option C: Hybrid (OpenAI for Critical, Ollama for Bulk)
- [ ] Keep OpenAI for complex tasks (resume parsing)
- [ ] Use Ollama for high-volume tasks (sentiment, recommendations)
- [ ] Implement smart routing logic

---

## 💾 **PHASE 3: FILE STORAGE CONFIGURATION**

### 3.1 Choose Storage Provider (Render Free Tier = No Persistent Storage)

#### Option A: Azure Blob Storage (Recommended, ~$2/mo)
- [ ] Create Azure Storage Account
- [ ] Create container: `kafaat-files`
- [ ] Get connection string
- [ ] Set environment variables:
  ```
  AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
  AZURE_STORAGE_CONTAINER=kafaat-files
  ```
- [ ] Test upload/download locally

#### Option B: AWS S3 ($3-5/mo for 100GB)
- [ ] Create S3 bucket: `kafaat-tms-files`
- [ ] Create IAM user with S3 access
- [ ] Get access keys
- [ ] Update `storage.service.ts` to support S3
- [ ] Test upload/download

#### Option C: Cloudflare R2 (Free 10GB, Recommended for Budget)
- [ ] Sign up at cloudflare.com
- [ ] Create R2 bucket
- [ ] Get S3-compatible credentials
- [ ] Configure in storage service
- [ ] Test

### 3.2 Update Storage Service
- [ ] Remove local storage for production
- [ ] Add cloud storage configuration validation
- [ ] Add retry logic for failed uploads
- [ ] Add file size and type validation
- [ ] Test all file upload features:
  - [ ] Resume uploads
  - [ ] License documents
  - [ ] Profile photos
  - [ ] Certificate uploads

---

## 🚀 **PHASE 4: RENDER CONFIGURATION**

### 4.1 Create render.yaml
- [ ] Create `render.yaml` in project root
- [ ] Configure web service
- [ ] Configure environment variables
- [ ] Configure build and start commands
- [ ] Configure health check endpoints

### 4.2 Create Render Services
- [ ] Sign up at render.com
- [ ] Connect GitHub repository
- [ ] Create Web Service
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Configure auto-deploy from `main` branch

### 4.3 Environment Variables on Render
- [ ] Add all environment variables to Render dashboard
- [ ] **Core Settings**:
  ```
  NODE_ENV=production
  PORT=10000
  SESSION_SECRET=<generated-secret>
  JWT_SECRET=<generated-secret>
  ```
- [ ] **Database**:
  ```
  DATABASE_URL=<planetscale-connection-string>
  ```
- [ ] **AI Configuration**:
  ```
  OLLAMA_BASE_URL=<ollama-service-url>
  OLLAMA_MODEL=llama3.1:8b
  ```
- [ ] **Storage**:
  ```
  AZURE_STORAGE_CONNECTION_STRING=<azure-blob-connection>
  AZURE_STORAGE_CONTAINER=kafaat-files
  ```
- [ ] **Optional Features**:
  ```
  FEATURE_MULTI_TENANCY=true
  FEATURE_AI_RECOMMENDATIONS=true
  TDRA_COMPLIANCE_ENABLED=true
  ```

### 4.4 Custom Domain (Optional)
- [ ] Purchase domain (e.g., kafaat-tms.com)
- [ ] Configure DNS in Render
- [ ] Enable HTTPS (automatic with Render)
- [ ] Update CORS_ALLOWED_ORIGINS

---

## 🧪 **PHASE 5: DEPLOYMENT & TESTING**

### 5.1 Initial Deployment
- [ ] Trigger first deployment on Render
- [ ] Monitor build logs for errors
- [ ] Wait for deployment to complete (~5-10 minutes)
- [ ] Check deployment status

### 5.2 Health Check Verification
- [ ] Test health endpoint: `https://your-app.onrender.com/health`
- [ ] Verify response shows:
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": "123s",
    "environment": "production",
    "features": {...}
  }
  ```
- [ ] Test ready endpoint: `/ready`
- [ ] Test metrics endpoint: `/metrics`

### 5.3 Database Connectivity Test
- [ ] Access application dashboard
- [ ] Verify users table loads
- [ ] Create test user
- [ ] Test login/logout
- [ ] Verify data persists

### 5.4 File Upload Test
- [ ] Upload test resume
- [ ] Upload test certificate
- [ ] Upload profile photo
- [ ] Verify files accessible via URL
- [ ] Test file deletion

### 5.5 AI Features Test
- [ ] Test resume parsing with Ollama
- [ ] Test career recommendations
- [ ] Test sentiment analysis
- [ ] Test candidate matching
- [ ] Monitor response times (should be <5s)

### 5.6 Full Application Smoke Test
- [ ] Test all 10 modules:
  - [ ] Career Progression
  - [ ] Succession Planning
  - [ ] Workforce Planning
  - [ ] Employee Engagement
  - [ ] Recruitment
  - [ ] Performance Management
  - [ ] Teacher Licensing
  - [ ] Competency Assessments
  - [ ] Staff Placement
  - [ ] Psychometric Tests
- [ ] Test critical user flows
- [ ] Test multi-tenant features (if enabled)
- [ ] Test notifications
- [ ] Test reports generation

---

## 🔒 **PHASE 6: PRODUCTION HARDENING**

### 6.1 Security Enhancements
- [ ] Add rate limiting:
  ```bash
  npm install express-rate-limit
  ```
- [ ] Configure rate limits on sensitive endpoints
- [ ] Add request size limits
- [ ] Enable CORS for specific domains only
- [ ] Add CSP headers
- [ ] Add HSTS headers
- [ ] Implement API key rotation

### 6.2 Error Handling & Logging
- [ ] Add Sentry for error tracking:
  ```bash
  npm install @sentry/node @sentry/tracing
  ```
- [ ] Configure Sentry DSN
- [ ] Add structured logging
- [ ] Add request ID tracking
- [ ] Configure log levels by environment
- [ ] Add log retention policy

### 6.3 Performance Optimization
- [ ] Add Redis for caching (optional):
  ```bash
  # Add Redis via Render add-on or Upstash
  npm install ioredis
  ```
- [ ] Implement query result caching
- [ ] Add database connection pooling
- [ ] Optimize slow queries (add indexes)
- [ ] Enable gzip compression
- [ ] Add CDN for static assets (Cloudflare)

### 6.4 Backup & Disaster Recovery
- [ ] Configure database automated backups
- [ ] Test database restore procedure
- [ ] Configure file storage versioning
- [ ] Document disaster recovery plan
- [ ] Test rollback procedure

---

## 📊 **PHASE 7: MONITORING & OPTIMIZATION**

### 7.1 Uptime Monitoring
- [ ] Add UptimeRobot (free):
  - [ ] Create account at uptimerobot.com
  - [ ] Monitor `/health` endpoint
  - [ ] Set alert email/SMS
  - [ ] Configure 5-minute checks

### 7.2 Application Performance Monitoring
- [ ] Add New Relic (free tier) OR
- [ ] Add AppSignal OR
- [ ] Use Render built-in metrics
- [ ] Monitor:
  - [ ] Response times
  - [ ] Error rates
  - [ ] Database query times
  - [ ] Memory usage
  - [ ] CPU usage

### 7.3 Log Aggregation (Optional)
- [ ] Add Logtail (free tier):
  - [ ] Sign up at logtail.com
  - [ ] Configure log shipping
  - [ ] Create dashboards
  - [ ] Set up alerts

### 7.4 AI Model Performance
- [ ] Monitor Ollama response times
- [ ] Track AI accuracy (user feedback)
- [ ] Monitor token usage
- [ ] Optimize prompts for speed
- [ ] Consider model quantization if slow

### 7.5 Cost Optimization
- [ ] Review Render usage
- [ ] Optimize database queries to reduce CPU
- [ ] Implement caching to reduce API calls
- [ ] Monitor storage usage
- [ ] Set up billing alerts

---

## 📚 **PHASE 8: DOCUMENTATION & MAINTENANCE**

### 8.1 Deployment Documentation
- [ ] Create deployment runbook
- [ ] Document all environment variables
- [ ] Document database setup process
- [ ] Document rollback procedures
- [ ] Create troubleshooting guide

### 8.2 User Documentation
- [ ] Update README.md with production URL
- [ ] Create user onboarding guide
- [ ] Document all features
- [ ] Create admin guide
- [ ] Create API documentation (tRPC introspection)

### 8.3 Maintenance Plan
- [ ] Schedule weekly dependency updates
- [ ] Schedule monthly security audits
- [ ] Plan quarterly feature reviews
- [ ] Set up change management process
- [ ] Create incident response plan

---

## ✅ **PHASE 9: GO-LIVE CHECKLIST**

### 9.1 Pre-Launch Verification
- [ ] All critical bugs fixed
- [ ] All features tested
- [ ] Performance meets requirements (<3s load time)
- [ ] Security audit passed
- [ ] Backup procedures tested
- [ ] Monitoring configured
- [ ] Support team trained

### 9.2 Launch Activities
- [ ] Enable production mode
- [ ] Update DNS (if custom domain)
- [ ] Notify users of launch
- [ ] Monitor error rates closely (first 24 hours)
- [ ] Have rollback plan ready
- [ ] Schedule post-launch review

### 9.3 Post-Launch Monitoring (First Week)
- [ ] Daily error log review
- [ ] Daily performance review
- [ ] User feedback collection
- [ ] Hot-fix deployment if needed
- [ ] Uptime monitoring (target: 99%+)

---

## 🎯 **OPTIONAL ENHANCEMENTS** (Future)

### Testing Suite
- [ ] Add unit tests for services (Vitest)
- [ ] Add integration tests for routers
- [ ] Add E2E tests (Playwright)
- [ ] Achieve 60%+ code coverage

### CI/CD Pipeline
- [ ] Create GitHub Actions workflow
- [ ] Add automated testing on PR
- [ ] Add automated deployment on merge
- [ ] Add staging environment

### Advanced Features
- [ ] Add real-time notifications (WebSockets)
- [ ] Add advanced analytics dashboard
- [ ] Add custom reports builder
- [ ] Add API webhooks for integrations
- [ ] Add mobile app (React Native)

### Scaling Preparation
- [ ] Implement horizontal scaling
- [ ] Add load balancer
- [ ] Implement read replicas
- [ ] Add background job processing (Bull/BullMQ)
- [ ] Add queue system for AI requests

---

## 📝 **NOTES & TIPS**

### Render Free Tier Limitations
- ⚠️ Sleeps after 15 minutes of inactivity (50-second cold start)
- ⚠️ 512 MB RAM (insufficient for Ollama)
- ⚠️ 750 hours/month free compute
- ⚠️ No persistent disk storage
- ✅ Free SSL certificate
- ✅ Auto-deploy from Git

### Cost Breakdown (Recommended Setup)
```
Render Pro+ (8GB RAM):     $49/month (for Ollama)
  OR External Ollama:      $10-15/month
PlanetScale Free:          $0/month (5GB)
Cloudflare R2 Free:        $0/month (10GB)
Monitoring (Free tiers):   $0/month
---
TOTAL:                     $10-50/month
```

### Alternative: Hybrid Approach (Recommended for Budget)
```
Render Free (App):         $0/month
Modal.com (Ollama):        $10/month
PlanetScale Free:          $0/month
Cloudflare R2 Free:        $0/month
---
TOTAL:                     $10/month
```

---

## 🚨 **TROUBLESHOOTING GUIDE**

### Build Fails
- Check Node version (should be 20+)
- Clear build cache on Render
- Verify all dependencies in package.json
- Check for TypeScript errors locally

### Database Connection Issues
- Verify DATABASE_URL format
- Check IP whitelist on database provider
- Test connection locally first
- Check SSL/TLS requirements

### Ollama Not Responding
- Verify OLLAMA_BASE_URL is correct
- Check Ollama service is running
- Verify model is downloaded
- Check logs for errors
- Test with curl directly

### File Upload Fails
- Verify storage credentials
- Check CORS configuration
- Verify file size limits
- Check storage quota

### Performance Issues
- Add database indexes
- Implement caching
- Optimize AI prompts
- Consider upgrading Render plan
- Use CDN for static assets

---

## 📞 **SUPPORT & RESOURCES**

### Documentation Links
- Render Docs: https://render.com/docs
- Ollama Docs: https://ollama.com/docs
- PlanetScale Docs: https://planetscale.com/docs
- Drizzle ORM: https://orm.drizzle.team/docs

### Community Support
- Render Discord: https://render.com/discord
- Ollama Discord: https://discord.gg/ollama
- Stack Overflow: tag [render], [ollama]

---

**Last Updated**: December 15, 2025  
**Version**: 1.0  
**Status**: Ready for Implementation
