
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sevinc Əliyeva",
      role: "Jurnalist",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      content: "Korrektor.az sayəsində məqalələrimi daha keyfiyyətli hazırlayıram. Xüsusilə qrammatika yoxlaması çox dəqiqdir.",
      rating: 5
    },
    {
      name: "Rəşad Məmmədov",
      role: "Müəllim",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Şagirdlərimə tövsiyə etdiyim əla alətdir. Azərbaycan dilində belə keyfiyyətli sistem görmək sevindirici.",
      rating: 5
    },
    {
      name: "Günel Həsənova",
      role: "Biznes analitik",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Iş hesabatlarımı hazırlayarkən çox kömək edir. Vaxt qənaət edirəm və daha professional görünüm əldə edirəm.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            İstifadəçi Rəyləri
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Minlərlə istifadəçi Korrektor.az-a güvənir
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
