/**
 * Examus Proctoring Integration Service
 * 
 * Provides AI-powered exam proctoring through integration with Examus.
 * Features include:
 * - Person identification through ID AI or by human
 * - Face Recognition
 * - Gaze detection
 * - Speech detection
 * - Absence detection
 * - Unauthorized person detection
 * - Browser Tab change detection
 * - Earphone detection
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up for Examus at: https://examus.com
 * 2. Obtain API credentials from Examus dashboard
 * 3. Add the following environment variables:
 *    - EXAMUS_API_URL=https://api.examus.com
 *    - EXAMUS_API_KEY=your_api_key
 *    - EXAMUS_API_SECRET=your_api_secret
 *    - EXAMUS_ORGANIZATION_ID=your_org_id
 * 
 * INTEGRATION STATUS: DISABLED (Enable after testing)
 */

interface ExamusConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
  organizationId: string;
  enabled: boolean;
}

interface ProctorSettings {
  faceRecognition: boolean;
  gazeDetection: boolean;
  speechDetection: boolean;
  absenceDetection: boolean;
  additionalPersonDetection: boolean;
  browserTabDetection: boolean;
  earphoneDetection: boolean;
  idVerification: boolean;
  cheatThresholdScore: number; // 0-100
}

interface ExamSession {
  sessionId: string;
  examId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  proctorUrl: string;
  violations: ProctorViolation[];
}

interface ProctorViolation {
  id: string;
  type: 'face_not_visible' | 'multiple_faces' | 'gaze_away' | 'speech_detected' | 
        'absence' | 'tab_switch' | 'earphone_detected' | 'id_mismatch';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  screenshot?: string;
  reviewed: boolean;
  approved: boolean;
}

interface ProctorReport {
  sessionId: string;
  overallScore: number;
  trustScore: number;
  violations: ProctorViolation[];
  summary: {
    totalViolations: number;
    criticalViolations: number;
    highViolations: number;
    mediumViolations: number;
    lowViolations: number;
  };
  recommendation: 'approve' | 'review' | 'reject';
}

