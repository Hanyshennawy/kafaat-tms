#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Kafaat TMS - AI Setup Script (Ollama Configuration)

.DESCRIPTION
    This script helps you set up Ollama for local AI features in Kafaat TMS.
    It checks for Ollama installation, downloads required models, and tests the connection.

.EXAMPLE
    .\setup-ai.ps1
#>

param(
    [string]$Model = "llama3.2:3b",
    [switch]$SkipModelPull,
    [switch]$TestOnly
)

Write-Host @"
╔═══════════════════════════════════════════════════════════════════╗
║            🤖 KAFAAT TMS - AI SETUP (OLLAMA)                       ║
╚═══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if Ollama is installed
function Test-OllamaInstalled {
    try {
        $null = Get-Command ollama -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Check if Ollama server is running
function Test-OllamaRunning {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5
        return $true
    } catch {
        return $false
    }
}

# Get list of available models
function Get-OllamaModels {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5
        return $response.models | ForEach-Object { $_.name }
    } catch {
        return @()
    }
}

# Test AI generation
function Test-AIGeneration {
    Write-Host "`n🧪 Testing AI generation..." -ForegroundColor Yellow
    
    try {
        $body = @{
            model = $Model
            messages = @(
                @{
                    role = "user"
                    content = "Say 'Hello Kafaat!' in exactly those words."
                }
            )
            stream = $false
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/chat" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✅ AI Response: $($response.message.content)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ AI test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Step 1: Check Ollama installation
Write-Host "`n📋 Step 1: Checking Ollama installation..." -ForegroundColor Yellow

if (Test-OllamaInstalled) {
    Write-Host "✅ Ollama is installed" -ForegroundColor Green
    $ollamaVersion = ollama --version 2>&1
    Write-Host "   Version: $ollamaVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ Ollama is not installed" -ForegroundColor Red
    Write-Host @"

📥 To install Ollama:
   1. Go to https://ollama.com/download
   2. Download and run the installer for Windows
   3. Run this script again after installation

"@ -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if Ollama server is running
Write-Host "`n📋 Step 2: Checking Ollama server..." -ForegroundColor Yellow

if (Test-OllamaRunning) {
    Write-Host "✅ Ollama server is running" -ForegroundColor Green
} else {
    Write-Host "⚠️ Ollama server is not running" -ForegroundColor Yellow
    Write-Host "   Starting Ollama server..." -ForegroundColor Gray
    
    # Start Ollama in the background
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    
    # Wait for it to start
    $attempts = 0
    while (-not (Test-OllamaRunning) -and $attempts -lt 10) {
        Start-Sleep -Seconds 2
        $attempts++
        Write-Host "   Waiting for server to start... ($attempts/10)" -ForegroundColor Gray
    }
    
    if (Test-OllamaRunning) {
        Write-Host "✅ Ollama server started successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start Ollama server" -ForegroundColor Red
        Write-Host "   Try running 'ollama serve' manually in a new terminal" -ForegroundColor Yellow
        exit 1
    }
}

# Step 3: Check/download model
if (-not $SkipModelPull) {
    Write-Host "`n📋 Step 3: Checking AI model ($Model)..." -ForegroundColor Yellow
    
    $models = Get-OllamaModels
    $modelBase = $Model -replace ":.*", ""
    
    if ($models | Where-Object { $_ -like "$modelBase*" }) {
        Write-Host "✅ Model $Model is available" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Model $Model not found. Downloading..." -ForegroundColor Yellow
        Write-Host "   This may take 5-15 minutes depending on your internet speed" -ForegroundColor Gray
        Write-Host ""
        
        # Pull the model
        ollama pull $Model
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Model downloaded successfully" -ForegroundColor Green
        } else {
            Write-Host "`n❌ Failed to download model" -ForegroundColor Red
            exit 1
        }
    }
}

# Step 4: List available models
Write-Host "`n📋 Step 4: Available models" -ForegroundColor Yellow
$models = Get-OllamaModels
if ($models.Count -gt 0) {
    Write-Host "   Installed models:" -ForegroundColor Gray
    foreach ($m in $models) {
        if ($m -eq $Model -or $m -like "$($Model)*") {
            Write-Host "   ✓ $m (selected)" -ForegroundColor Green
        } else {
            Write-Host "   • $m" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   No models installed" -ForegroundColor Yellow
}

# Step 5: Test AI generation
Write-Host "`n📋 Step 5: Testing AI generation..." -ForegroundColor Yellow

if (Test-AIGeneration) {
    Write-Host "`n✅ AI is ready to use!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ AI test failed, but setup is complete" -ForegroundColor Yellow
    Write-Host "   The model may still be loading. Try again in a minute." -ForegroundColor Gray
}

# Final instructions
Write-Host @"

╔═══════════════════════════════════════════════════════════════════╗
║                    🎉 SETUP COMPLETE!                              ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Ollama is now configured for Kafaat TMS AI features.             ║
║                                                                   ║
║  Environment Variables (optional - defaults work fine):           ║
║    OLLAMA_BASE_URL=http://localhost:11434                         ║
║    OLLAMA_MODEL=$Model                                            ║
║    AI_PROVIDER=ollama                                             ║
║                                                                   ║
║  To start the app:                                                ║
║    npm run dev                                                    ║
║                                                                   ║
║  Recommended models by use case:                                  ║
║    • llama3.2:3b  - Fast, good balance (default)                  ║
║    • llama3.1:8b  - Better quality, slower                        ║
║    • mistral:7b   - Great for JSON tasks                          ║
║    • qwen2.5:7b   - Good reasoning                                ║
║                                                                   ║
║  To download additional models:                                   ║
║    ollama pull <model-name>                                       ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
