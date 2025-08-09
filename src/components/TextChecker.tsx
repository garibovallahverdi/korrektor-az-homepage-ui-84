// TextChecker.tsx - Güvenlik Önlemli Versiyon
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService, TextCheckResponse, TextError } from '@/services/api';
import { CheckCircle, AlertCircle, Copy, RotateCcw, Menu, CheckCheck, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SecurityValidator, useSecurityValidator, SecurityValidationResult } from '@/lib/security';
import * as pdfjsLib from 'pdfjs-dist'

// PDF.js worker path'ini daha güvenilir şekilde ayarla
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
  
  // Fallback olarak CDN kullan
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc.includes('pdf.worker')) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
}

export const TextChecker = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TextCheckResponse | null>(null);
  const [errors, setErrors] = useState<TextError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Güvenlik state'leri
  const [securityValidation, setSecurityValidation] = useState<SecurityValidationResult | null>(null);
  const [securityThreats, setSecurityThreats] = useState<string[]>([]);
  const [isSecurityBlocked, setIsSecurityBlocked] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const location = useLocation();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isManualEdit = useRef(true);
  const hasLoadedFromUrl = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const { validateText, validateFile, checkRateLimit } = useSecurityValidator();

  // Rate limiting için user ID (basit session based)
  const getUserId = () => {
    let userId = sessionStorage.getItem('user_session_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('user_session_id', userId);
    }
    return userId;
  };

  const handleButtonClick = () => {
    // File input'u temizle ki aynı dosya tekrar seçilebilsin
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  // Word document text extraction utility
  const extractTextFromWord = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('Word dosyasından metin çıkarılamadı');
      }

      // Uyarıları göster (eğer varsa)
      if (result.messages && result.messages.length > 0) {
        console.warn('Word okuma uyarıları:', result.messages);
      }

      return result.value;
    } catch (error) {
      console.error('Word okuma hatası:', error);
      throw new Error(
        error instanceof Error 
          ? `Word okuma hatası: ${error.message}`
          : 'Word dosyası okunamadı'
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCurrentFile(null);
      return;
    }

    setCurrentFile(file);

    // Dosya güvenlik kontrolü
    const fileValidation = validateFile(file);
    
    if (!fileValidation.isValid) {
      toast({
        title: 'Dosya Güvenlik Xətası',
        description: fileValidation.errors.join(', '),
        variant: 'destructive',
      });
      
      // Hatalı dosyayı temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setCurrentFile(null);
      return;
    }

    // Rate limiting kontrolü
    if (!checkRateLimit(getUserId(), 50, 3600000)) {
      toast({
        title: 'Çok Fazla İstek',
        description: 'Lütfen bir süre bekleyip tekrar deneyin',
        variant: 'destructive',
      });
      return;
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    setIsLoading(true);

    try {
      let extractedText = '';

      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        // TXT dosyası okuma
        toast({
          title: 'Metin Dosyası İşleniyor',
          description: 'Metin dosyası okunuyor...',
        });
        
        extractedText = await file.text();
        
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword' ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.doc')
      ) {
        // Word dosyası okuma
        toast({
          title: 'Word Dosyası İşleniyor',
          description: 'Word dosyası okunuyor, lütfen bekleyin...',
        });

        const arrayBuffer = await file.arrayBuffer();
        
        // Word dosya boyut kontrolü (50MB limit)
        if (arrayBuffer.byteLength > 50 * 1024 * 1024) {
          throw new Error('Word dosyası çok büyük (50MB limit)');
        }

        extractedText = await extractTextFromWord(arrayBuffer);
        
      } else {
        throw new Error(`Desteklenmeyen dosya türü: ${fileType}. Sadece TXT ve Word dosyaları desteklenir.`);
      }

      // Çıkarılan metni güvenlik kontrolünden geçir
      const validation = validateText(extractedText);
      
      if (!validation.isValid) {
        setSecurityThreats(validation.threats);
        toast({
          title: 'Dosya İçeriği Güvensiz',
          description: `${validation.threats.length} güvenlik tehdidi tespit edildi`,
          variant: 'destructive',
        });
      }
      
      setInputText(validation.sanitizedText);
      setSecurityValidation(validation);

      toast({
        title: 'Dosya Başarıyla Okundu',
        description: `${validation.sanitizedText.length} karakter metin çıkarıldı`,
      });

    } catch (error) {
      console.error('Dosya okuma hatası:', error);
      toast({
        title: 'Dosya Okuma Xətası',
        description: error instanceof Error ? error.message : 'Dosya okunurken bir hata oluştu',
        variant: 'destructive',
      });
      
      // Hatalı dosyayı temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setCurrentFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // URL parametresinden metni al
  useEffect(() => {
    if (!hasLoadedFromUrl.current) {
      const searchParams = new URLSearchParams(location.search);
      const textParam = searchParams.get('text');
      
      if (textParam) {
        const decodedText = decodeURIComponent(textParam);
        
        // URL'den gelen metni güvenlik kontrolünden geçir
        const validation = validateText(decodedText);
        
        if (!validation.isValid) {
          setSecurityThreats(validation.threats);
          toast({
            title: 'URL Parametresi Güvensiz',
            description: `${validation.threats.length} güvenlik tehdidi tespit edildi`,
            variant: 'destructive',
          });
        }
        
        setInputText(validation.sanitizedText);
        setSecurityValidation(validation);
        hasLoadedFromUrl.current = true;
        
        // Güvenli metni otomatik olarak kontrol et
        if (validation.isValid) {
          setTimeout(() => {
            checkText(validation.sanitizedText);
          }, 500);
        }
      }
    }
  }, [location.search]);

  const checkText = async (text: string = inputText) => {
    if (!text.trim()) {
      toast({
        title: 'Xəta',
        description: 'Zəhmət olmasa mətn daxil edin',
        variant: 'destructive',
      });
      return;
    }

    // Rate limiting kontrolü
    if (!checkRateLimit(getUserId(), 100, 3600000)) { // Saatte 100 kontrol
      toast({
        title: 'Çok Fazla İstek',
        description: 'Lütfen bir süre bekleyip tekrar deneyin',
        variant: 'destructive',
      });
      return;
    }

    // Güvenlik kontrolü
    const validation = validateText(text);
    setSecurityValidation(validation);
    
    if (!validation.isValid) {
      setSecurityThreats(validation.threats);
      setIsSecurityBlocked(true);
      
      toast({
        title: 'Güvenlik Xətası',
        description: `${validation.threats.length} güvenlik tehdidi tespit edildi. Metin temizlendi.`,
        variant: 'destructive',
      });
      
      // Güvensiz metin yerine temizlenmiş metni kullan
      setInputText(validation.sanitizedText);
      text = validation.sanitizedText;
    } else {
      setSecurityThreats([]);
      setIsSecurityBlocked(false);
    }

    setIsChecking(true);
    setIsLoading(true);

    try {
      // Backend'e temizlenmiş metni gönder
      const response = await apiService.checkText(validation.sanitizedText);
      setResult(response);
      setErrors(response.corrected_text.errors || []);
      setShowResults(true);

      if ((response.corrected_text.errors || []).length > 0) {
        toast({
          title: 'Yoxlama tamamlandı',
          description: `${response.corrected_text.errors.length} təklif tapıldı`,
        });
      } else {
        toast({
          title: 'Əla!',
          description: 'Heç bir xəta tapılmadı',
        });
      }
    } catch (error) {
      toast({
        title: 'Xəta',
        description: 'Mətn yoxlanılarkən xəta baş verdi',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Kopyalandı',
      description: 'Mətn buferə kopyalandı',
    });
  };

  const applySuggestion = (error: TextError, selectedWord: string) => {
    const original = error.original_fragment;
    const index = inputText.indexOf(original);
    if (index === -1) return;

    const updatedText =
      inputText.substring(0, index) + selectedWord + inputText.substring(index + original.length);

    // Güncellenmiş metni güvenlik kontrolünden geçir
    const validation = validateText(updatedText);
    
    if (!validation.isValid) {
      setSecurityThreats(validation.threats);
      toast({
        title: 'Güvenlik Uyarısı',
        description: 'Değişiklik güvenlik tehdidi oluşturuyor',
        variant: 'destructive',
      });
      return;
    }

    isManualEdit.current = false;
    setInputText(validation.sanitizedText);
    setErrors((prev) => prev.filter((e) => e !== error));

    toast({
      title: 'Tətbiq edildi',
      description: `"${original}" → "${selectedWord}"`,
    });
  };

  const applyAllCorrections = () => {
    if (!result?.corrected_text.output_sentence) return;

    // Tüm düzeltmeleri güvenlik kontrolünden geçir
    const validation = validateText(result.corrected_text.output_sentence);
    
    if (!validation.isValid) {
      setSecurityThreats(validation.threats);
      toast({
        title: 'Güvenlik Uyarısı',
        description: 'Düzeltmeler güvenlik tehdidi oluşturuyor',
        variant: 'destructive',
      });
      return;
    }

    isManualEdit.current = false;
    setInputText(validation.sanitizedText);
    setErrors([]);

    toast({
      title: 'Tüm düzeltmeler uygulandı',
      description: `${errors.length} düzeltme başarıyla uygulandı`,
    });
  };

  const resetText = () => {
    setInputText('');
    setResult(null);
    setErrors([]);
    setShowResults(false);
    setSecurityValidation(null);
    setSecurityThreats([]);
    setIsSecurityBlocked(false);
    setCurrentFile(null);
    hasLoadedFromUrl.current = false;
    
    // File input'u temizle
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Metin değişikliklerinde güvenlik kontrolü
  const handleTextChange = (value: string) => {
    const validation = validateText(value);
    setSecurityValidation(validation);
    
    if (!validation.isValid) {
      setSecurityThreats(validation.threats);
      // Kullanıcıyı uyar ama metni hemen değiştirme
      if (validation.threats.length > 3) { // Çok fazla tehdit varsa engelle
        setIsSecurityBlocked(true);
        toast({
          title: 'Güvenlik Engeli',
          description: 'Çok fazla güvenlik tehdidi tespit edildi',
          variant: 'destructive',
        });
        return;
      }
    } else {
      setSecurityThreats([]);
      setIsSecurityBlocked(false);
    }
    
    setInputText(value);
    
    // Eğer metin tamamen silinmişse, file input'u da temizle
    if (!value.trim()) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setCurrentFile(null);
    }
  };

  useEffect(() => {
    if (!inputText.trim()) {
      setResult(null);
      setErrors([]);
      setSecurityValidation(null);
      setSecurityThreats([]);
      
      // Metin boşsa file input'u da temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setCurrentFile(null);
      return;
    }

    if (!isManualEdit.current) {
      isManualEdit.current = true;
      return;
    }

    // URL'den yüklenen metni debounce etme
    if (hasLoadedFromUrl.current && inputText === decodeURIComponent(new URLSearchParams(location.search).get('text') || '')) {
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (!isSecurityBlocked) {
        checkText(inputText);
      }
    }, 800);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [inputText, isSecurityBlocked]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Responsive Header */}
      <header className="bg-white border-b border-gray-200 px-3 lg:px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 text-sm lg:text-base">Mətn Yoxlayıcısı</span>
            {isChecking && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
            )}
            {/* Güvenlik durumu */}
            {securityValidation && (
              <Badge 
                variant={securityThreats.length > 0 ? 'destructive' : 'default'} 
                className="text-xs flex items-center gap-1"
              >
                {securityThreats.length > 0 ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    {securityThreats.length} Təhlükə
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3" />
                    Təhlükəsiz
                  </>
                )}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{inputText.length} hərf</span>
            {result && (
              <Badge variant={errors.length > 0 ? 'destructive' : 'default'} className="text-xs hidden sm:block">
                {errors.length > 0 ? `${errors.length} təklif` : 'Düzgün'}
              </Badge>
            )}
            
            <Button
              onClick={() => setShowResults(!showResults)}
              variant="outline"
              size="sm"
              className="lg:hidden h-7 px-2"
            >
              <Menu className="h-3 w-3" />
            </Button>
            
            <Button
              onClick={handleButtonClick}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white h-7 px-2 lg:px-3 text-xs"
            >
              Fayl yüklə
            </Button>  
            
            <input 
              ref={fileInputRef} 
              className="hidden" 
              type="file" 
              accept=".txt,.doc,.docx,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              onChange={handleFileUpload} 
            />
            <Button
              onClick={() => checkText()}
              disabled={isLoading || !inputText.trim() || isSecurityBlocked}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white h-7 px-2 lg:px-3 text-xs"
            >
              {isLoading ? 'Yoxlanır...' : 'Yoxla'}
            </Button>
            <Button
              variant="outline"
              onClick={resetText}
              disabled={!inputText && !result}
              size="sm"
              className="h-7 w-7 p-0"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </header>

      {/* Güvenlik Uyarısı */}
      {securityThreats.length > 0 && (
        <Alert className="mx-3 mt-2 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 text-sm">
            <strong>Güvenlik Uyarısı:</strong> {securityThreats.slice(0, 3).join(', ')}
            {securityThreats.length > 3 && ` ve ${securityThreats.length - 3} diğer tehdit`}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Input Panel */}
        <div className={`flex-1 flex flex-col bg-white ${showResults ? 'hidden lg:flex' : 'flex'} lg:border-r border-gray-200`}>
          <div className="flex-1 p-3 lg:p-6">
            <Textarea
              placeholder="Mətninizi buraya yazın..."
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              disabled={isSecurityBlocked}
              className={`w-full h-full resize-none text-sm lg:text-base border-0 shadow-none focus:ring-0 focus:outline-none p-0 ${
                isSecurityBlocked ? 'bg-red-50 cursor-not-allowed' : ''
              }`}
              style={{ minHeight: '100%' }}
            />
            {isSecurityBlocked && (
              <div className="mt-2 text-center text-red-600 text-sm">
                Güvenlik nedeniyle metin düzenleme engellendi
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className={`w-full lg:w-80 flex flex-col bg-white ${showResults ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3">
            {/* Güvenlik İstatistikleri */}
            {securityValidation && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Güvenlik Durumu</span>
                  <Badge variant={securityValidation.isValid ? 'default' : 'destructive'} className="text-xs">
                    {securityValidation.isValid ? 'Güvenli' : 'Riskli'}
                  </Badge>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="flex justify-between">
                    <span>Orijinal:</span>
                    <span>{securityValidation.originalLength} karakter</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temizlenmiş:</span>
                    <span>{securityValidation.sanitizedLength} karakter</span>
                  </div>
                  {securityValidation.threats.length > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Tehditler:</span>
                      <span>{securityValidation.threats.length} adet</span>
                    </div>
                  )}
                </div>
                <Separator />
              </div>
            )}

            {result ? (
              <>
                {/* Mobile Status Info */}
                <div className="lg:hidden flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">{inputText.length} hərf</span>
                  {result && (
                    <Badge variant={errors.length > 0 ? 'destructive' : 'default'} className="text-xs">
                      {errors.length > 0 ? `${errors.length} təklif` : 'Düzgün'}
                    </Badge>
                  )}
                </div>

                {/* Tüm Düzeltmeleri Uygula Butonu */}
                {errors.length > 0 && !isSecurityBlocked && (
                  <div className="mb-3">
                    <Button
                      onClick={applyAllCorrections}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                      size="sm"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Tüm Düzeltmeleri Uygula ({errors.length})
                    </Button>
                  </div>
                )}

                {/* Corrected Text */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">Düzəldilmiş</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.corrected_text.output_sentence)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-xs border max-h-20 lg:max-h-24 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {result.corrected_text.output_sentence}
                    </pre>
                  </div>
                </div>

                {errors.length > 0 && <Separator />}

                {/* Suggestions */}
                {errors.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">Təkliflər</span>
                      <Badge variant="outline" className="text-xs">
                        {errors.length} xəta
                      </Badge>
                    </div>
                    
                    {errors.map((err, index) => (
                      <Card key={index} className="border border-red-200 bg-red-50">
                        <CardContent className="p-2 space-y-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                            <span className="font-medium text-red-700 text-xs">"{err.original_fragment}"</span>
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200 px-1 py-0">
                              {err.type}
                            </Badge>
                          </div>
                          
                          {err.explanation && (
                            <p className="text-xs text-gray-600 pl-4 leading-tight">{err.explanation}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-1 pl-4">
                            {err.suggestions.length > 0 ? (
                              err.suggestions.map((word, wordIndex) => (
                                <Button
                                  key={wordIndex}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => applySuggestion(err, word)}
                                  disabled={isSecurityBlocked}
                                  className="h-6 px-2 text-xs"
                                >
                                  {word}
                                </Button>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs h-6">
                                Təklif yoxdur
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : result && (
                  <div className="flex items-center gap-2 text-green-600 text-xs p-2 bg-green-50 rounded border border-green-200">
                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    <span>Xəta tapılmadı</span>
                  </div>
                )}

                {/* Mobile Back Button */}
                <div className="lg:hidden pt-3 border-t">
                  <Button
                    onClick={() => setShowResults(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Geri
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center py-20">
                <div className="text-gray-400">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="text-xs">Mətn yazın</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};