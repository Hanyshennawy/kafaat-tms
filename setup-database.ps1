# ============================================================
# Kafaat TMS - Database Setup Script
# ============================================================
# Run this script to create the database for local development
# 
# USAGE:
#   .\setup-database.ps1 -Password "your_postgres_password"
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Password
)

$ErrorActionPreference = "Stop"
$PsqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$CreateDbPath = "C:\Program Files\PostgreSQL\17\bin\createdb.exe"

Write-Host "🔧 Kafaat TMS Database Setup" -ForegroundColor Cyan
Write-Host "=" * 50

# Set password in environment
$env:PGPASSWORD = $Password

# Check connection
Write-Host "`n📡 Testing PostgreSQL connection..." -ForegroundColor Yellow
try {
    $result = & $PsqlPath -U postgres -h localhost -c "SELECT 1" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Connection failed: $result"
    }
    Write-Host "✅ Connected to PostgreSQL" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to connect to PostgreSQL" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Check if database exists
Write-Host "`n🔍 Checking if kafaat_tms database exists..." -ForegroundColor Yellow
$dbExists = & $PsqlPath -U postgres -h localhost -tc "SELECT 1 FROM pg_database WHERE datname = 'kafaat_tms'" 2>&1
if ($dbExists -match "1") {
    Write-Host "✅ Database kafaat_tms already exists" -ForegroundColor Green
} else {
    Write-Host "📦 Creating kafaat_tms database..." -ForegroundColor Yellow
    & $CreateDbPath -U postgres -h localhost kafaat_tms
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

# Update .env file
Write-Host "`n📝 Updating .env file..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot ".env"
$envContent = Get-Content $envPath -Raw
$newDbUrl = "DATABASE_URL=postgresql://postgres:$Password@localhost:5432/kafaat_tms"
$envContent = $envContent -replace "DATABASE_URL=postgresql://[^`n]+", $newDbUrl
Set-Content -Path $envPath -Value $envContent
Write-Host "✅ .env updated with database connection" -ForegroundColor Green

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Host "`nNext steps:"
Write-Host "  1. Run migrations: npm run db:push"
Write-Host "  2. Start server: npm run dev"
Write-Host "  3. Open: http://localhost:3000"
