import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from '@/components/ui/badge';
import { apiService, TextCheckResponse, TextError } from '@/services/api';
import { CheckCircle, Copy, RotateCcw, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const HeroDemoSection = () => {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<TextCheckResponse | null>(null);
  const [errors, setErrors] = useState<TextError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

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
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Azərbaycan dilində <span className="text-red-600">mətn yoxlayıcısı</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Mətninizi aşağıda yoxlayın və ya tam versiya üçün qeydiyyatdan keçin
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to={isAuthenticated ? "/profile" : "/login"}>
              <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
                Tam versiya
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Pulsuz • Qeydiyyatsız • Dərhal
            </div>
          </div>
        </div>

        {/* Main Demo Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[500px]">
            
            {/* Input Side */}
            <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Mətninizi daxil edin</h3>
                {isChecking && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                )}
              </div>
              
              <Textarea
                placeholder="Yoxlamaq istədiyiniz mətni buraya yazın..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] lg:min-h-[350px] resize-none text-base border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  onClick={() => checkText()}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? 'Yoxlanır...' : 'Yoxla'}
                </Button>
                
                <Button variant="outline" onClick={insertSampleText}>
                  Nümunə
                </Button>

                <Button variant="outline" onClick={resetText} disabled={!inputText && !result}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Təmizlə
                </Button>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>{inputText.length} hərf</span>
                {result && (
                  <Badge variant={errors.length > 0 ? 'destructive' : 'default'}>
                    {errors.length > 0 ? `${errors.length} təklif` : 'Düzgün'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Results Side */}
            <div className="p-6 lg:p-8 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nəticə</h3>
              
              {!result ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-center">Mətn daxil edin və avtomatik yoxlama başlasın</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Corrected Text */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Düzəldilmiş mətn</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.corrected_text.output_sentence)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-3 bg-white rounded-lg border text-sm max-h-32 overflow-y-auto">
                      {result.corrected_text.output_sentence}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {errors.length > 0 ? (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-3">Təkliflər</span>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {errors.map((err, index) => (
                          <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                              <span className="font-medium text-orange-800 text-sm">"{err.original_fragment}"</span>
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                                {err.type}
                              </Badge>
                            </div>
                            
                            {err.explanation && (
                              <p className="text-xs text-gray-600 mb-2 pl-6">{err.explanation}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 pl-6">
                              {err.suggestions.length > 0 ? (
                                err.suggestions.map((word, wordIndex) => (
                                  <Button
                                    key={wordIndex}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applySuggestion(err, word)}
                                    className="h-7 px-3 text-xs"
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
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">Heç bir xəta tapılmadı - mətniniz düzgündür!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Daha çox imkan və limitlərsiz istifadə üçün</p>
          <Link to={isAuthenticated ? "/profile" : "/login"}>
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
              Indi qeydiyyatdan keç
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};