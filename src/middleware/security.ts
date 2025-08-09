// middleware/security.ts
import { SecurityValidator } from '@/utils/security';
import { getSecurityConfig, reportSecurityThreat } from '@/config/security';

export interface ApiRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
}

export interface SecurityMiddlewareResult {
  allowed: boolean;
  sanitizedBody?: any;
  warnings: string[];
  blocked: string[];
}

export class SecurityMiddleware {
  private static config = getSecurityConfig();

  /**
   * API çağrısı öncesi güvenlik kontrolü
   */
  static async validateApiRequest(request: ApiRequest): Promise<SecurityMiddlewareResult> {
    const warnings: string[] = [];
    const blocked: string[] = [];
    let sanitizedBody = request.body;

    // Rate limiting kontrolü
    if (this.config.enableRateLimit) {
      const userId = this.getUserId();
      
      if (request.url.includes('/check-text')) {
        if (!SecurityValidator.checkRateLimit(
          userId, 
          this.config.rateLimit.textCheck.requests,
          this.config.rateLimit.textCheck.timeWindow
        )) {
          blocked.push('Rate limit exceeded for text checking');
          this.reportThreat('rate_limit', 'high', 'Text check rate limit exceeded');
          return { allowed: false, warnings, blocked };
        }
      }
      
      if (request.url.includes('/upload')) {
        if (!SecurityValidator.checkRateLimit(
          userId,
          this.config.rateLimit.fileUpload.requests,
          this.config.rateLimit.fileUpload.timeWindow
        )) {
          blocked.push('Rate limit exceeded for file uploads');
          this.reportThreat('rate_limit', 'high', 'File upload rate limit exceeded');
          return { allowed: false, warnings, blocked };
        }
      }
    }

    // Request header kontrolü
    const headerValidation = this.validateHeaders(request.headers);
    warnings.push(...headerValidation.warnings);
    blocked.push(...headerValidation.blocked);

    if (headerValidation.blocked.length > 0) {
      return { allowed: false, warnings, blocked };
    }

    // Body içeriği kontrolü
    if (request.body) {
      const bodyValidation = await this.validateRequestBody(request.body);
      warnings.push(...bodyValidation.warnings);
      blocked.push(...bodyValidation.blocked);
      
      if (bodyValidation.blocked.length > 0) {
        return { allowed: false, warnings, blocked };
      }
      
      sanitizedBody = bodyValidation.sanitizedBody;
    }

    // URL kontrolü
    const urlValidation = this.validateUrl(request.url);
    warnings.push(...urlValidation.warnings);
    blocked.push(...urlValidation.blocked);

    if (urlValidation.blocked.length > 0) {
      return { allowed: false, warnings, blocked };
    }

    // Uyarıları raporla
    warnings.forEach(warning => {
      this.reportThreat('api_warning', 'low', warning);
    });

    return {
      allowed: true,
      sanitizedBody,
      warnings,
      blocked
    };
  }

  /**
   * Request header'larını kontrol et
   */
  private static validateHeaders(headers: Record<string, string>) {
    const warnings: string[] = [];
    const blocked: string[] = [];

    // Content-Type kontrolü
    const contentType = headers['content-type'] || headers['Content-Type'];
    if (contentType) {
      const allowedContentTypes = [
        'application/json',
        'text/plain',
        'multipart/form-data',
        'application/x-www-form-urlencoded'
      ];
      
      if (!allowedContentTypes.some(type => contentType.includes(type))) {
        blocked.push(`Invalid content type: ${contentType}`);
      }
    }

    // User-Agent kontrolü
    const userAgent = headers['user-agent'] || headers['User-Agent'];
    if (userAgent) {
      const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scanner/i,
        /hack/i,
        /sql/i,
        /script/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        warnings.push(`Suspicious user agent: ${userAgent}`);
      }
    }

    // Custom header'lar kontrolü
    Object.keys(headers).forEach(key => {
      if (key.toLowerCase().startsWith('x-')) {
        const value = headers[key];
        const validation = SecurityValidator.validateAndSanitize(value);
        
        if (!validation.isValid) {
          warnings.push(`Suspicious custom header: ${key}`);
        }
      }
    });

