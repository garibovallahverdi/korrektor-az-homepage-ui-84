import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { apiService, TextCheckResponse, TextError } from '@/services/api';
import { FileText, Wand2, CheckCircle, Copy, RotateCcw, AlertCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export const DemoSection = () => {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<TextCheckResponse | null>(null);
  const [errors, setErrors] = useState<TextError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isManualEdit = useRef(true);

  const sampleText = "Bu mətndə bir neçə xəta var. Məsələn, 'gəlir' sözü düzgün yazılmayıb və 'ki' bağlayıcısı ayrı yazılmalıdır.";

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

  const insertSampleText = () => {
    setInputText(sampleText);
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Demo Təhlil
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mətnizi daxil edin və dərhal təhlil nəticəsini görün
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Mətn daxil edin
                  {isChecking && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Burada yoxlamaq istədiyiniz mətni yazın..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[250px] resize-none text-base"
                />
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => checkText()}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                        Yoxlanılır...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Yoxla
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={insertSampleText}
                  >
                    Nümunə mətni
                  </Button>

                  <Button
                    variant="outline"
                    onClick={resetText}
                    disabled={!inputText && !result}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Təmizlə
                  </Button>
                </div>

                <div className="text-sm text-gray-500">
                  Hərf sayı: <span className="font-semibold">{inputText.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Təhlil nəticəsi
                  {result && (
                    <Badge variant={errors.length > 0 ? 'destructive' : 'default'} className="text-sm">
                      {errors.length > 0 ? `${errors.length} təklif` : 'Xəta yoxdur'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="text-center py-16 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Mətn daxil edin və avtomatik yoxlama başlasın</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Corrected Text */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">Düzəldilmiş mətn:</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.corrected_text.output_sentence)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-md text-sm border">
                        {result.corrected_text.output_sentence}
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Təkliflər:</h4>
                      {errors.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {errors.map((err, index) => (
                            <div key={index} className="p-3 bg-red-50 rounded-md border border-red-200 space-y-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="font-semibold text-red-700">"{err.original_fragment}"</span>
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
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
                                      size="sm"
                                      onClick={() => applySuggestion(err, word)}
                                      className="text-xs h-7"
                                    >
                                      {word}
                                    </Button>
                                  ))
                                ) : (
                                  <Badge variant="outline" className="text-xs">
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};