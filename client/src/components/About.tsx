import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import { useEffect, useRef, useState } from "react";

export default function About() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  const stats = [
    { number: "7+", label: "Anos de Experiência" },
    { number: "50+", label: "Pratos no Menu" },
    { number: "5000+", label: "Clientes Satisfeitos" },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Otimizações para melhor performance
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Carrega o vídeo apenas quando necessário
            if (video.readyState === 0) {
              video.load();
            }
            
            // Aguarda buffer antes de reproduzir
            const playWhenReady = () => {
              if (video.readyState >= 3) {
                video.play().catch(error => {
                  console.log('Autoplay blocked:', error);
                });
              } else {
                video.addEventListener('canplaythrough', () => {
                  video.play().catch(error => {
                    console.log('Autoplay blocked:', error);
                  });
                }, { once: true });
              }
            };
            
            playWhenReady();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);

    // Listener para erros de reprodução
    const handleError = () => {
      console.log('Video playback error, attempting to restart...');
      video.load();
    };

    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleError);

    return () => {
      observer.disconnect();
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleError);
    };
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
            <div className="relative rounded-2xl shadow-2xl overflow-hidden">
              {!isVideoLoaded && (
                <img 
                  src="/attached_assets/From tortillas with Love   photo credit @andersson_samd_1751272348650.jpg"
                  alt="Interior do restaurante Las Tortillas"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '600px' }}
                />
              )}
              
              <video 
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                className={`w-full h-auto object-cover ${!isVideoLoaded ? 'absolute inset-0 opacity-0' : ''}`}
                style={{ maxHeight: '600px' }}
                onLoadedData={() => setIsVideoLoaded(true)}
                onCanPlay={() => console.log('Video ready')}
                onError={() => console.log('Video error')}
              >
                <source src="/attached_assets/restaurant-video.mp4" type="video/mp4" />
              </video>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
