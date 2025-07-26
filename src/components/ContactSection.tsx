
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Bizimlə Əlaqə
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sualınız var? Bizə yazın, ən qısa müddətdə cavab verəcəyik
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Image and Info */}
            <div className="space-y-8">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop"
                  alt="Korrektor.az komandası"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">E-poçt</h4>
                    <p className="text-gray-600">info@korrektor.az</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Telefon</h4>
                    <p className="text-gray-600">+994 12 345 67 89</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ünvan</h4>
                    <p className="text-gray-600">Bakı şəhəri, Azərbaycan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Mesaj Göndər
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Adınızı daxil edin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-poçt
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e-poçt@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mövzu
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Mesajın mövzusu"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Mesajınızı burada yazın..."
                      className="min-h-[120px] resize-none"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Mesaj Göndər
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