export class ExamusProctorService {
  private config: ExamusConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.EXAMUS_API_URL || 'https://api.examus.com',
      apiKey: process.env.EXAMUS_API_KEY || '',
      apiSecret: process.env.EXAMUS_API_SECRET || '',
      organizationId: process.env.EXAMUS_ORGANIZATION_ID || '',
      // DISABLED by default - enable after testing
      enabled: process.env.EXAMUS_ENABLED === 'true',
    };

    if (this.config.enabled) {
      if (!this.config.apiKey || !this.config.apiSecret) {
        console.warn(
          '[Examus] Proctoring credentials not configured. ' +
          'Please add EXAMUS_API_KEY, EXAMUS_API_SECRET, and EXAMUS_ORGANIZATION_ID.'
        );
      } else {
        console.log('[Examus] Proctoring service configured');
      }
    } else {
      console.log('[Examus] Proctoring integration is DISABLED. Set EXAMUS_ENABLED=true to enable.');
    }
  }

  /**
   * Check if proctoring is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled && !!this.config.apiKey && !!this.config.apiSecret;
  }

  /**
   * Get default proctor settings
   */
  getDefaultSettings(): ProctorSettings {
    return {
      faceRecognition: true,
      gazeDetection: true,
      speechDetection: true,
      absenceDetection: true,
      additionalPersonDetection: true,
      browserTabDetection: true,
      earphoneDetection: true,
      idVerification: true,
      cheatThresholdScore: 70,
    };
  }

  /**
   * Create a proctored exam session
   */
  async createSession(params: {
    examId: string;
    examTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    startTime: Date;
    duration: number; // in minutes
    settings?: Partial<ProctorSettings>;
  }): Promise<ExamSession> {
    if (!this.isEnabled()) {
      throw new Error('Proctoring is not enabled');
    }

    const settings = { ...this.getDefaultSettings(), ...params.settings };

    try {
      const response = await fetch(`${this.config.apiUrl}/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-API-Secret': this.config.apiSecret,
          'X-Organization-Id': this.config.organizationId,
        },
        body: JSON.stringify({
          exam_id: params.examId,
          exam_title: params.examTitle,
          user_id: params.userId,
          user_name: params.userName,
          user_email: params.userEmail,
          scheduled_start: params.startTime.toISOString(),
          duration_minutes: params.duration,
          settings: {
            face_recognition: settings.faceRecognition,
            gaze_detection: settings.gazeDetection,
            speech_detection: settings.speechDetection,
            absence_detection: settings.absenceDetection,
            additional_person_detection: settings.additionalPersonDetection,
            browser_tab_detection: settings.browserTabDetection,
            earphone_detection: settings.earphoneDetection,
            id_verification: settings.idVerification,
            cheat_threshold: settings.cheatThresholdScore,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Examus API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        sessionId: data.session_id,
        examId: params.examId,
        userId: params.userId,
        startTime: params.startTime,
        status: 'scheduled',
        proctorUrl: data.proctor_url,
        violations: [],
      };
    } catch (error) {
      console.error('[Examus] Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Get session status and violations
   */
  async getSession(sessionId: string): Promise<ExamSession> {
    if (!this.isEnabled()) {
      throw new Error('Proctoring is not enabled');
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/v1/sessions/${sessionId}`, {
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-API-Secret': this.config.apiSecret,
          'X-Organization-Id': this.config.organizationId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get session: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        sessionId: data.session_id,
        examId: data.exam_id,
        userId: data.user_id,
        startTime: new Date(data.start_time),
        endTime: data.end_time ? new Date(data.end_time) : undefined,
        status: data.status,
        proctorUrl: data.proctor_url,
        violations: data.violations?.map((v: any) => ({
          id: v.id,
          type: v.type,
          timestamp: new Date(v.timestamp),
          severity: v.severity,
          screenshot: v.screenshot_url,
          reviewed: v.reviewed,
          approved: v.approved,
        })) || [],
      };
    } catch (error) {
      console.error('[Examus] Failed to get session:', error);
      throw error;
    }
  }

  /**
   * Get proctoring report for a session
   */
  async getReport(sessionId: string): Promise<ProctorReport> {
    if (!this.isEnabled()) {
      throw new Error('Proctoring is not enabled');
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/v1/sessions/${sessionId}/report`, {
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-API-Secret': this.config.apiSecret,
          'X-Organization-Id': this.config.organizationId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get report: ${response.statusText}`);
      }

      const data = await response.json();

      const violations = data.violations?.map((v: any) => ({
        id: v.id,
        type: v.type,
        timestamp: new Date(v.timestamp),
        severity: v.severity,
        screenshot: v.screenshot_url,
        reviewed: v.reviewed,
        approved: v.approved,
      })) || [];

      return {
        sessionId,
        overallScore: data.overall_score,
        trustScore: data.trust_score,
        violations,
        summary: {
          totalViolations: violations.length,
          criticalViolations: violations.filter((v: ProctorViolation) => v.severity === 'critical').length,
          highViolations: violations.filter((v: ProctorViolation) => v.severity === 'high').length,
          mediumViolations: violations.filter((v: ProctorViolation) => v.severity === 'medium').length,
          lowViolations: violations.filter((v: ProctorViolation) => v.severity === 'low').length,
        },
        recommendation: data.recommendation,
      };
    } catch (error) {
      console.error('[Examus] Failed to get report:', error);
      throw error;
    }
  }

  /**
   * Review and approve/reject a violation
   */
  async reviewViolation(sessionId: string, violationId: string, approved: boolean): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error('Proctoring is not enabled');
    }

    try {
      const response = await fetch(
        `${this.config.apiUrl}/v1/sessions/${sessionId}/violations/${violationId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey,
            'X-API-Secret': this.config.apiSecret,
            'X-Organization-Id': this.config.organizationId,
          },
          body: JSON.stringify({ approved }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to review violation: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Examus] Failed to review violation:', error);
      throw error;
    }
  }

  /**
   * Cancel a proctored session
   */
  async cancelSession(sessionId: string): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error('Proctoring is not enabled');
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/v1/sessions/${sessionId}/cancel`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-API-Secret': this.config.apiSecret,
          'X-Organization-Id': this.config.organizationId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel session: ${response.statusText}`);
      }
    } catch (error) {
      console.error('[Examus] Failed to cancel session:', error);
      throw error;
    }
  }

  /**
   * Get configuration status for admin panel
   */
  getStatus(): {
    enabled: boolean;
    configured: boolean;
    message: string;
  } {
    const configured = !!this.config.apiKey && !!this.config.apiSecret;
    
    return {
      enabled: this.config.enabled,
      configured,
      message: this.config.enabled
        ? configured
          ? 'Examus proctoring is enabled and configured'
          : 'Examus enabled but not configured'
        : 'Examus proctoring is disabled',
    };
  }
}

// Export singleton instance
export const proctorService = new ExamusProctorService();
