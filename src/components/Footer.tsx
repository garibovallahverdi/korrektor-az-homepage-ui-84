
import { Separator } from "@/components/ui/separator";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/lovable-uploads/7b7bf9b8-3318-4217-8c4e-8a6b622237ce.png"
                alt="Korrektor.az"
                className="h-8 w-auto filter brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Azərbaycan dilində ən müasir və etibarlı mətn təhlil sistemi. 
              Süni intellekt əsaslı alətlərlə yazılarınızı təkmilləşdirin.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Sürətli Keçidlər</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Xidmətlər
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Tariflər
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Haqqımızda
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Əlaqə
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Hüquqi</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  İstifadə Şərtləri
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Məxfilik Siyasəti
                </a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-white transition-colors">
                  Cookie Siyasəti
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Korrektor.az. Bütün hüquqlar qorunur.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Azərbaycan dilinin qorunması üçün hazırlanmışdır
          </p>
        </div>
      </div>
    </footer>
  );
};
