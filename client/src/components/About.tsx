import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { useEffect, useRef } from "react";

export default function About() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const stats = [
    { number: "7+", label: "Anos de Experiência" },
    { number: "50+", label: "Pratos no Menu" },
    { number: "5000+", label: "Clientes Satisfeitos" },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Configurações para carregamento rápido e streaming
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
    
    // Força o carregamento imediato do vídeo otimizado
    video.load();
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reproduz imediatamente quando visível
            video.play().catch(error => {
              console.log('Autoplay blocked:', error);
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

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
            <video 
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="rounded-2xl shadow-2xl w-full h-auto"
              style={{ 
                maxHeight: '600px', 
                objectFit: 'cover',
                backgroundColor: '#1f2937'
              }}
            >
              <source src="/attached_assets/restaurant-video-optimized.mp4" type="video/mp4" />
              Seu navegador não suporta vídeos HTML5.
            </video>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
