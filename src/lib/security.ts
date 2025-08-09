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
      /<\w+[\s\S]*?on\w+[\s\S]*?>/gi, // Event handler'li herhangi bir tag
    ],
    
    // SQL Injection pattern'leri
    sqlInjection: [
      /(\s|^)(select|insert|update|delete|drop|create|alter|exec|execute|union|declare|cast|convert)\s+/gi,
      /'[\s]*;[\s]*(select|insert|update|delete|drop|create|alter|exec|execute|union)/gi,
      /(\s|^)(or|and)\s+[\d\w\s]*=[\d\w\s]*/gi,
      /'[\s]*(or|and)[\s]+/gi,
      /;\s*(drop|delete|truncate)/gi,
      /--[\s\S]*$/gm, // SQL yorumlari
      /\/\*[\s\S]*?\*\//g, // SQL blok yorumlari
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
    
    // Diger tehlikeli pattern'ler
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
  
  // Maksimum metin uzunlugu
  private static readonly MAX_TEXT_LENGTH = 100000;

  // Izin verilen karakter setleri
  private static readonly ALLOWED_CHARS = /^[\p{L}\p{N}\p{P}\p{Z}\p{S}\p{M}\r\n\t]+$/u;

  /**
   * Ana guvenlik validasyon fonksiyonu
   */
  static validateAndSanitize(text: string): SecurityValidationResult {
    const threats: string[] = [];
    const originalLength = text.length;
    
    // Uzunluk kontrolu
    if (text.length > this.MAX_TEXT_LENGTH) {
      threats.push(`Mətn çox uzundur (${text.length}/${this.MAX_TEXT_LENGTH} simvol)`);
      text = text.substring(0, this.MAX_TEXT_LENGTH);
    }

    // Bos veya null kontrol
    if (!text || text.trim().length === 0) {
      return {
        isValid: false,
        sanitizedText: '',
        threats: ['Boş mətn'],
        originalLength,
        sanitizedLength: 0
      };
    }

    // Karakter seti kontrolu
    if (!this.ALLOWED_CHARS.test(text)) {
      threats.push('Etibarsız simvollar aşkar edildi');
      text = text.replace(/[^\p{L}\p{N}\p{P}\p{Z}\p{S}\p{M}\r\n\t]/gu, '');
    }

    // Tehlikeli pattern'leri kontrol et ve temizle
    text = this.sanitizeText(text, threats);

    // Ek guvenlik kontrolleri
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

    // Script tag'leri ve JavaScript kontrolu
    this.DANGEROUS_PATTERNS.scripts.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('JavaScript/Script kodu aşkar edildi');
        sanitized = sanitized.replace(pattern, '[SİLİNDİ_SKRİPT]');
      }
    });

    // HTML tag'leri kontrolu
    this.DANGEROUS_PATTERNS.htmlTags.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('Təhlükəli HTML elementi aşkar edildi');
        sanitized = sanitized.replace(pattern, '[SİLİNDİ_HTML]');
      }
    });

    // SQL Injection kontrolu
    this.DANGEROUS_PATTERNS.sqlInjection.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('SQL Injection cəhdi aşkar edildi');
        sanitized = sanitized.replace(pattern, '[SİLİNDİ_SQL]');
      }
    });

    // URL kontrolu
    this.DANGEROUS_PATTERNS.suspiciousUrls.forEach(pattern => {
      const matches = sanitized.match(pattern);
      if (matches) {
        threats.push(`Şübhəli URL aşkar edildi: ${matches.length} ədəd`);
        sanitized = sanitized.replace(pattern, '[SİLİNDİ_URL]');
      }
    });

    // Encoding bypass kontrolu
    this.DANGEROUS_PATTERNS.encodingBypass.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('Encoding bypass cəhdi aşkar edildi');
        sanitized = sanitized.replace(pattern, '[SİLİNDİ_KODLAŞDİRMA]');
      }
    });

    // Diger tehlikeli pattern'ler
    this.DANGEROUS_PATTERNS.other.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('Template injection cəhdi aşkar edildi');
        sanitized = sanitized.replace(pattern, '[SİLİNDİ_ŞABLON]');
      }
    });

    return sanitized;
  }

  /**
   * Ek guvenlik kontrolleri
   */
  private static additionalSecurityChecks(text: string, threats: string[]): string {
    let sanitized = text;

    // Cok fazla ozel karakter kontrolu
    const specialCharCount = (sanitized.match(/[<>'"&=]/g) || []).length;
    const specialCharRatio = specialCharCount / sanitized.length;
    
    if (specialCharRatio > 0.1) { // %10'dan fazla ozel karakter
      threats.push('Çox sayda xüsusi simvol aşkar edildi');
      sanitized = sanitized.replace(/[<>'"&=]/g, '');
    }

    // Tekrarlanan sıpheli karakter dizileri
    const repeatedSuspiciousPatterns = [
      /(.{1,10})\1{10,}/g, // Ayni karakter/dizi 10+ kez
      /[<>]{5,}/g, // 5+ art arda < veya >
      /['"]{3,}/g, // 3+ art arda tirnak
    ];

    repeatedSuspiciousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        threats.push('Şübhəli təkrarlanan simvol ardıcıllığı aşkar edildi');
        sanitized = sanitized.replace(pattern, '[SİLİNDİ_TƏKRARLI]');
      }
    });

    // Base64 kodlu content kontrolu
    const base64Pattern = /(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g;
    const base64Matches = sanitized.match(base64Pattern);
    
    if (base64Matches && base64Matches.some(match => match.length > 100)) {
      threats.push('Şübhəli Base64 məzmunu aşkar edildi');
      sanitized = sanitized.replace(/(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g,
        (match) => match.length > 100 ? '[SİLİNDİ_BASE64]' : match
      );
    }

    return sanitized;
  }

  /**
   * Dosya guvenlik kontrolu
   */
  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Dosya boyutu kontrolu
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`Fayl çox böyükdür (${(file.size / 1024 / 1024).toFixed(2)}MB / ${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Minimum dosya boyutu kontrolu
    if (file.size < 10) {
      errors.push('Fayl çox kiçikdir və ya boşdur');
    }

    // Dosya tipi ve uzanti kontrolu
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop();
    const fileType = file.type;
    
    const allowedTypes = {
      'text/plain': ['txt', 'text'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    };

    // Uzanti bazli kontrol (MIME type bazen guvenilir olmayabilir)
    const allowedExtensions = ['txt', 'doc', 'docx'];
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`Dəstəklənməyən fayl uzantısı: .${extension}. Yalnız .txt, .doc, .docx faylları dəstəklənir.`);
    }

    // MIME type kontrolu (eger browser tarafindan saglanmissa)
    if (fileType && !Object.keys(allowedTypes).includes(fileType)) {
      // Bazi browserlar Word dosyalari icin farkli MIME type'lar kullanabilir
      const isWordFile = fileName.endsWith('.doc') || fileName.endsWith('.docx');
      const isTextFile = fileName.endsWith('.txt');
      
      if (!isWordFile && !isTextFile) {
        errors.push(`Etibarsız fayl növü: ${fileType}`);
      }
    }

    // MIME type ve extension uyumu kontrolu
    if (fileType && extension) {
      const expectedExtensions = allowedTypes[fileType as keyof typeof allowedTypes] || [];
      if (expectedExtensions.length > 0 && !expectedExtensions.includes(extension)) {
        errors.push(`Fayl uzantısı və növü uyğunsuzluğu: .${extension} vs ${fileType}`);
      }
    }

    // Dosya adi kontrolu
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
   * Dosya adi guvenlik kontrolu
   */
  private static validateFileName(fileName: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Dosya adi uzunluk kontrolu
    if (fileName.length > 255) {
      errors.push('Fayl adı çox uzundur');
    }

    // Tehlikeli dosya pattern'leri
    const dangerousFilePatterns = [
      { pattern: /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|deb|rpm)$/i, message: 'İcra edilə bilən fayl uzantısı' },
      { pattern: /[<>:"|?*]/g, message: 'Etibarsız simvol' },
      { pattern: /^\./, message: 'Gizli fayl' },
      { pattern: /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i, message: 'Windows sistem faylı adı' },
      { pattern: /x00/, message: 'Null bayt' },
      { pattern: /[^\x20-\x7E\u00A0-\uFFFF]/g, message: 'Etibarsız simvol kodlaşdırması' },
    ];

    dangerousFilePatterns.forEach(({ pattern, message }) => {
      if (pattern.test(fileName)) {
        errors.push(`${message} aşkar edildi`);
      }
    });

    // Cift uzanti kontrolu
    const doublExtensions = fileName.match(/\.[^.]+\.[^.]+$/);
    if (doublExtensions) {
      errors.push('Şübhəli qoşa uzantı aşkar edildi');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rate limiting icin basit kontrol
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

// Hook olarak kullanim icin
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