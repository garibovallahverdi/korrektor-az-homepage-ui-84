import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiService, TextCheckResponse, TextError } from '@/services/api';
import { CheckCircle, AlertCircle, Copy, RotateCcw, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TextChecker = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TextCheckResponse | null>(null);
  const [errors, setErrors] = useState<TextError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isManualEdit = useRef(true);

  const checkText = async (text: string = inputText) => {
    if (!text.trim()) {
      toast({
        title: 'Xəta',
        description: 'Zəhmət olmasa mətn daxil edin',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    setIsLoading(true);

    try {
      const response = await apiService.checkText(text);
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

    isManualEdit.current = false;
    setInputText(updatedText);
    setErrors((prev) => prev.filter((e) => e !== error));

    toast({
      title: 'Tətbiq edildi',
      description: `"${original}" → "${selectedWord}"`,
    });
  };

  const resetText = () => {
    setInputText('');
    setResult(null);
    setErrors([]);
    setShowResults(false);
  };

  useEffect(() => {
    if (!inputText.trim()) {
      setResult(null);
      setErrors([]);
      return;
    }

    if (!isManualEdit.current) {
      isManualEdit.current = true;
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      checkText(inputText);
    }, 800);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [inputText]);

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
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{inputText.length} hərf</span>
            {result && (
              <Badge variant={errors.length > 0 ? 'destructive' : 'default'} className="text-xs hidden sm:block">
                {errors.length > 0 ? `${errors.length} təklif` : 'Düzgün'}
              </Badge>
            )}
            
            {/* Mobile Results Toggle */}
            <Button
              onClick={() => setShowResults(!showResults)}
              variant="outline"
              size="sm"
              className="lg:hidden h-7 px-2"
            >
              <Menu className="h-3 w-3" />
            </Button>
            
            <Button
              onClick={() => checkText()}
              disabled={isLoading || !inputText.trim()}
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

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Input Panel */}
        <div className={`flex-1 flex flex-col bg-white ${showResults ? 'hidden lg:flex' : 'flex'} lg:border-r border-gray-200`}>
          <div className="flex-1 p-3 lg:p-6">
            <Textarea
              placeholder="Mətninizi buraya yazın..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-full resize-none text-sm lg:text-base border-0 shadow-none focus:ring-0 focus:outline-none p-0"
              style={{ minHeight: '100%' }}
            />
          </div>
        </div>

        {/* Results Panel - Responsive */}
        <div className={`w-full lg:w-80 flex flex-col bg-white ${showResults ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3">
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