// components/PDFDebugPanel.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight, Bug, FileText, Shield, AlertTriangle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFDebugInfo {
  version: string;
  workerSrc: string;
  isWorkerLoaded: boolean;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  };
  pdfInfo?: {
    numPages: number;
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  errors: string[];
  warnings: string[];
}

interface PDFDebugPanelProps {
  file?: File;
  pdfText?: string;
  isVisible?: boolean;
}

export const PDFDebugPanel: React.FC<PDFDebugPanelProps> = ({ 
  file, 
  pdfText, 
  isVisible = false 
}) => {
  const [debugInfo, setDebugInfo] = useState<PDFDebugInfo>({
    version: pdfjsLib.version || 'Bilinmiyor',
    workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc || 'Ayarlanmamış',
    isWorkerLoaded: false,
    errors: [],
    warnings: []
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePDF = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    const newDebugInfo: PDFDebugInfo = {
      ...debugInfo,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      },
      errors: [],
      warnings: []
    };

    try {
      // Worker kontrolü
      try {
        const workerBlob = await fetch(pdfjsLib.GlobalWorkerOptions.workerSrc);
        newDebugInfo.isWorkerLoaded = workerBlob.ok;
        if (!workerBlob.ok) {
          newDebugInfo.errors.push(`Worker yüklenemedi: ${workerBlob.status}`);
        }
      } catch (workerError) {
        newDebugInfo.errors.push(`Worker test hatası: ${workerError}`);
      }

      // PDF analizi
      const arrayBuffer = await file.arrayBuffer();
      
      // Magic number kontrolü
      const uint8Array = new Uint8Array(arrayBuffer.slice(0, 8));
      const header = String.fromCharCode(...uint8Array);
      if (!header.startsWith('%PDF-')) {
        newDebugInfo.errors.push('Geçersiz PDF header');
      } else {
        newDebugInfo.warnings.push(`PDF Version: ${header.slice(0, 8)}`);
      }

      // PDF.js ile yükleme testi
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          verbosity: 1,
        });

        const pdf = await loadingTask.promise;
        
        newDebugInfo.pdfInfo = {
          numPages: pdf.numPages,
        };

        // Metadata okuma
        try {
          const metadata = await pdf.getMetadata();
          if (metadata.info) {
            newDebugInfo.pdfInfo = {
              ...newDebugInfo.pdfInfo,
              title: metadata.info.Title || 'Belirtilmemiş',
              author: metadata.info.Author || 'Belirtilmemiş',
              creator: metadata.info.Creator || 'Belirtilmemiş',
              producer: metadata.info.Producer || 'Belirtilmemiş',
              creationDate: metadata.info.CreationDate || 'Belirtilmemiş',
              modificationDate: metadata.info.ModDate || 'Belirtilmemiş',
            };
          }
        } catch (metadataError) {
          newDebugInfo.warnings.push(`Metadata okunamadı: ${metadataError}`);
        }

        // İlk sayfayı test et
        try {
          const page = await pdf.getPage(1);
          const textContent = await page.getTextContent();
          
          if (!textContent.items || textContent.items.length === 0) {
            newDebugInfo.warnings.push('İlk sayfa metin içermiyor');
          } else {
            newDebugInfo.warnings.push(`İlk sayfa ${textContent.items.length} text item içeriyor`);
          }
          
          page.cleanup();
        } catch (pageError) {
          newDebugInfo.errors.push(`İlk sayfa okunamadı: ${pageError}`);
        }

        await pdf.destroy();

      } catch (pdfError) {
        newDebugInfo.errors.push(`PDF yüklenemedi: ${pdfError}`);
      }

    } catch (error) {
      newDebugInfo.errors.push(`Analiz hatası: ${error}`);
    }

    setDebugInfo(newDebugInfo);
    setIsAnalyzing(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  return (
    <Card className="mt-3 border-blue-200 bg-blue-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-blue-100 transition-colors">
            <CardTitle className="flex items-center gap-2 text-sm">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Bug className="h-4 w-4 text-blue-600" />
              PDF Debug Panel
              {debugInfo.errors.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {debugInfo.errors.length} Hata
                </Badge>
              )}
              {debugInfo.warnings.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {debugInfo.warnings.length} Uyarı
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* PDF.js Bilgileri */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-3 w-3" />
                PDF.js Bilgileri
              </h4>
              <div className="text-xs space-y-1 bg-white p-2 rounded border">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-mono">{debugInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker Status:</span>
                  <Badge variant={debugInfo.isWorkerLoaded ? 'default' : 'destructive'}>
                    {debugInfo.isWorkerLoaded ? 'Yüklü' : 'Hata'}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 break-all">
                  Worker URL: {debugInfo.workerSrc}
                </div>
              </div>
            </div>

            {/* Dosya Bilgileri */}
            {debugInfo.fileInfo && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Dosya Bilgileri</h4>
                <div className="text-xs space-y-1 bg-white p-2 rounded border">
                  <div className="flex justify-between">
                    <span>Ad:</span>
                    <span className="font-mono break-all">{debugInfo.fileInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Boyut:</span>
                    <span>{formatFileSize(debugInfo.fileInfo.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tip:</span>
                    <span className="font-mono">{debugInfo.fileInfo.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Son Değişiklik:</span>
                    <span>{new Date(debugInfo.fileInfo.lastModified).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Bilgileri */}
            {debugInfo.pdfInfo && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">PDF Bilgileri</h4>
                <div className="text-xs space-y-1 bg-white p-2 rounded border">
                  <div className="flex justify-between">
                    <span>Sayfa Sayısı:</span>
                    <span>{debugInfo.pdfInfo.numPages}</span>
                  </div>
                  {debugInfo.pdfInfo.title && (
                    <div className="flex justify-between">
                      <span>Başlık:</span>
                      <span className="break-all">{debugInfo.pdfInfo.title}</span>
                    </div>
                  )}
                  {debugInfo.pdfInfo.author && (
                    <div className="flex justify-between">
                      <span>Yazar:</span>
                      <span>{debugInfo.pdfInfo.author}</span>
                    </div>
                  )}
                  {debugInfo.pdfInfo.creator && (
                    <div className="flex justify-between">
                      <span>Oluşturucu:</span>
                      <span className="break-all">{debugInfo.pdfInfo.creator}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metin İstatistikleri */}
            {pdfText && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Çıkarılan Metin</h4>
                <div className="text-xs space-y-1 bg-white p-2 rounded border">
                  <div className="flex justify-between">
                    <span>Karakter Sayısı:</span>
                    <span>{pdfText.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kelime Sayısı:</span>
                    <span>{pdfText.split(/\s+/).filter(w => w.length > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Satır Sayısı:</span>
                    <span>{pdfText.split('\n').length}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded max-h-16 overflow-y-auto">
                    <strong>İlk 200 karakter:</strong><br />
                    {pdfText.substring(0, 200)}...
                  </div>
                </div>
              </div>
            )}

            {/* Hatalar */}
            {debugInfo.errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong className="text-red-800">Hatalar:</strong>
                  <ul className="mt-1 space-y-1">
                    {debugInfo.errors.map((error, index) => (
                      <li key={index} className="text-xs text-red-700">• {error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Uyarılar */}
            {debugInfo.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Shield className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong className="text-yellow-800">Uyarılar:</strong>
                  <ul className="mt-1 space-y-1">
                    {debugInfo.warnings.map((warning, index) => (
                      <li key={index} className="text-xs text-yellow-700">• {warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Analiz Butonu */}
            <Button
              onClick={analyzePDF}
              disabled={!file || isAnalyzing}
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAnalyzing ? 'Analiz Ediliyor...' : 'PDF\'yi Analiz Et'}
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};