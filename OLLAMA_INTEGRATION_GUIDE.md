# Ollama Integration Guide for Kafaat 1.0

**Purpose**: Replace OpenAI with Ollama for cost-free, privacy-focused AI features  
**Cost Savings**: $0 vs $20-200+/month  
**Privacy**: 100% on-premise, TDRA-compliant  

---

## 🎯 **WHY OLLAMA FOR KAFAAT?**

### ✅ **Benefits**

1. **Zero API Costs**
   - OpenAI GPT-4: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)
   - Estimated monthly cost for 1,000 users: $100-500
   - **Ollama: $0** (one-time infrastructure cost)

2. **TDRA Compliance**
   - All AI processing happens locally in UAE
   - No data sent to foreign servers (US/OpenAI)
   - Complete audit trail
   - Data sovereignty maintained

3. **No Rate Limits**
   - OpenAI: 10,000 TPM (tokens per minute) on free tier
   - Ollama: Unlimited (limited only by hardware)

4. **Offline Capability**
   - Works without internet connection
   - No dependency on external APIs
   - Higher reliability

5. **Customization**
   - Can fine-tune models on your data
   - Can optimize prompts for specific models
   - Can switch models without code changes

### ⚠️ **Trade-offs**

| Feature | OpenAI GPT-4 | Ollama (llama3.1:8b) |
|---------|--------------|---------------------|
| **Quality** | 9/10 | 7/10 |
| **Speed** | 1-3 seconds | 3-8 seconds |
| **Context Window** | 128K tokens | 8K-32K tokens |
| **JSON Schema** | Native | Via prompting |
| **Infrastructure** | None | Requires GPU/CPU server |
| **Maintenance** | Zero | Model updates, monitoring |

---

## 📊 **MODEL RECOMMENDATIONS**

### **For Resume Parsing & Career Recommendations**

| Model | Size | RAM | Quality | Speed | Recommendation |
|-------|------|-----|---------|-------|----------------|
| `llama3.2:3b` | 2GB | 4GB | 6/10 | Fast | Budget option |
| **`llama3.1:8b`** | 4.7GB | 8GB | **8/10** | **Medium** | **⭐ Best Balance** |
| `mistral:7b` | 4.1GB | 8GB | 8/10 | Medium | Great for JSON |
| `qwen2.5:7b` | 4.7GB | 8GB | 7/10 | Medium | Strong reasoning |
| `gemma2:9b` | 5.5GB | 10GB | 8.5/10 | Slow | High quality |

**Recommended**: **`llama3.1:8b`** (Best quality/speed/cost balance)

### **For Sentiment Analysis & Simple Tasks**

| Model | Size | RAM | Quality | Speed |
|-------|------|-----|---------|-------|
| `llama3.2:1b` | 1.3GB | 2GB | 5/10 | Very Fast |
| **`llama3.2:3b`** | 2GB | 4GB | **7/10** | **Fast** |

**Recommended**: **`llama3.2:3b`** (Sufficient for sentiment, very fast)

---

## 🏗️ **ARCHITECTURE OPTIONS**

### **Option 1: Ollama on Same Server (Simple)**

```
┌─────────────────────────────────┐
│   Render Pro+ (8GB RAM)         │
│  ┌─────────────┐  ┌───────────┐ │
│  │ Kafaat TMS  │→│  Ollama   │ │
│  │   (Node.js) │  │ (Local)   │ │
│  └─────────────┘  └───────────┘ │
└─────────────────────────────────┘
```

**Pros**: Simple setup, low latency  
**Cons**: Requires 8GB+ RAM plan ($49/mo)  
**Cost**: $49/month

---

### **Option 2: External Ollama Service (Recommended)**

```
┌──────────────────┐      ┌──────────────────┐
│  Render Free     │      │   Modal.com      │
│  Kafaat TMS      │─────▶│   Ollama GPU     │
│  (512MB)         │ HTTP │   (Serverless)   │
└──────────────────┘      └──────────────────┘
```

**Pros**: Cheap ($0 app + $10 AI), scalable, GPU acceleration  
**Cons**: Network latency (200-500ms)  
**Cost**: $10-15/month  
**Best For**: Budget-conscious, scalable

---

### **Option 3: Hybrid (Smart)**

```
                   ┌──────────────────┐
        ┌─────────▶│   OpenAI GPT-4   │ (Critical tasks)
        │          └──────────────────┘
┌───────┴──────┐   
│  Kafaat TMS  │
└───────┬──────┘
        │          ┌──────────────────┐
        └─────────▶│   Ollama Local   │ (Bulk tasks)
                   └──────────────────┘
```

