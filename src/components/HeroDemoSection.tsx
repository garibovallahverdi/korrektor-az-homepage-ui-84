import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const HeroDemoSection = () => {
  const [inputText, setInputText] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const sampleText = "Bu mətndə bir neçə xəta var. Məsələn, 'gəlir' sözü düzgün yazılmayıb və 'ki' bağlayıcısı ayrı yazılmalıdır. Həmçinin nöqtələr də lazım olan yerlərdə qoyulmayıb.";

  const handleCheck = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const insertSampleText = () => {
    setInputText(sampleText);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Mükəmməl mətnlər yaz
            <span className="block text-red-600 mt-2">Azərbaycan dilində</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Süni intellekt vasitəsilə mətninizi yoxlayın və düzəldin
          </p>
        </div>

        {/* Main Input Container - Lovable Style */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <Textarea
              placeholder="Yoxlamaq istədiyiniz mətni buraya yazın..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={200}
              className="w-full h-24 bg-transparent border-0 text-gray-900 placeholder-gray-500 resize-none focus:ring-0 focus:outline-none p-6 text-base"
            />
            
            {/* Bottom Controls Bar */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={insertSampleText}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
                >
                  Nümunə mətn
                </button>
                <span className="text-sm text-gray-400">
                  {inputText.length}/200
                </span>
              </div>
              
              <Button
                onClick={handleCheck}
                disabled={!inputText.trim()}
                className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 p-0 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Dəqiq Yoxlama</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Orfoqrafiya və qrammatika xətalarını avtomatik aşkar edir</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Sürətli Nəticə</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Saniyələr içində düzəldilmiş mətn əldə edin</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Təhlükəsiz</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Mətniniz təhlükəsiz şəkildə emal edilir</p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Limitsiz istifadə üçün qoşulun
            </h3>
            <p className="text-gray-600 mb-6">
              Premium xüsusiyyətlər və hərtərəfli mətn təhlili
            </p>
            <Button
              onClick={() => navigate(isAuthenticated ? "/profile" : "/login")}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isAuthenticated ? "Profile keç" : "Qeydiyyatdan keç"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};