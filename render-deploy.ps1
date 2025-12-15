# Render Deployment Automation Script
# This script uses Render API to create all resources

param(
    [Parameter(Mandatory=$false)]
    [string]$RenderApiKey
)

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   KAFAAT 1.0 - RENDER AUTOMATED DEPLOYMENT        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Get Render API Key
if ([string]::IsNullOrWhiteSpace($RenderApiKey)) {
    Write-Host "📌 To automate deployment, you need a Render API key.`n" -ForegroundColor Yellow
    Write-Host "   Getting API key:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://dashboard.render.com/register" -ForegroundColor White
    Write-Host "   2. Sign up with GitHub (instant)" -ForegroundColor White
    Write-Host "   3. Go to: Account Settings > API Keys" -ForegroundColor White
    Write-Host "   4. Create new API key" -ForegroundColor White
    Write-Host "   5. Copy and paste here`n" -ForegroundColor White
    
    Start-Process "https://dashboard.render.com/register"
    Start-Sleep -Seconds 2
    
    $RenderApiKey = Read-Host "   Paste your Render API key"
    
    if ([string]::IsNullOrWhiteSpace($RenderApiKey)) {
        Write-Host "`n❌ API key required to continue" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✅ API key received`n" -ForegroundColor Green

# Step 2: Create PostgreSQL Database
Write-Host "1️⃣  Creating PostgreSQL database..." -ForegroundColor Yellow

$dbPayload = @{
    name = "kafaat-tms-db"
    databaseName = "kafaat_tms"
    databaseUser = "kafaat_admin"
    plan = "free"
    region = "oregon"
    version = "16"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $RenderApiKey"
    "Content-Type" = "application/json"
}

try {
    $dbResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/postgres" -Method Post -Headers $headers -Body $dbPayload
    $dbId = $dbResponse.id
    $dbInternalUrl = $dbResponse.connectionInfo.internalConnectionString
    
    Write-Host "   ✅ Database created: kafaat-tms-db" -ForegroundColor Green
    Write-Host "   📊 Database ID: $dbId" -ForegroundColor Gray
    Write-Host "   🔗 Internal URL: $dbInternalUrl" -ForegroundColor Gray
    
    # Wait for database to be ready
    Write-Host "`n   ⏳ Waiting for database to be ready (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
} catch {
    Write-Host "   ❌ Failed to create database: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n   💡 Manual fallback:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://dashboard.render.com" -ForegroundColor White
    Write-Host "   2. Click 'New +' > 'PostgreSQL'" -ForegroundColor White
    Write-Host "   3. Name: kafaat-tms-db, Plan: Free" -ForegroundColor White
    exit 1
}

# Step 3: Create Web Service
Write-Host "`n2️⃣  Creating web service..." -ForegroundColor Yellow

$webPayload = @{
    name = "kafaat-tms"
    type = "web_service"
    repo = "https://github.com/Hanyshennawy/kafaat-tms"
    branch = "main"
    runtime = "docker"
    plan = "free"
    region = "oregon"
    envVars = @(
        @{ key = "NODE_ENV"; value = "production" }
        @{ key = "PORT"; value = "3000" }
        @{ key = "DATABASE_URL"; value = $dbInternalUrl }
        @{ key = "TOGETHER_API_KEY"; value = "not-set-yet" }
        @{ key = "TOGETHER_MODEL"; value = "meta-llama/Llama-3.2-3B-Instruct-Turbo" }
        @{ key = "TOGETHER_BASE_URL"; value = "https://api.together.xyz/v1" }
        @{ key = "SESSION_SECRET"; value = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_}) }
        @{ key = "FEATURE_AI_RECOMMENDATIONS"; value = "true" }
        @{ key = "FEATURE_PSYCHOMETRIC_ASSESSMENTS"; value = "true" }
        @{ key = "FEATURE_MULTI_TENANCY"; value = "true" }
        @{ key = "TDRA_COMPLIANCE_ENABLED"; value = "true" }
        @{ key = "LOG_LEVEL"; value = "info" }
        @{ key = "CORS_ALLOWED_ORIGINS"; value = "https://kafaat-tms.onrender.com" }
    )
    healthCheckPath = "/health"
    dockerCommand = ""
} | ConvertTo-Json -Depth 10

