# 🚀 Kafaat TMS - Local Development Setup Guide

## Quick Setup Steps

### 1. Database Setup (PostgreSQL)

#### Option A: Using pgAdmin (GUI - Recommended)
1. Open pgAdmin 4 from Start Menu
2. Connect to your local PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `kafaat_tms`
5. Click Save

#### Option B: Using Command Line
```powershell
# Set your PostgreSQL password
$env:PGPASSWORD = "your_postgres_password"

# Create database
& "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres kafaat_tms
```

### 2. Update .env File

Edit `.env` and update the DATABASE_URL with your PostgreSQL credentials:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kafaat_tms
```

### 3. Run Database Migrations

```powershell
cd "c:\Users\Eng. Hany\OneDrive - Ministry of Education (MOE)\Desktop\PDS\Software\Kafaat1.0\talent-management-system"

# Push schema to database
npm run db:push
```

### 4. Start the Development Server

```powershell
npm run dev
```

---

## 🤖 Ollama AI Setup (Already Configured!)

Your Ollama is already running with these models:
- deepseek-r1:14b (Primary model for AI features)
- deepseek-coder:1.3b
- qwen3-coder:480b-cloud
- nomic-embed-text:latest

The AI features will automatically use Ollama when you start the app.

---

## ✅ Verification Checklist

After setup, verify these services are running:
- [ ] PostgreSQL service: `Get-Service postgresql*`
- [ ] Ollama: `ollama list`
- [ ] App server: http://localhost:3000

---

## 🧪 Testing AI Features

1. Start the server: `npm run dev`
2. Open http://localhost:3000
3. Navigate to any module with AI features:
   - Career Progression: AI career recommendations
   - Recruitment: AI resume parsing, interview questions
   - Licensing: AI-generated exam questions
   - Performance: AI sentiment analysis
   - Engagement: AI survey analysis

---

## 🌐 Render Deployment Notes

For production on Render:
1. The app will use Together.ai as fallback (since Ollama can't run on free tier)
2. Set `TOGETHER_API_KEY` in Render environment variables
3. PostgreSQL is already configured on Render

---

## 📝 Environment Variables Summary

| Variable | Local Value | Production (Render) |
|----------|-------------|---------------------|
| DATABASE_URL | postgresql://postgres:xxx@localhost:5432/kafaat_tms | (Auto-configured by Render) |
| OLLAMA_BASE_URL | http://localhost:11434 | (Not needed) |
| OLLAMA_MODEL | deepseek-r1:14b | (Not needed) |
| TOGETHER_API_KEY | (Not needed) | Get from together.ai |

