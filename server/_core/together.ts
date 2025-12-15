/**
 * Together.ai Client Wrapper
 * 
 * Provides OpenAI-compatible interface for Together.ai API
 * Using Llama 3.2 3B Instruct Turbo (free tier: 5M tokens/month)
 * 
 * API Docs: https://docs.together.ai/reference/chat-completions
 * 
 * CONFIGURATION:
 * - Temperature: 0.3-0.5 for factual/structured (assessments, skills)
 * - Temperature: 0.6-0.8 for creative (job descriptions, recommendations)
 * - Temperature: 0.1-0.2 for deterministic (parsing, extraction)
 */

import { InvokeParams, InvokeResult, Message } from './llm';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_BASE_URL = process.env.TOGETHER_BASE_URL || 'https://api.together.xyz/v1';
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.2-3B-Instruct-Turbo';
const TOGETHER_TIMEOUT = parseInt(process.env.TOGETHER_TIMEOUT || '60000'); // 60 seconds for complex tasks

// ============================================================================
// KNOWLEDGE BASE CONTEXT
// Provides domain-specific knowledge for UAE education sector
// ============================================================================

const UAE_EDUCATION_CONTEXT = `
CONTEXT: UAE Ministry of Education (MOE) Talent Management System

KEY FRAMEWORKS:
1. UAE Teacher Licensing Framework:
   - Probationary Teacher (0-2 years)
   - Practicing Teacher (2-4 years)
   - Advanced Teacher (4-7 years)
   - Expert Teacher (7+ years)
   - Lead Teacher / Senior Practitioner

2. UAE Competency Framework for Educators:
   - Professional Knowledge (Subject, Pedagogy, Curriculum)
   - Professional Practice (Planning, Teaching, Assessment)
   - Professional Engagement (Relationships, Development, Ethics)

3. UAE National Standards for Teachers:
   - Standard 1: Knowledge of Students
   - Standard 2: Curriculum Knowledge
   - Standard 3: Instructional Strategies
   - Standard 4: Learning Environment
   - Standard 5: Assessment
   - Standard 6: Professional Learning
   - Standard 7: Professional Conduct

4. Cultural Considerations:
   - Respect for UAE values and traditions
   - Multilingual environment (Arabic, English, others)
   - Inclusive education practices
   - Parent and community engagement
   - Islamic education context where applicable

5. Key Competency Areas:
   - Classroom Management
   - Differentiated Instruction
   - Technology Integration
   - Student Assessment
   - Professional Development
   - Leadership & Mentoring
   - Special Needs Education
   - STEAM Education
`.trim();

// ============================================================================
// TYPES
// ============================================================================

interface TogetherChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string[];
  response_format?: { type: 'json_object' };
}

interface TogetherChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// TOGETHER.AI CLIENT
// ============================================================================

class TogetherClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private isAvailable: boolean = false;

  constructor() {
    this.apiKey = TOGETHER_API_KEY || '';
    this.baseUrl = TOGETHER_BASE_URL;
    this.defaultModel = TOGETHER_MODEL;
    this.isAvailable = !!this.apiKey;

    if (!this.isAvailable) {
      console.warn('[Together.ai] API key not configured. Service will not be available.');
    }
  }

  /**
   * Normalize messages to Together.ai format
   */
  private normalizeMessages(messages: Message[]): Array<{ role: string; content: string }> {
    return messages.map(msg => ({
      role: msg.role,
      content: Array.isArray(msg.content)
        ? msg.content.map(c => typeof c === 'string' ? c : (c as any).text || JSON.stringify(c)).join('\n')
        : typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content),
    }));
  }

  /**
   * Invoke Together.ai chat completion (OpenAI-compatible)
   * 
   * Temperature guidelines:
   * - 0.1-0.3: Parsing, extraction, factual responses
   * - 0.4-0.6: Structured content (assessments, analysis)
   * - 0.7-0.9: Creative content (descriptions, recommendations)
   */
  async invoke(params: InvokeParams & { temperature?: number; includeContext?: boolean }): Promise<InvokeResult> {
    if (!this.isAvailable) {
      throw new Error('Together.ai API key not configured. Set TOGETHER_API_KEY in environment.');
    }

    const {
      messages,
      maxTokens,
      max_tokens,
      responseFormat,
      response_format,
      temperature = 0.5,
      includeContext = true,
    } = params;

    // Normalize messages and optionally inject UAE education context
    let normalizedMessages = this.normalizeMessages(messages);
    
    // Add knowledge base context to system message if requested
    if (includeContext) {
      const systemIdx = normalizedMessages.findIndex(m => m.role === 'system');
      if (systemIdx >= 0) {
        normalizedMessages[systemIdx].content = `${UAE_EDUCATION_CONTEXT}\n\n${normalizedMessages[systemIdx].content}`;
      } else {
        normalizedMessages.unshift({
          role: 'system',
          content: UAE_EDUCATION_CONTEXT,
        });
      }
    }

    // Build request with appropriate temperature
    const request: TogetherChatRequest = {
      model: this.defaultModel,
      messages: normalizedMessages,
      max_tokens: maxTokens || max_tokens || 2048,
      temperature: temperature,
      top_p: 0.9,
    };

    // Handle JSON response format
    const format = responseFormat || response_format;
    if (format?.type === 'json_object' || (format as any)?.type === 'json_schema') {
      request.response_format = { type: 'json_object' };
      
      // Add JSON instruction to system message
      const systemMessage = request.messages.find(m => m.role === 'system');
      if (systemMessage) {
        systemMessage.content += '\n\nYou must respond with valid JSON only. No other text or explanation.';
      } else {
        request.messages.unshift({
          role: 'system',
          content: 'You must respond with valid JSON only. No other text or explanation.',
        });
      }
    }

    try {
      const startTime = Date.now();

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(TOGETHER_TIMEOUT),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Together.ai API error: ${response.status} ${response.statusText} - ${error}`);
      }

      const data: TogetherChatResponse = await response.json();
      const duration = Date.now() - startTime;

      console.log(`[Together.ai] Request completed in ${duration}ms, tokens: ${data.usage.total_tokens}`);

      // Convert to InvokeResult format (OpenAI-compatible)
      return {
        id: data.id,
        created: data.created,
        model: data.model,
        choices: data.choices.map(choice => ({
          index: choice.index,
          message: {
            role: choice.message.role as any,
            content: choice.message.content,
          },
          finish_reason: choice.finish_reason,
        })),
        usage: data.usage,
      };
    } catch (error) {
      console.error('[Together.ai] Request failed:', error);
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
   * Get current model name
   */
  getModel(): string {
    return this.defaultModel;
  }

  /**
   * Test connection with a simple request
   */
  async testConnection(): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }

    try {
      const result = await this.invoke({
        messages: [
          { role: 'user', content: 'Say "OK" if you can read this.' },
        ],
        maxTokens: 10,
      });

      const response = result.choices[0]?.message?.content || '';
      return response.toLowerCase().includes('ok');
    } catch (error) {
      console.error('[Together.ai] Connection test failed:', error);
      return false;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const togetherClient = new TogetherClient();

/**
 * Convenience function for invoking Together.ai
 */
export async function invokeTogether(params: InvokeParams): Promise<InvokeResult> {
  return togetherClient.invoke(params);
}
