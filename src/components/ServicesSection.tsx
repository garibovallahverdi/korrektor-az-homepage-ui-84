
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Palette } from "lucide-react";

export const ServicesSection = () => {
  const services = [
    {
      icon: CheckCircle,
      title: "Orfoqrafiya Yoxlaması",
      description: "Sözlərin düzgün yazılışını yoxlayır və avtomatik düzəlişlər təklif edir.",
      features: ["Azərbaycan dilinin bütün qaydaları", "Təklif edilən düzəlişlər", "Dərhal nəticə"]
    },
    {
      icon: FileText,
      title: "Qrammatika Təhlili",
      description: "Cümlə quruluşu, fel zamanları və digər qrammatik xətaları aşkarlayır.",
      features: ["Cümlə strukturu təhlili", "Fel zamanlarının yoxlanması", "Sintaksis xətaları"]
    },
    {
      icon: Palette,
      title: "Üslub Təkmilləşdirməsi",
      description: "Mətnin ton və üslubunu yaxşılaşdırır, oxunaqlılığını artırır.",
      features: ["Ton seçimi", "Üslub təklifləri", "Oxunaqlılıq artırımı"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Xidmətlərimiz
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Süni intellekt təmirləni ilə yazılarınızı mükəmməlləşdirin
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
