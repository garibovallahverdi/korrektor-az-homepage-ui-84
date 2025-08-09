// utils/security.ts
export interface SecurityValidationResult {
  isValid: boolean;
  sanitizedText: string;
  threats: string[];
  originalLength: number;
  sanitizedLength: number;
}

export class SecurityValidator {
  // Tehlikeli pattern'ler
  private static readonly DANGEROUS_PATTERNS = {
    // Script tag'leri ve JavaScript
    scripts: [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /<script[\s\S]*?>/gi,
      /javascript:/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi, // onclick, onload vs.
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /Function\s*\(/gi,
      /new\s+Function/gi,
    ],
    
    // HTML tag'leri
    htmlTags: [
      /<\/?(?:iframe|object|embed|applet|meta|link|style|base|form|input|textarea|select|option|button|img|video|audio|source|track)[\s\S]*?>/gi,
      /<\w+[\s\S]*?on\w+[\s\S]*?>/gi, // Event handler'lı herhangi bir tag
    ],
    
    // SQL Injection pattern'leri
    sqlInjection: [
      /(\s|^)(select|insert|update|delete|drop|create|alter|exec|execute|union|declare|cast|convert)\s+/gi,
      /'[\s]*;[\s]*(select|insert|update|delete|drop|create|alter|exec|execute|union)/gi,
      /(\s|^)(or|and)\s+[\d\w\s]*=[\d\w\s]*/gi,
      /'[\s]*(or|and)[\s]+/gi,
      /;\s*(drop|delete|truncate)/gi,
      /--[\s\S]*$/gm, // SQL yorumları
      /\/\*[\s\S]*?\*\//g, // SQL blok yorumları
    ],
    
    // URL ve link pattern'leri
    suspiciousUrls: [
      /(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/gi,
      /data:\s*text\/html/gi,
      /vbscript:/gi,
      /file:\/\//gi,
    ],
    
    // Encoding bypass denemeleri
    encodingBypass: [
      /&lt;script/gi,
      /&gt;/gi,
      /&quot;/gi,
      /&#x?[0-9a-f]+;/gi,
      /%3cscript/gi,
      /%3e/gi,
      /\\u[0-9a-f]{4}/gi,
      /\\x[0-9a-f]{2}/gi,
    ],
    
    // Diğer tehlikeli pattern'ler
    other: [
      /\${.*}/g, // Template injection
      /{{.*}}/g, // Template injection
      /<%[\s\S]*?%>/g, // Server-side template
      /<\?[\s\S]*?\?>/g, // PHP tag'leri
      /<%@[\s\S]*?%>/g, // ASP tag'leri
    ]
  };

  // Maksimum dosya boyutu (5MB)
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  
  // Maksimum metin uzunluğu
  private static readonly MAX_TEXT_LENGTH = 100000;

  // İzin verilen karakter setleri
  private static readonly ALLOWED_CHARS = /^[\p{L}\p{N}\p{P}\p{Z}\p{S}\p{M}\r\n\t]+$/u;

  /**
   * Ana güvenlik validasyon fonksiyonu
   */
  static validateAndSanitize(text: string): SecurityValidationResult {
    const threats: string[] = [];
    const originalLength = text.length;
    
    // Uzunluk kontrolü
    if (text.length > this.MAX_TEXT_LENGTH) {
      threats.push(`Metin çok uzun (${text.length}/${this.MAX_TEXT_LENGTH} karakter)`);
      text = text.substring(0, this.MAX_TEXT_LENGTH);
    }

    // Boş veya null kontrol
    if (!text || text.trim().length === 0) {
      return {
        isValid: false,
        sanitizedText: '',
        threats: ['Boş metin'],
        originalLength,
        sanitizedLength: 0
      };
    }

    // Karakter seti kontrolü
    if (!this.ALLOWED_CHARS.test(text)) {
      threats.push('Geçersiz karakterler tespit edildi');
      text = text.replace(/[^\p{L}\p{N}\p{P}\p{Z}\p{S}\p{M}\r\n\t]/gu, '');
    }

    // Tehlikeli pattern'leri kontrol et ve temizle
    text = this.sanitizeText(text, threats);

    // Ek güvenlik kontrolleri
    text = this.additionalSecurityChecks(text, threats);

    const sanitizedLength = text.length;
    const isValid = threats.length === 0;

    return {
      isValid,
      sanitizedText: text,
      threats,
      originalLength,
      sanitizedLength
    };
  }

  /**
   * Metin sanitizasyonu
   */
  private static sanitizeText(text: string, threats: string[]): string {
    let sanitized = text;

    // Script tag'leri ve JavaScript kontrolü
    this.DANGEROUS_PATTERNS.scripts.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('JavaScript/Script kodu tespit edildi');
        sanitized = sanitized.replace(pattern, '[REMOVED_SCRIPT]');
      }
    });