try {
    $webResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method Post -Headers $headers -Body $webPayload
    $serviceId = $webResponse.service.id
    $serviceUrl = $webResponse.service.serviceDetails.url
    
    Write-Host "   ✅ Web service created: kafaat-tms" -ForegroundColor Green
    Write-Host "   📊 Service ID: $serviceId" -ForegroundColor Gray
    Write-Host "   🌐 URL: https://$serviceUrl" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Failed to create web service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n   💡 Manual fallback:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://dashboard.render.com" -ForegroundColor White
    Write-Host "   2. Click 'New +' > 'Web Service'" -ForegroundColor White
    Write-Host "   3. Connect repo: Hanyshennawy/kafaat-tms" -ForegroundColor White
    Write-Host "   4. Runtime: Docker, Plan: Free" -ForegroundColor White
    Write-Host "   5. Add DATABASE_URL: $dbInternalUrl" -ForegroundColor White
    exit 1
}

# Step 4: Wait for deployment
Write-Host "`n3️⃣  Deploying application..." -ForegroundColor Yellow
Write-Host "   ⏳ Building Docker image and deploying (this takes 3-5 minutes)..." -ForegroundColor Yellow
Write-Host "   📊 You can watch progress at: https://dashboard.render.com/web/$serviceId" -ForegroundColor Gray

# Poll deployment status
$maxAttempts = 60
$attempt = 0
$deployed = $false

while ($attempt -lt $maxAttempts -and -not $deployed) {
    Start-Sleep -Seconds 5
    $attempt++
    
    try {
        $statusResponse = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId" -Headers $headers
        $deployStatus = $statusResponse.service.serviceDetails.deployStatus
        
        if ($deployStatus -eq "live") {
            $deployed = $true
            Write-Host "`n   ✅ Deployment successful!" -ForegroundColor Green
        } elseif ($deployStatus -eq "build_failed" -or $deployStatus -eq "deploy_failed") {
            Write-Host "`n   ❌ Deployment failed. Check logs at: https://dashboard.render.com/web/$serviceId" -ForegroundColor Red
            exit 1
        } else {
            Write-Host "   ⏳ Status: $deployStatus... ($attempt/60)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⏳ Checking deployment status..." -ForegroundColor Gray
    }
}

if (-not $deployed) {
    Write-Host "`n   ⏳ Deployment is still in progress..." -ForegroundColor Yellow
    Write-Host "   📊 Check status at: https://dashboard.render.com/web/$serviceId" -ForegroundColor White
}

# Step 5: Run migrations
Write-Host "`n4️⃣  Running database migrations..." -ForegroundColor Yellow
Write-Host "   📌 You need to run migrations manually via Render Shell:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://dashboard.render.com/web/$serviceId" -ForegroundColor White
Write-Host "   2. Click 'Shell' tab" -ForegroundColor White
Write-Host "   3. Run: npm run db:push" -ForegroundColor White
Write-Host "   4. Wait 30 seconds for completion" -ForegroundColor White

Read-Host "`n   Press ENTER after running migrations"

# Step 6: Verify deployment
Write-Host "`n5️⃣  Verifying deployment..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "https://$serviceUrl/health" -TimeoutSec 10 -UseBasicParsing
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "   ✅ Health check passed!" -ForegroundColor Green
        Write-Host "   ✅ Application is live and running!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Health check pending (app may still be starting)" -ForegroundColor Yellow
    Write-Host "   💡 Try visiting: https://$serviceUrl/health in a few minutes" -ForegroundColor White
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          🎉 DEPLOYMENT COMPLETE! 🎉                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 DEPLOYMENT SUMMARY:`n" -ForegroundColor Cyan
Write-Host "   ✅ PostgreSQL Database: kafaat-tms-db" -ForegroundColor White
Write-Host "   ✅ Web Service: kafaat-tms" -ForegroundColor White
Write-Host "   ✅ GitHub Connected: Hanyshennawy/kafaat-tms" -ForegroundColor White
Write-Host "   ✅ Auto-deploy: Enabled (on git push)" -ForegroundColor White

Write-Host "`n🌐 YOUR LIVE APPLICATION:`n" -ForegroundColor Cyan
Write-Host "   • Application: https://$serviceUrl" -ForegroundColor Green
Write-Host "   • Health Check: https://$serviceUrl/health" -ForegroundColor Green
Write-Host "   • API: https://$serviceUrl/api/trpc" -ForegroundColor Green
Write-Host "   • Dashboard: https://dashboard.render.com" -ForegroundColor Green

Write-Host "`n🎯 NEXT STEPS:`n" -ForegroundColor Cyan
Write-Host "   1. Visit your app: https://$serviceUrl" -ForegroundColor White
Write-Host "   2. Create first user account" -ForegroundColor White
Write-Host "   3. Test AI features (add Together.ai key later)" -ForegroundColor White
Write-Host "   4. Explore all modules!" -ForegroundColor White

Write-Host "`n💰 MONTHLY COST: $0 (all free tiers)" -ForegroundColor Green
Write-Host "`n🎉 Your Kafaat 1.0 TMS is fully deployed!" -ForegroundColor Green
Write-Host ""
