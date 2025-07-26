import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiService, TextCheckResponse, TextError } from '@/services/api';
import { CheckCircle, AlertCircle, Copy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TextChecker = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TextCheckResponse | null>(null);
  const [errors, setErrors] = useState<TextError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="flex-1 shadow-sm rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              Mətn daxil edin
              {isChecking && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              )}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Yazmağı dayandırdıqdan sonra avtomatik yoxlanacaq.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Burada mətninizi yazın..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[320px] resize-none text-base font-normal focus:ring-1 focus:ring-red-500 rounded-lg border border-gray-300"
            />

            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={() => checkText()}
                disabled={isLoading || !inputText.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2"
              >
                {isLoading ? 'Yoxlanılır...' : 'Yoxla'}
              </Button>

              <Button
                variant="outline"
                onClick={resetText}
                disabled={!inputText && !result}
                className="px-5 py-2"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Təmizlə
              </Button>
            </div>

            <div className="text-sm text-gray-500 font-mono mt-2">
              Hərf sayı: <span className="font-semibold">{inputText.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full lg:w-[40%] shadow-sm rounded-xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              Nəticə və təkliflər
              {result && (
                <Badge variant={errors.length > 0 ? 'destructive' : 'default'} className="text-sm py-1 px-3">
                  {errors.length > 0 ? `${errors.length} təklif` : 'Xəta yoxdur'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Düzəldilmiş mətn və təkliflər
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-800 text-lg">Düzəldilmiş mətn:</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.corrected_text.output_sentence)}
                      className="hover:bg-gray-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="p-3 bg-gray-50 rounded-md text-sm whitespace-pre-wrap font-sans text-gray-700 border border-gray-200">
                    {result.corrected_text.output_sentence}
                  </pre>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Təkliflər:</h4>
                  {errors.length > 0 ? (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {errors.map((err, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded-md shadow-sm space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-red-700">"{err.original_fragment}"</span>
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
                              {err.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{err.explanation}</p>
                          <div className="flex flex-wrap gap-2">
                            {err.suggestions.length > 0 ? (
                              err.suggestions.map((word, wordIndex) => (
                                <Button
                                  key={wordIndex}
                                  variant="outline"
                                  onClick={() => applySuggestion(err, word)}
                                  className="text-xs px-2 py-1"
                                >
                                  {word}
                                </Button>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                Təklif yoxdur
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                      <CheckCircle className="h-4 w-4" />
                      <span>Heç bir təklif yoxdur - mətniniz düzgündür!</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-400 text-base font-light select-none">
                <div className="mb-4 text-2xl">👈</div>
                <p>Mətn daxil edin və yoxlama başlasın</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};