import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

export default function About() {
  const stats = [
    { number: "7+", label: "Anos de Experiência" },
    { number: "50+", label: "Pratos no Menu" },
    { number: "5000+", label: "Clientes Satisfeitos" },
  ];

  return (
    <section id="sobre" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal 
            direction="left"
            delay={0.2}
            duration={0.8}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nossa História
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Las Tortillas Mexican Grill nasceu do sonho de trazer os autênticos sabores mexicanos para Luanda. 
              Fundado em 14 de Fevereiro de 2018, somos um restaurante familiar que se dedica a preparar cada prato 
              com ingredientes frescos e receitas tradicionais passadas de geração em geração.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Há mais de 7 anos localizado na bela Ilha de Luanda, oferecemos uma experiência gastronómica única, 
              combinando a hospitalidade angolana com a paixão pela culinária mexicana. Nossa história começou 
              no Dia dos Namorados, simbolizando o amor que dedicamos à nossa culinária e aos nossos clientes.
            </p>
            <div className="flex items-center space-x-8">
              {stats.map((stat, index) => (
                <ScrollReveal
                  key={stat.label}
                  direction="up"
                  delay={0.6}
                  stagger={true}
                  staggerIndex={index}
                  staggerDelay={0.2}
                  duration={0.6}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-red-600">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
          
          <ScrollReveal 
            direction="right"
            delay={0.4}
            duration={0.8}
          >
            {/* Substituir vídeo por imagem para melhor compatibilidade */}
            <div className="relative rounded-2xl shadow-2xl w-full h-auto overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Interior do restaurante Las Tortillas Mexican Grill" 
                className="w-full h-auto rounded-2xl shadow-2xl"
                style={{ 
                  maxHeight: '600px', 
                  objectFit: 'cover'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-lg font-semibold">Ambiente acolhedor e familiar</p>
                <p className="text-sm opacity-90">Venha conhecer nosso espaço!</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
