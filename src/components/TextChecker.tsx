import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiService, TextCheckResponse, Suggestion } from '@/services/api';
import { CheckCircle, AlertCircle, Copy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TextChecker = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TextCheckResponse | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Debounce hook
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedText = useDebounce(inputText, 1000);

  // Auto-check text with debounce
  useEffect(() => {
    if (debouncedText.trim() && debouncedText.length > 10) {
      checkText(debouncedText);
    }
  }, [debouncedText]);

  const checkText = async (text: string = inputText) => {
    if (!text.trim()) {
      toast({
        title: "Xəta",
        description: "Zəhmət olmasa mətn daxil edin",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setIsLoading(true);

    try {
      const response = await apiService.checkText(text);
      setResult(response);
      setSuggestions(response.suggestions || []);
      
      if (response.suggestions && response.suggestions.length > 0) {
        toast({
          title: "Yoxlama tamamlandı",
          description: `${response.suggestions.length} təklif tapıldı`,
        });
      } else {
        toast({
          title: "Əla!",
          description: "Heç bir xəta tapılmadı",
        });
      }
    } catch (error) {
      console.error('Text check error:', error);
      toast({
        title: "Xəta",
        description: "Mətn yoxlanılarkən xəta baş verdi",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Mətn buferə kopyalandı",
    });
  };

  const applySuggestion = (suggestion: Suggestion, selectedWord: string) => {
    const newText = inputText.replace(suggestion.word, selectedWord);
    setInputText(newText);
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s.word !== suggestion.word));
    
    toast({
      title: "Tətbiq edildi",
      description: `"${suggestion.word}" → "${selectedWord}"`,
    });
  };

  const resetText = () => {
    setInputText('');
    setResult(null);
    setSuggestions([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Mətn daxil edin</span>
            {isChecking && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            )}
          </CardTitle>
          <CardDescription>
            Mətninizi daxil edin, avtomatik yoxlama başlayacaq
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Burada mətninizi yazın..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[300px] resize-none"
          />
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => checkText()}
              disabled={isLoading || !inputText.trim()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isLoading ? 'Yoxlanılır...' : 'Yoxla'}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetText}
              disabled={!inputText && !result}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Təmizlə
            </Button>
          </div>
          
          <div className="text-sm text-gray-500">
            Hərf sayı: {inputText.length}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Nəticə və təkliflər</span>
            {result && (
              <Badge variant={suggestions.length > 0 ? "destructive" : "default"}>
                {suggestions.length > 0 ? `${suggestions.length} təklif` : 'Xəta yoxdur'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Düzəldilmiş mətn və təkliflər
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              {/* Corrected Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Düzəldilmiş mətn:</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.corrected_text)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {result.corrected_text}
                </div>
              </div>

              <Separator />

              {/* Suggestions */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Təkliflər:</h4>
                {suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">"{suggestion.word}"</span>
                          <Badge variant="secondary">{suggestion.type}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {suggestion.suggestions.map((word, wordIndex) => (
                            <Button
                              key={wordIndex}
                              variant="outline"
                              size="sm"
                              onClick={() => applySuggestion(suggestion, word)}
                              className="text-xs"
                            >
                              {word}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Heç bir təklif yoxdur - mətniniz düzgündür!</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">👈</div>
              <p>Mətn daxil edin və yoxlama başlasın</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};