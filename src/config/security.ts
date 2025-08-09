// config/security.ts
export interface SecurityConfig {
  maxTextLength: number;
  maxFileSize: number;
  strictMode: boolean;
  allowedCharactersOnly: boolean;
  blockSuspiciousUrls: boolean;
  enableRateLimit: boolean;
  rateLimit: {
    textCheck: { requests: number; timeWindow: number };
    fileUpload: { requests: number; timeWindow: number };
  };
  threats: {
    scripts: { enabled: boolean; action: 'remove' | 'block' | 'warn' };
    htmlTags: { enabled: boolean; action: 'remove' | 'block' | 'warn' };
    sqlInjection: { enabled: boolean; action: 'remove' | 'block' | 'warn' };
    suspiciousUrls: { enabled: boolean; action: 'remove' | 'block' | 'warn' };
    encodingBypass: { enabled: boolean; action: 'remove' | 'block' | 'warn' };
    templateInjection: { enabled: boolean; action: 'remove' | 'block' | 'warn' };
  };
  fileValidation: {
    allowedTypes: string[];
    allowedExtensions: string[];
    scanContent: boolean;
    maxNameLength: number;
  };
}

// Önceden tanımlanmış güvenlik seviyeleri
export const SECURITY_LEVELS = {
  LOW: {
    maxTextLength: 500000,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    strictMode: false,
    allowedCharactersOnly: false,
    blockSuspiciousUrls: false,
    enableRateLimit: true,
    rateLimit: {
      textCheck: { requests: 200, timeWindow: 3600000 },
      fileUpload: { requests: 100, timeWindow: 3600000 },
    },
    threats: {
      scripts: { enabled: true, action: 'warn' as const },
      htmlTags: { enabled: true, action: 'warn' as const },
      sqlInjection: { enabled: true, action: 'warn' as const },
      suspiciousUrls: { enabled: false, action: 'warn' as const },
      encodingBypass: { enabled: true, action: 'warn' as const },
      templateInjection: { enabled: true, action: 'warn' as const },
    },
    fileValidation: {
      allowedTypes: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      allowedExtensions: ['.txt', '.doc', '.docx'],
      scanContent: false,
      maxNameLength: 100,
    },
  },

  MEDIUM: {
    maxTextLength: 100000,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    strictMode: false,
    allowedCharactersOnly: false,
    blockSuspiciousUrls: true,
    enableRateLimit: true,
    rateLimit: {
      textCheck: { requests: 100, timeWindow: 3600000 },
      fileUpload: { requests: 50, timeWindow: 3600000 },
    },
    threats: {
      scripts: { enabled: true, action: 'remove' as const },
      htmlTags: { enabled: true, action: 'remove' as const },
      sqlInjection: { enabled: true, action: 'remove' as const },
      suspiciousUrls: { enabled: true, action: 'remove' as const },
      encodingBypass: { enabled: true, action: 'remove' as const },
      templateInjection: { enabled: true, action: 'remove' as const },
    },
    fileValidation: {
      allowedTypes: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      allowedExtensions: ['.txt', '.doc', '.docx'],
      scanContent: true,
      maxNameLength: 50,
    },
  },

  HIGH: {
    maxTextLength: 50000,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    strictMode: true,
    allowedCharactersOnly: true,
    blockSuspiciousUrls: true,
    enableRateLimit: true,
    rateLimit: {
      textCheck: { requests: 50, timeWindow: 3600000 },
      fileUpload: { requests: 20, timeWindow: 3600000 },
    },
    threats: {
      scripts: { enabled: true, action: 'block' as const },
      htmlTags: { enabled: true, action: 'block' as const },
      sqlInjection: { enabled: true, action: 'block' as const },
      suspiciousUrls: { enabled: true, action: 'block' as const },
      encodingBypass: { enabled: true, action: 'block' as const },
      templateInjection: { enabled: true, action: 'block' as const },
    },
    fileValidation: {
      allowedTypes: ['text/plain'],
      allowedExtensions: ['.txt'],
      scanContent: true,
      maxNameLength: 30,
    },
  },
} as const;

// Aktif güvenlik yapılandırması
export const getSecurityConfig = (): SecurityConfig => {
  // Environment variable veya localStorage'dan güvenlik seviyesini al
  const securityLevel = (process.env.REACT_APP_SECURITY_LEVEL || 
                        localStorage.getItem('security_level') || 
                        'MEDIUM') as keyof typeof SECURITY_LEVELS;
  
  const config = SECURITY_LEVELS[securityLevel] || SECURITY_LEVELS.MEDIUM;
  // Convert readonly arrays to mutable arrays for type compatibility
  return {
    ...config,
    fileValidation: {
      ...config.fileValidation,
      allowedTypes: [...config.fileValidation.allowedTypes],
      allowedExtensions: [...config.fileValidation.allowedExtensions],
    },
    rateLimit: {
      textCheck: { ...config.rateLimit.textCheck },
      fileUpload: { ...config.rateLimit.fileUpload },
    },
    threats: {
      scripts: { ...config.threats.scripts },
      htmlTags: { ...config.threats.htmlTags },
      sqlInjection: { ...config.threats.sqlInjection },
      suspiciousUrls: { ...config.threats.suspiciousUrls },
      encodingBypass: { ...config.threats.encodingBypass },
      templateInjection: { ...config.threats.templateInjection },
    },
  };
};

// Dinamik yapılandırma güncelleme
export const updateSecurityConfig = (level: keyof typeof SECURITY_LEVELS): void => {
  localStorage.setItem('security_level', level);
  // Uygulama yeniden başlatılması gerekebilir
  window.location.reload();
};

// Güvenlik raporlama
export interface SecurityReport {
  timestamp: number;
  threatType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  userAgent: string;
  ip?: string;
  userId: string;
}

export const reportSecurityThreat = (threat: Omit<SecurityReport, 'timestamp' | 'userAgent' | 'userId'>): void => {
  const report: SecurityReport = {
    ...threat,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    userId: sessionStorage.getItem('user_session_id') || 'anonymous',
  };

  // localStorage'da güvenlik raporlarını sakla (geliştirme için)
  const existingReports = JSON.parse(localStorage.getItem('security_reports') || '[]');
  existingReports.push(report);
  
  // Son 100 raporu sakla
  if (existingReports.length > 100) {
    existingReports.splice(0, existingReports.length - 100);
  }
  
  localStorage.setItem('security_reports', JSON.stringify(existingReports));

  // Prodüksiyon ortamında bu verileri backend'e gönder
  console.warn('Security Threat Detected:', report);
};

// Güvenlik metrikleri
export const getSecurityMetrics = () => {
  const reports = JSON.parse(localStorage.getItem('security_reports') || '[]') as SecurityReport[];
  const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
  
  const recentReports = reports.filter(report => report.timestamp > last24Hours);
  
  return {
    totalThreats: reports.length,
    threatsLast24h: recentReports.length,
    threatsByType: recentReports.reduce((acc, report) => {
      acc[report.threatType] = (acc[report.threatType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    threatsBySeverity: recentReports.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
};

// Güvenlik durumu kontrol hook'u
export const useSecurityStatus = () => {
  const config = getSecurityConfig();
  const metrics = getSecurityMetrics();
  
  const getSecurityLevel = (): 'safe' | 'warning' | 'danger' => {
    if (metrics.threatsLast24h === 0) return 'safe';
    if (metrics.threatsLast24h < 10) return 'warning';
    return 'danger';
  };

  return {
    config,
    metrics,
    level: getSecurityLevel(),
    isStrictMode: config.strictMode,
  };
};