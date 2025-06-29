import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";

interface ReservationData {
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ReservationData>({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: 2,
    notes: ""
  });

  const handleWhatsAppRedirect = () => {
    // Criar mensagem para WhatsApp
    const whatsappMessage = `Olá Las Tortilhas! Gostaria de fazer uma reserva:
      
*Nome:* ${formData.name}
*Telefone:* ${formData.phone}
${formData.email ? `*Email:* ${formData.email}` : ''}
*Data:* ${formData.date}
*Hora:* ${formData.time}
*Número de pessoas:* ${formData.guests}
${formData.notes ? `*Observações:* ${formData.notes}` : ''}

Aguardo confirmação. Obrigado!`;

    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Redirecionar para WhatsApp
    const whatsappUrl = `https://wa.me/244949639932?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Redirecionando para WhatsApp!",
      description: "Você será direcionado para o WhatsApp para confirmar sua reserva.",
    });
    
    setFormData({
      name: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      guests: 2,
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.name || !formData.phone || !formData.date || !formData.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    handleWhatsAppRedirect();
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Telefone",
      description: "+244 949 639 932",
      bgColor: "bg-red-600"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email",
      description: "info@lastortilhas.ao",
      bgColor: "bg-green-700"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.888 3.703"/>
        </svg>
      ),
      title: "WhatsApp",
      description: "+244 949 639 932",
      bgColor: "bg-orange-500"
    }
  ];

  const socialLinks = [
    { icon: "fab fa-instagram", href: "#", color: "hover:text-red-600" },
    { icon: "fab fa-facebook", href: "#", color: "hover:text-green-700" },
    { icon: "fab fa-twitter", href: "#", color: "hover:text-orange-500" }
  ];

  return (
    <section id="contato" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Faça Sua Reserva
          </h2>
          <p className="text-xl text-gray-600">
            Entre em contato connosco para garantir sua mesa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-50 rounded-2xl p-8">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
                
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div 
                      key={info.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center"
                    >
                      <div className={`w-12 h-12 ${info.bgColor} rounded-full flex items-center justify-center mr-4 text-white`}>
                        {info.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{info.title}</div>
                        <div className="text-gray-600">{info.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Redes Sociais</h4>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                      <a 
                        key={index}
                        href={social.href} 
                        className={`w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 ${social.color} transition-colors`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Formulário de Reserva</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Nome *</Label>
                  <Input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Seu nome completo"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</Label>
                  <Input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+244 XXX XXX XXX"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <Label className="block text-sm font-medium text-gray-700 mb-2">Email</Label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="seu.email@exemplo.com"
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Data *</Label>
                  <Input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Hora *</Label>
                  <Select 
                    value={formData.time} 
                    onValueChange={(value) => setFormData({...formData, time: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="13:00">13:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="20:00">20:00</SelectItem>
                      <SelectItem value="21:00">21:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mb-6">
                <Label className="block text-sm font-medium text-gray-700 mb-2">Número de Pessoas *</Label>
                <Select 
                  value={formData.guests.toString()} 
                  onValueChange={(value) => setFormData({...formData, guests: parseInt(value)})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 pessoa</SelectItem>
                    <SelectItem value="2">2 pessoas</SelectItem>
                    <SelectItem value="3">3 pessoas</SelectItem>
                    <SelectItem value="4">4 pessoas</SelectItem>
                    <SelectItem value="5">5 pessoas</SelectItem>
                    <SelectItem value="6">6+ pessoas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <Label className="block text-sm font-medium text-gray-700 mb-2">Observações</Label>
                <Textarea 
                  rows={4} 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Pedidos especiais, alergias, etc."
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-red-600 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V5a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0v11a2 2 0 002 2h2a2 2 0 002-2V7m-6 0V5" />
                </svg>
                Confirmar Reserva
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
