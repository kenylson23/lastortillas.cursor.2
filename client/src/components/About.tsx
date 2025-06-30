import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

export default function About() {
  const stats = [
    { number: "4+", label: "Anos de Experiência" },
    { number: "50+", label: "Pratos no Menu" },
    { number: "1000+", label: "Clientes Satisfeitos" },
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
              Las Tortilhas nasceu do sonho de trazer os autênticos sabores mexicanos para Luanda. 
              Fundado em 2020, somos um restaurante familiar que se dedica a preparar cada prato 
              com ingredientes frescos e receitas tradicionais passadas de geração em geração.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Localizado na bela Ilha de Luanda, oferecemos uma experiência gastronómica única, 
              combinando a hospitalidade angolana com a paixão pela culinária mexicana.
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
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Interior moderno do restaurante" 
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
