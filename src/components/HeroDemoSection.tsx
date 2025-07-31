import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Send, FileText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const HeroDemoSection = () => {
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const sampleText = "Bu mətndə bir neçə xəta var. Məsələn, 'gəlir' sözü düzgün yazılmayıb və 'ki' bağlayıcısı ayrı yazılmalıdır. Həmçinin nöqtələr də lazım olan yerlərdə qoyulmayıb.";

  const handleCheck = () => {
    // Metni URL parametresi olarak encode et
    const encodedText = encodeURIComponent(inputText.trim());
    
    if (isAuthenticated) {
      // Giriş yapmışsa direkt TextChecker'a git
      navigate(`/profile/dashboard?text=${encodedText}`);
    } else {
      // Giriş yapmamışsa login'e git, sonra TextChecker'a yönlendirilmesi için
      navigate(`/register?redirect=/profile/dashboard&text=${encodedText}`);
    }
  };

  const insertSampleText = () => {
    setInputText(sampleText);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-red-50/30 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-red-500" />
            <span className="text-red-500 font-semibold text-lg">Azərbaycan dili üçün AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="block text-transparent bg-gradient-to-r from-red-600 to-red-500 bg-clip-text mt-2">
              Azərbaycan dilində
            </span>
            Mükəmməl mətnlər yaz
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Süni intellekt vasitəsilə mətninizi yoxlayın, xətaları düzəldin və mükəmməl mətnlər yaradın
          </p>
        </div>

        {/* Main Input Container - Enhanced Design */}
        <div className="max-w-5xl mx-auto ">
          <div className={`relative bg-white rounded-3xl shadow-2xl border-2 transition-all duration-300 overflow-hidden ${
            isFocused ? 'border-red-300 shadow-red-100/50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            
            {/* Gradient overlay at the top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r "></div>
            
            {/* Main Text Area */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Mətninizi daxil edin</span>
              </div>
              
        <Textarea
  placeholder="Yoxlamaq istədiyiniz mətni buraya yazın və süni intellektin gücündən faydalanın..."
  value={inputText}
  onChange={(e) => setInputText(e.target.value)}
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
  maxLength={500}
  className="w-full h-56 bg-transparent border outline-none focus:outline-none focus:ring-0 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none text-lg leading-relaxed"
  style={{ minHeight: '160px', boxShadow: 'none' }}
/>
            </div>

            {/* Bottom Controls Bar - Enhanced */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={insertSampleText}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium group"
                  >
                    <Sparkles className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                    Nümunə mətn
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm transition-colors ${
                      inputText.length > 400 ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {inputText.length}/500
                    </span>
                    {inputText.length > 0 && (
                      <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            inputText.length > 400 ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${(inputText.length / 500) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={handleCheck}
                  disabled={!inputText.trim()}
                  className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 font-semibold"
                >
                  <Send className="w-4 h-4" />
                  Yoxla
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid - Enhanced */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 mt-28">
          <div className="group text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-red-200 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-4 text-xl">Dəqiq Yoxlama</h3>
            <p className="text-gray-600 leading-relaxed">Orfoqrafiya və qrammatika xətalarını avtomatik aşkar edir və düzəltmə təklifləri verir</p>
          </div>
          
          <div className="group text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-4 text-xl">Sürətli Nəticə</h3>
            <p className="text-gray-600 leading-relaxed">Saniyələr içində düzəldilmiş mətn əldə edin və dərhal nəticəni görün</p>
          </div>
          
          <div className="group text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-4 text-xl">Təhlükəsiz</h3>
            <p className="text-gray-600 leading-relaxed">Mətniniz təhlükəsiz şəkildə emal edilir və məxfilik qorunur</p>
          </div>
        </div>
      
      </div>
    </section>
  );
};