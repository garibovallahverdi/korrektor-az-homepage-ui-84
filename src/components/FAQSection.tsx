
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQSection = () => {
  const faqs = [
    {
      question: "Korrektor.az necə işləyir?",
      answer: "Korrektor.az süni intellekt əsaslı alqoritmlər istifadə edələrək mətninizdəki orfoqrafiya, qrammatika və üslub xətalarını aşkarlayır və düzəliş təklifləri verir."
    },
    {
      question: "Pulsuz versiyada nə qədər mətn təhlil edə bilərəm?",
      answer: "Pulsuz versiyada gündə 3 dəfə, hər dəfə 500 simvola qədər mətn təhlil edə bilərsiniz. Pro versiyada heç bir limit yoxdur."
    },
    {
      question: "Məlumatlarımın təhlükəsizliyi təmin edilirmi?",
      answer: "Bəli, bütün mətnləriniz SSL şifrələmə ilə qorunur və serverlərimizdə saxlanılmır. Təhlildən sonra mətnlər avtomatik silinir."
    },
    {
      question: "Pro versiyada hansı əlavə funksiyalar var?",
      answer: "Pro versiyada limitsiz təhlil, təkmil üslub təklifləri, ton seçimi, detallı analitika, API girişi və prioritet dəstək mövcuddur."
    },
    {
      question: "Mobil cihazlarda istifadə edə bilərəmmi?",
      answer: "Bəli, Korrektor.az bütün cihazlarda - kompüter, tablet və mobil telefonlarda rahat istifadə edilə bilər."
    },
    {
      question: "Texniki dəstək necə əldə edə bilərəm?",
      answer: "Əlaqə formu vasitəsilə bizə müraciət edə bilərsiniz. Pro istifadəçilər üçün prioritet dəstək xidməti mövcuddur."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tez-tez Verilən Suallar
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ən çox maraq göstərilən suallar və cavabları
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-red-500 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