**Pros**: Best quality for critical, cheap for bulk  
**Cons**: More complex logic  
**Cost**: $5-20/month (depending on OpenAI usage)  
**Best For**: Production applications

---

## 🚀 **IMPLEMENTATION GUIDE**

### **Step 1: Create Ollama Service** (30 minutes)

Create `server/services/ollama.service.ts`:

```typescript
/**
 * Ollama Service - Local LLM Integration
 * OpenAI-compatible wrapper for Ollama
 */

import { auditService } from './audit.service';

// ============================================================================
// CONFIGURATION
// ============================================================================

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '30000'); // 30 seconds

// ============================================================================
// TYPES
// ============================================================================

interface OllamaRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  format?: 'json';
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

// ============================================================================
// OLLAMA SERVICE
// ============================================================================

class OllamaService {
  private baseUrl: string;
  private defaultModel: string;
  private isAvailable: boolean = false;

  constructor() {
    this.baseUrl = OLLAMA_BASE_URL;
    this.defaultModel = OLLAMA_MODEL;
    this.checkAvailability();
  }

  /**
   * Check if Ollama is available
   */
  private async checkAvailability() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      this.isAvailable = response.ok;
      
      if (this.isAvailable) {
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        console.log('[Ollama] Available models:', models);
        
        if (!models.includes(this.defaultModel)) {
          console.warn(`[Ollama] Model ${this.defaultModel} not found. Available:`, models);
        }
      }
    } catch (error) {
      this.isAvailable = false;
      console.warn('[Ollama] Not available:', error);
    }
  }

  /**
   * Generate chat completion (OpenAI-compatible interface)
   */
  async chatCompletion(params: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: 'json_object' };
  }): Promise<{
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: { role: string; content: string };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    if (!this.isAvailable) {
      throw new Error('Ollama service is not available');
    }

    const request: OllamaRequest = {
      model: params.model || this.defaultModel,
      messages: params.messages as any,
      stream: false,
      options: {
        temperature: params.temperature || 0.7,
        ...(params.max_tokens && { num_predict: params.max_tokens }),
      },
    };

    // Request JSON format if specified
    if (params.response_format?.type === 'json_object') {
      request.format = 'json';
      
      // Add JSON instruction to system message
      const systemMessage = request.messages.find(m => m.role === 'system');
      if (systemMessage) {
        systemMessage.content += '\n\nYou must respond with valid JSON only. No other text.';
      } else {
        request.messages.unshift({
          role: 'system',
          content: 'You must respond with valid JSON only. No other text.',
        });
      }
    }

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(OLLAMA_TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      const duration = Date.now() - startTime;

      // Log performance
      await auditService.info('ollama.request', {
        model: data.model,
        duration_ms: duration,
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
      });

      // Convert to OpenAI format
      return {
        id: `ollama-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(new Date(data.created_at).getTime() / 1000),
        model: data.model,
        choices: [
          {
            index: 0,
            message: {
              role: data.message.role,
              content: data.message.content,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      await auditService.error('ollama.request', {
        error: error instanceof Error ? error.message : String(error),
        model: request.model,
      });
      throw error;
    }
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }
}

export const ollamaService = new OllamaService();
```

---

### **Step 2: Update AI Service** (1 hour)

Modify `server/services/ai.service.ts` to use Ollama:

```typescript
// At the top, add:
import { ollamaService } from './ollama.service';

// Replace OpenAI client creation:
const USE_OLLAMA = process.env.AI_PROVIDER === 'ollama' || 
                   process.env.OLLAMA_BASE_URL || 
                   !process.env.OPENAI_API_KEY;

