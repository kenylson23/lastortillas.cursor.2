import { memo } from "react";
import { motion } from "framer-motion";

// Dados estáticos para evitar dependência do React Query
const MENU_ITEMS = [
  {
    id: 1,
    name: "Tacos Especiais",
    description: "Tacos com carne, frango, peixe e vegetarianos",
    price: "15,00 AOA",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
  },
  {
    id: 2,
    name: "Quesadillas",
    description: "Tortillas grelhadas com queijo e recheios variados",
    price: "12,00 AOA",
    image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
  },
  {
    id: 3,
    name: "Burritos",
    description: "Tortillas recheadas com carne, feijão e vegetais",
    price: "18,00 AOA",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
  }
];

const MenuItemCard = memo(({ item, index }: { item: typeof MENU_ITEMS[0], index: number }) => {
  return (
        <motion.div 
      initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
      <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={item.image} 
                    alt={item.name} 
          className="w-full h-48 object-cover"
          loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-red-600">{item.price}</span>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Ver Menu Completo
          </button>
                </div>
              </div>
            </motion.div>
  );
});

export default function SimpleMenuShowcase() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Nossos Pratos Especiais
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Descubra a autenticidade da culinária mexicana em cada prato
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MENU_ITEMS.map((item, index) => (
            <MenuItemCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
            <a
              href="/menu"
            className="inline-flex items-center px-8 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
            Ver Menu Completo
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}