    return { warnings, blocked };
  }

  /**
   * Request body'sini kontrol et
   */
  private static async validateRequestBody(body: any) {
    const warnings: string[] = [];
    const blocked: string[] = [];
    let sanitizedBody = body;

    if (typeof body === 'string') {
      // String body kontrolü
      const validation = SecurityValidator.validateAndSanitize(body);
      
      if (!validation.isValid) {
        if (this.config.strictMode) {
          blocked.push('Request body contains security threats');
          this.reportThreat('request_body', 'high', `Body threats: ${validation.threats.join(', ')}`);
        } else {
          warnings.push(`Body sanitized: ${validation.threats.length} threats removed`);
          sanitizedBody = validation.sanitizedText;
        }
      }
    } else if (typeof body === 'object' && body !== null) {
      // Object body kontrolü
      sanitizedBody = await this.sanitizeObject(body, warnings, blocked);
    }

    return { warnings, blocked, sanitizedBody };
  }

  /**
   * Object içeriğini recursive olarak temizle
   */
  private static async sanitizeObject(obj: any, warnings: string[], blocked: string[]): Promise<any> {
    if (Array.isArray(obj)) {
      const sanitizedArray = [];
      for (const item of obj) {
        if (typeof item === 'string') {
          const validation = SecurityValidator.validateAndSanitize(item);
          if (!validation.isValid) {
            if (this.config.strictMode) {
              blocked.push('Array contains security threats');
              return obj;
            } else {
              warnings.push(`Array item sanitized: ${validation.threats.length} threats`);
              sanitizedArray.push(validation.sanitizedText);
            }
          } else {
            sanitizedArray.push(item);
          }
        } else if (typeof item === 'object') {
          sanitizedArray.push(await this.sanitizeObject(item, warnings, blocked));
        } else {
          sanitizedArray.push(item);
        }
      }
      return sanitizedArray;
    }

    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Key kontrolü
      const keyValidation = SecurityValidator.validateAndSanitize(key);
      if (!keyValidation.isValid) {
        if (this.config.strictMode) {
          blocked.push('Object key contains security threats');
          return obj;
        } else {
          warnings.push(`Object key sanitized: ${key}`);
        }
      }

      const sanitizedKey = keyValidation.sanitizedText || key;

      // Value kontrolü
      if (typeof value === 'string') {
        const validation = SecurityValidator.validateAndSanitize(value);
        if (!validation.isValid) {
          if (this.config.strictMode) {
            blocked.push('Object value contains security threats');
            return obj;
          } else {
            warnings.push(`Object value sanitized for key: ${key}`);
            sanitizedObj[sanitizedKey] = validation.sanitizedText;
          }
        } else {
          sanitizedObj[sanitizedKey] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitizedObj[sanitizedKey] = await this.sanitizeObject(value, warnings, blocked);
      } else {
        sanitizedObj[sanitizedKey] = value;
      }
    }

    return sanitizedObj;
  }

  /**
   * URL kontrolü
   */
  private static validateUrl(url: string) {
    const warnings: string[] = [];
    const blocked: string[] = [];

    // URL uzunluğu kontrolü
    if (url.length > 2000) {
      blocked.push('URL too long');
    }

    // Şüpheli URL pattern'leri
    const suspiciousPatterns = [
      /\.\./,           // Directory traversal
      /%2e%2e/i,        // Encoded directory traversal
      /javascript:/i,   // JavaScript protokolü
      /data:/i,         // Data protokolü
      /vbscript:/i,     // VBScript protokolü
      /<script/i,       // Script tag'leri
      /union.*select/i, // SQL injection
      /\s+(or|and)\s+/i // SQL injection
    ];

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(url)) {
        blocked.push(`Suspicious URL pattern detected: ${pattern.source}`);
        this.reportThreat('suspicious_url', 'high', `URL: ${url}`);
      }
    });

    // Query parameter kontrolü
    try {
      const urlObj = new URL(url, 'http://localhost');
      urlObj.searchParams.forEach((value, key) => {
        const validation = SecurityValidator.validateAndSanitize(value);
        if (!validation.isValid) {
          warnings.push(`Suspicious query parameter: ${key}=${value}`);
        }
      });
    } catch (e) {
      warnings.push('Invalid URL format');
    }

    return { warnings, blocked };
  }

  /**
   * Response güvenlik kontrolü
   */
  static validateApiResponse(response: any): { sanitized: any; warnings: string[] } {
    const warnings: string[] = [];

    if (typeof response === 'object' && response !== null) {
      // Response içindeki string değerleri kontrol et
      const sanitized = this.sanitizeResponseObject(response, warnings);
      return { sanitized, warnings };
    }

    return { sanitized: response, warnings };
  }

  /**
   * Response object'ini temizle
   */
  private static sanitizeResponseObject(obj: any, warnings: string[]): any {
    if (Array.isArray(obj)) {
      return obj.map(item => {
        if (typeof item === 'string') {
          const validation = SecurityValidator.validateAndSanitize(item);
          if (!validation.isValid) {
            warnings.push('Response contains potentially dangerous content');
            return validation.sanitizedText;
          }
          return item;
        } else if (typeof item === 'object') {
          return this.sanitizeResponseObject(item, warnings);
        }
        return item;
      });
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const validation = SecurityValidator.validateAndSanitize(value);
        if (!validation.isValid) {
          warnings.push(`Response field '${key}' sanitized`);
          sanitized[key] = validation.sanitizedText;
        } else {
          sanitized[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeResponseObject(value, warnings);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Güvenlik tehdidi raporla
   */
  private static reportThreat(type: string, severity: 'low' | 'medium' | 'high', description: string) {
    reportSecurityThreat({
      threatType: type,
      severity,
      description
    });
  }

  /**
   * User ID al
   */
  private static getUserId(): string {
    let userId = sessionStorage.getItem('user_session_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('user_session_id', userId);
    }
    return userId;
  }
}

// API çağrısı wrapper'ı
export const secureApiCall = async (request: ApiRequest): Promise<any> => {
  // Pre-request validation
  const preValidation = await SecurityMiddleware.validateApiRequest(request);
  
  if (!preValidation.allowed) {
    throw new Error(`API call blocked: ${preValidation.blocked.join(', ')}`);
  }

  // API çağrısını yap (fetch vb.)
  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: preValidation.sanitizedBody ? JSON.stringify(preValidation.sanitizedBody) : undefined
  });

  const responseData = await response.json();

  // Post-response validation
  const postValidation = SecurityMiddleware.validateApiResponse(responseData);
  
  if (postValidation.warnings.length > 0) {
    console.warn('API Response Security Warnings:', postValidation.warnings);
  }

  return postValidation.sanitized;
};