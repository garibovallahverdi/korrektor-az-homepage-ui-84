
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Crown } from "lucide-react";

export const PricingSection = () => {
  const plans = [
    {
      name: "Basic",
      price: "Pulsuz",
      description: "Başlayanlar üçün əsas funksiyalar",
      features: [
        "500 simvola qədər mətn təhlili",
        "Əsas orfoqrafiya yoxlaması",
        "Sadə qrammatika təhlili",
        "3 dəfə günlük istifadə limiti"
      ],
      buttonText: "Qeydiyyatdan keç",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Pro",
      price: "9.99₼/ay",
      description: "Peşəkar istifadəçilər üçün tam funksional",
      features: [
        "Limitsiz mətn təhlili",
        "Təkmil orfoqrafiya və qrammatika",
        "Üslub və ton təkmilləşdirməsi",
        "Detallı hesabat və statistika",
        "Prioritet dəstək",
        "API girişi"
      ],
      buttonText: "Pro al",
      buttonVariant: "default" as const,
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tarif Planları
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ehtiyacınıza uyğun planı seçin və dərhal istifadəyə başlayın
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative hover:shadow-lg transition-all duration-300 ${
                plan.popular ? 'border-red-500 shadow-lg scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    Populyar
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="text-3xl font-bold text-red-500 mb-2">
                  {plan.price}
                </div>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full py-3 ${
                    plan.buttonVariant === 'default' 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'border-red-500 text-red-500 hover:bg-red-50'
                  }`}
                  variant={plan.buttonVariant}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