    // HTML tag'leri kontrolü
    this.DANGEROUS_PATTERNS.htmlTags.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('Tehlikeli HTML element tespit edildi');
        sanitized = sanitized.replace(pattern, '[REMOVED_HTML]');
      }
    });

    // SQL Injection kontrolü
    this.DANGEROUS_PATTERNS.sqlInjection.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('SQL Injection denemesi tespit edildi');
        sanitized = sanitized.replace(pattern, '[REMOVED_SQL]');
      }
    });

    // URL kontrolü
    this.DANGEROUS_PATTERNS.suspiciousUrls.forEach(pattern => {
      const matches = sanitized.match(pattern);
      if (matches) {
        threats.push(`Şüpheli URL tespit edildi: ${matches.length} adet`);
        sanitized = sanitized.replace(pattern, '[REMOVED_URL]');
      }
    });

    // Encoding bypass kontrolü
    this.DANGEROUS_PATTERNS.encodingBypass.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('Encoding bypass denemesi tespit edildi');
        sanitized = sanitized.replace(pattern, '[REMOVED_ENCODING]');
      }
    });

    // Diğer tehlikeli pattern'ler
    this.DANGEROUS_PATTERNS.other.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('Template injection denemesi tespit edildi');
        sanitized = sanitized.replace(pattern, '[REMOVED_TEMPLATE]');
      }
    });

    return sanitized;
  }

  /**
   * Ek güvenlik kontrolleri
   */
  private static additionalSecurityChecks(text: string, threats: string[]): string {
    let sanitized = text;

    // Çok fazla özel karakter kontrolü
    const specialCharCount = (sanitized.match(/[<>'"&=]/g) || []).length;
    const specialCharRatio = specialCharCount / sanitized.length;
    
    if (specialCharRatio > 0.1) { // %10'dan fazla özel karakter
      threats.push('Çok fazla özel karakter tespit edildi');
      sanitized = sanitized.replace(/[<>'"&=]/g, '');
    }

    // Tekrarlanan şüpheli karakter dizileri
    const repeatedSuspiciousPatterns = [
      /(.{1,10})\1{10,}/g, // Aynı karakter/dizi 10+ kez
      /[<>]{5,}/g, // 5+ art arda < veya >
      /['"]{3,}/g, // 3+ art arda tırnak
    ];

    repeatedSuspiciousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('Şüpheli tekrarlanan karakter dizisi tespit edildi');
        sanitized = sanitized.replace(pattern, '[REMOVED_REPEATED]');
      }
    });

    // Base64 kodlu content kontrolü
    const base64Pattern = /(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g;
    const base64Matches = sanitized.match(base64Pattern);
    
    if (base64Matches && base64Matches.some(match => match.length > 100)) {
      threats.push('Şüpheli Base64 içerik tespit edildi');
      sanitized = sanitized.replace(/(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g,
        (match) => match.length > 100 ? '[REMOVED_BASE64]' : match
      );
    }

    return sanitized;
  }

  /**
   * Dosya güvenlik kontrolü
   */
  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Dosya boyutu kontrolü
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(2)}MB / ${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Minimum dosya boyutu kontrolü
    if (file.size < 10) {
      errors.push('Dosya çok küçük veya boş');
    }

    // Dosya tipi ve uzantı kontrolü
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop();
    const fileType = file.type;
    
    const allowedTypes = {
      'text/plain': ['txt', 'text'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    };

    // Uzantı bazlı kontrol (MIME type bazen güvenilir olmayabilir)
    const allowedExtensions = ['txt', 'doc', 'docx'];
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`Desteklenmeyen dosya uzantısı: .${extension}. Sadece .txt, .doc, .docx dosyaları desteklenir.`);
    }

    // MIME type kontrolü (eğer browser tarafından sağlanmışsa)
    if (fileType && !Object.keys(allowedTypes).includes(fileType)) {
      // Bazı browserlar Word dosyaları için farklı MIME type'lar kullanabilir
      const isWordFile = fileName.endsWith('.doc') || fileName.endsWith('.docx');
      const isTextFile = fileName.endsWith('.txt');
      
      if (!isWordFile && !isTextFile) {
        errors.push(`Geçersiz dosya tipi: ${fileType}`);
      }
    }

    // MIME type ve extension uyumu kontrolü
    if (fileType && extension) {
      const expectedExtensions = allowedTypes[fileType as keyof typeof allowedTypes] || [];
      if (expectedExtensions.length > 0 && !expectedExtensions.includes(extension)) {
        errors.push(`Dosya uzantısı ve tipi uyumsuz: .${extension} vs ${fileType}`);
      }
    }

    // Dosya adı kontrolü
    const fileNameValidation = this.validateFileName(file.name);
    if (!fileNameValidation.isValid) {
      errors.push(...fileNameValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Dosya adı güvenlik kontrolü
   */
  private static validateFileName(fileName: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Dosya adı uzunluk kontrolü
    if (fileName.length > 255) {
      errors.push('Dosya adı çok uzun');
    }

    // Tehlikeli dosya pattern'leri
    const dangerousFilePatterns = [
      { pattern: /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|deb|rpm)$/i, message: 'Çalıştırılabilir dosya uzantısı' },
      { pattern: /[<>:"|?*]/g, message: 'Geçersiz karakter' },
      { pattern: /^\./, message: 'Gizli dosya' },
      { pattern: /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i, message: 'Windows sistem dosyası adı' },
      { pattern: /x00/, message: 'Null byte' },
      { pattern: /[^\x20-\x7E\u00A0-\uFFFF]/g, message: 'Geçersiz karakter encoding' },
    ];

    dangerousFilePatterns.forEach(({ pattern, message }) => {
      if (pattern.test(fileName)) {
        errors.push(`${message} tespit edildi`);
      }
    });

    // Çift uzantı kontrolü
    const doublExtensions = fileName.match(/\.[^.]+\.[^.]+$/);
    if (doublExtensions) {
      errors.push('Şüpheli çift uzantı tespit edildi');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rate limiting için basit kontrol
   */
  static checkRateLimit(userId: string, maxRequests: number = 100, timeWindow: number = 3600000): boolean {
    const key = `rate_limit_${userId}`;
    const now = Date.now();
    
    // LocalStorage kullanmıyoruz, session based kontrol
    if (!window.sessionStorage) return true;
    
    const stored = window.sessionStorage.getItem(key);
    let requests: number[] = stored ? JSON.parse(stored) : [];
    
    // Eski istekleri temizle
    requests = requests.filter(timestamp => now - timestamp < timeWindow);
    
    if (requests.length >= maxRequests) {
      return false;
    }
    
    requests.push(now);
    window.sessionStorage.setItem(key, JSON.stringify(requests));
    
    return true;
  }
}

// Hook olarak kullanım için
export const useSecurityValidator = () => {
  const validateText = (text: string) => SecurityValidator.validateAndSanitize(text);
  const validateFile = (file: File) => SecurityValidator.validateFile(file);
  const checkRateLimit = (userId: string, maxRequests?: number, timeWindow?: number) => 
    SecurityValidator.checkRateLimit(userId, maxRequests, timeWindow);

  return {
    validateText,
    validateFile,
    checkRateLimit
  };
};