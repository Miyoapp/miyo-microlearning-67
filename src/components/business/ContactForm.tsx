
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

const ContactForm = () => {
  // State for the contact form
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here we would typically send the data to a server
    // For now, just reset the form
    setFormData({
      name: "",
      company: "",
      email: "",
      message: ""
    });
    // Show success message (would integrate with toast in a real app)
    alert("Solicitud enviada. Te contactaremos pronto.");
  };

  return (
    <section id="contact-section" className="py-16 md:py-24 bg-white">
      <div className="miyo-container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Contacto
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12">
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Tu nombre" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input 
                      id="company" 
                      name="company" 
                      placeholder="Empresa" 
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="¿En qué podemos ayudarte?" 
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto bg-miyo-800 hover:bg-miyo-900">
                  Enviar
                </Button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-miyo-100 p-3 rounded-full">
                  <Mail className="h-5 w-5 text-miyo-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">info@miyo.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-miyo-100 p-3 rounded-full">
                  <Phone className="h-5 w-5 text-miyo-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Teléfono</h3>
                  <p className="text-gray-600">+34 91 123 4567</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-miyo-100 p-3 rounded-full">
                  <MapPin className="h-5 w-5 text-miyo-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Dirección</h3>
                  <p className="text-gray-600">Calle Innovación, 42<br />Madrid, España</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
