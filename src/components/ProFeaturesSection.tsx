
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Palette, Target, Zap } from "lucide-react";

export const ProFeaturesSection = () => {
  const features = [
    {
      icon: Palette,
      title: "Ton və Üslub Seçimi",
      description: "Rəsmi, səmimi, akademik və s. üslublar arasında seçim",
      visual: "bg-gradient-to-r from-blue-500 to-purple-500"
    },
    {
      icon: Target,
      title: "Hədəf Auditoriya",
      description: "Mətnin hədəf oxucu kütləsinə uyğunlaşdırılması",
      visual: "bg-gradient-to-r from-green-500 to-teal-500"
    },
    {
      icon: BarChart3,
      title: "Detallı Analitika",
      description: "Mətn keyfiyyəti haqqında ətraflı statistika və qrafiklər",
      visual: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Sürətli İşləmə",
      description: "Böyük mətnləri saniyələr ərzində təhlil etmə",
      visual: "bg-gradient-to-r from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pro Plan Xüsusiyyətləri
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional səviyyədə mətn təhlili və təkmilləşdirmə alətləri
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feature.visual}`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Style Demonstration */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-gray-900">
                Üslub Nümunələri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600">Rəsmi Üslub</h4>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700">
                      "Hörmətli həmkarlar, bu məsələni diqqətl inceləməyimiz zəruridir."
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600">Səmimi Üslub</h4>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-gray-700">
                      "Dostlar, gəlin bu mövzunu birlikdə düşünəlim və həll yolu tapaq."
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