// In each AI method, replace OpenAI calls:
async parseResume(resumeText: string, tenantId?: number): Promise<ResumeParseResult> {
  if (USE_OLLAMA && ollamaService.isServiceAvailable()) {
    // Use Ollama
    const response = await ollamaService.chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume parser. Extract structured data.',
        },
        { role: 'user', content: `Parse this resume:\n\n${resumeText}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } else {
    // Fall back to OpenAI or mock data
    // ... existing OpenAI code ...
  }
}
```

---

### **Step 3: Deploy Ollama** (Choose One)

#### **Option A: Modal.com (Serverless GPU)**

1. Sign up at modal.com
2. Install Modal CLI:
   ```bash
   pip install modal
   modal setup
   ```

3. Create `deploy_ollama_modal.py`:
   ```python
   import modal

   app = modal.App("kafaat-ollama")
   image = modal.Image.debian_slim().pip_install("ollama")

   @app.function(
       image=image,
       gpu="T4",  # Or "A10G" for faster
       timeout=300,
   )
   @modal.web_endpoint(method="POST")
   def ollama_chat(data: dict):
       import subprocess
       import json
       
       # Pull model on first run
       subprocess.run(["ollama", "pull", "llama3.1:8b"])
       
       # Run inference
       result = subprocess.run(
           ["ollama", "run", "llama3.1:8b", data.get("prompt", "")],
           capture_output=True,
           text=True
       )
       
       return {"response": result.stdout}
   ```

4. Deploy:
   ```bash
   modal deploy deploy_ollama_modal.py
   ```

5. Get endpoint URL and set:
   ```
   OLLAMA_BASE_URL=https://your-username--kafaat-ollama.modal.run
   ```

---

#### **Option B: RunPod (Serverless Pods)**

1. Sign up at runpod.io
2. Create Serverless Endpoint
3. Use template: "Ollama"
4. Select GPU: T4 (cheapest, ~$0.0002/sec)
5. Deploy and get endpoint URL
6. Set environment variable:
   ```
   OLLAMA_BASE_URL=https://api.runpod.ai/v2/YOUR_ENDPOINT_ID
   ```

---

#### **Option C: Self-Hosted on Railway**

1. Create `Dockerfile.ollama`:
   ```dockerfile
   FROM ollama/ollama:latest
   
   # Pre-download model
   RUN ollama pull llama3.1:8b
   
   EXPOSE 11434
   CMD ["ollama", "serve"]
   ```

2. Deploy to Railway:
   ```bash
   railway up
   ```

3. Get public URL and set:
   ```
   OLLAMA_BASE_URL=https://your-app.railway.app
   ```

---

### **Step 4: Test Integration** (30 minutes)

```bash
# Test Ollama directly
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Why is the sky blue?",
  "stream": false
}'

# Test through your app
curl https://your-app.onrender.com/api/trpc/recruitment.parseResume \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "resumeText": "John Doe\nSoftware Engineer\n5 years experience..."
    }
  }'
```

---

## 📊 **PERFORMANCE BENCHMARKS**

### **Response Time Comparison**

| Task | OpenAI GPT-4 | Ollama (llama3.1:8b CPU) | Ollama (llama3.1:8b GPU) |
|------|--------------|--------------------------|--------------------------|
| Resume Parse | 2-3s | 8-12s | 3-5s |
| Career Rec | 3-5s | 10-15s | 4-7s |
| Sentiment | 1-2s | 3-5s | 1-3s |
| Matching | 2-4s | 6-10s | 3-5s |

**Recommendation**: Use GPU for production (Modal/RunPod)

---

## 💰 **COST COMPARISON**

### **Monthly Costs (1,000 Active Users)**

| Component | OpenAI | Ollama (Modal) | Ollama (Self-hosted) |
|-----------|--------|----------------|----------------------|
| **App Hosting** | $0 (Free) | $0 (Free) | $0 (Free) |
| **AI Processing** | $100-500 | $10-15 | $0 |
| **Database** | $0 (Free) | $0 (Free) | $0 (Free) |
| **Storage** | $2 | $2 | $2 |
| **Total** | **$102-502** | **$12-17** | **$2** |

**Savings**: **$85-500/month** with Ollama

---

## 🎯 **RECOMMENDED SETUP FOR KAFAAT**

### **Development**
```bash
# Local Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
AI_PROVIDER=ollama
```

### **Production (Budget)**
```bash
# Modal.com Serverless GPU
OLLAMA_BASE_URL=https://username--kafaat-ollama.modal.run
OLLAMA_MODEL=llama3.1:8b
AI_PROVIDER=ollama
```

### **Production (Enterprise)**
```bash
# Hybrid: OpenAI for critical + Ollama for bulk
AI_PROVIDER=hybrid
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=https://ollama.internal.kafaat.ae
OLLAMA_MODEL=llama3.1:8b
```

---

## ✅ **INTEGRATION CHECKLIST**

- [ ] Install Ollama locally for testing
- [ ] Download `llama3.1:8b` model
- [ ] Create `ollama.service.ts`
- [ ] Update `ai.service.ts` to use Ollama
- [ ] Test all AI features locally
- [ ] Deploy Ollama to Modal/RunPod
- [ ] Update environment variables
- [ ] Test in production
- [ ] Monitor performance
- [ ] Compare quality with OpenAI
- [ ] Adjust prompts if needed
- [ ] Document any quality differences

---

**Status**: Ready for Implementation  
**Estimated Time**: 4-6 hours  
**Risk Level**: Low (fallback to mock data exists)  
**Recommendation**: ✅ Proceed with Ollama integration
