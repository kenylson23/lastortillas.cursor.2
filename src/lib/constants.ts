export const MENU_ITEMS = [
  {
    id: 1,
    name: "Tacos al Pastor",
    description: "Tacos tradicionais com carne de porco marinada, abacaxi e cebola",
    price: 1500,
    category: "Tacos",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 15,
    customizations: ["Sem cebola", "Extra molho", "Molho picante"]
  },
  {
    id: 2,
    name: "Quesadillas de Frango",
    description: "Tortillas grelhadas com queijo derretido e frango temperado",
    price: 1200,
    category: "Quesadillas",
    image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 12,
    customizations: ["Extra queijo", "Sem pimentão", "Com guacamole"]
  },
  {
    id: 3,
    name: "Burrito Supreme",
    description: "Burrito grande com feijão preto, arroz, carne e molhos especiais",
    price: 1800,
    category: "Burritos",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 18,
    customizations: ["Sem feijão", "Extra carne", "Molho suave"]
  },
  {
    id: 4,
    name: "Nachos Supreme",
    description: "Chips de tortilla com queijo derretido, jalapeños e molhos",
    price: 1400,
    category: "Aperitivos",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 10,
    customizations: ["Sem jalapeños", "Extra queijo", "Com guacamole"]
  },
  {
    id: 5,
    name: "Enchiladas Verdes",
    description: "Tortillas enroladas com frango e molho verde especial",
    price: 1600,
    category: "Enchiladas",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 20,
    customizations: ["Molho suave", "Extra queijo", "Sem cebola"]
  },
  {
    id: 6,
    name: "Fajitas de Carne",
    description: "Carne grelhada com pimentões, cebolas e tortillas quentes",
    price: 2000,
    category: "Fajitas",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 25,
    customizations: ["Bem passada", "Mal passada", "Extra vegetais"]
  },
  {
    id: 7,
    name: "Churros com Doce de Leite",
    description: "Churros crocantes polvilhados com açúcar e canela",
    price: 800,
    category: "Sobremesas",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 8,
    customizations: ["Sem canela", "Extra doce de leite", "Com chocolate"]
  },
  {
    id: 8,
    name: "Guacamole Tradicional",
    description: "Abacate fresco amassado com limão, alho e coentros",
    price: 1000,
    category: "Aperitivos",
    image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 5,
    customizations: ["Sem coentros", "Extra limão", "Molho picante"]
  },
  {
    id: 9,
    name: "Margarita Clássica",
    description: "Cocktail refrescante com tequila, limão e sal na borda",
    price: 1200,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 3,
    customizations: ["Sem sal", "Com morango", "Frozen"]
  },
  {
    id: 10,
    name: "Água de Coco",
    description: "Água de coco natural gelada",
    price: 500,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
    available: true,
    preparationTime: 1,
    customizations: []
  }
] as const;

export const MENU_CATEGORIES = [
  "Todos",
  "Tacos", 
  "Quesadillas",
  "Burritos", 
  "Enchiladas",
  "Fajitas",
  "Aperitivos",
  "Sobremesas",
  "Bebidas"
] as const;

export const RESTAURANT_INFO = {
  name: "Las Tortillas Mexican Grill",
  description: "Quer passar o dia com a família? É no Las Tortillas. O único restaurante mexicano com ambiente 100% familiar em Luanda.",
  phone: "+244 949 639 932",
  email: "info@lastortillas.ao",
  address: "Ilha de Luanda, Angola",
  hours: "Seg-Qui: 11:00 - 23:00 | Sex-Dom: 11:00 - 01:00"
};

export const LOCATIONS = [
  {
    id: "ilha",
    name: "Ilha de Luanda",
    address: "Rua Rei Katyavala, Ilha de Luanda",
    phone: "+244 949 639 932",
    hours: "Seg-Qui: 11:00-23:00 | Sex-Dom: 11:00-01:00",
    deliveryFee: 500
  },
  {
    id: "talatona", 
    name: "Talatona",
    address: "Edifício Plaza, Talatona",
    phone: "+244 949 639 932",
    hours: "Seg-Dom: 11:00-23:00",
    deliveryFee: 300
  },
  {
    id: "movel",
    name: "Food Truck Móvel",
    address: "Várias localizações",
    phone: "+244 949 639 932", 
    hours: "Seg-Sex: 17:00-22:00",
    deliveryFee: 0
  }
] as const;

// Função para gerar ID único de pedido
export const generateOrderId = () => {
  return `LT${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
};

// Função para formatar preço
export const formatPrice = (price: number) => {
  return `${price.toLocaleString('pt-AO')} AOA`;
};

// Função para criar mensagem WhatsApp de pedido
export const createWhatsAppOrderMessage = (orderData: any) => {
  const { customerInfo, cart, orderId, location, total } = orderData;
  
  let message = `🌮 *NOVO PEDIDO - Las Tortillas*\n\n`;
  message += `📋 *Pedido:* ${orderId}\n`;
  message += `📍 *Local:* ${location.name}\n`;
  message += `🕒 *Data:* ${new Date().toLocaleString('pt-AO')}\n\n`;
  
  message += `👤 *CLIENTE*\n`;
  message += `Nome: ${customerInfo.name}\n`;
  message += `Telefone: ${customerInfo.phone}\n`;
  if (customerInfo.email) message += `Email: ${customerInfo.email}\n`;
  
  if (customerInfo.orderType === 'delivery' && customerInfo.address) {
    message += `📦 Entrega: ${customerInfo.address}\n`;
  } else if (customerInfo.orderType === 'takeaway') {
    message += `🏃 Retirada no local\n`;
  } else if (customerInfo.orderType === 'dine-in') {
    message += `🍽️ Consumo no local\n`;
  }
  
  message += `💳 Pagamento: ${customerInfo.paymentMethod === 'cash' ? 'Dinheiro' : customerInfo.paymentMethod === 'card' ? 'Cartão' : 'Transferência'}\n\n`;
  
  message += `🛒 *ITENS DO PEDIDO*\n`;
  cart.forEach((item: any, index: number) => {
    message += `${index + 1}. ${item.name} x${item.quantity}\n`;
    if (item.customizations && item.customizations.length > 0) {
      message += `   Obs: ${item.customizations.join(', ')}\n`;
    }
    message += `   ${formatPrice(item.price * item.quantity)}\n\n`;
  });
  
  if (customerInfo.orderType === 'delivery' && location.deliveryFee > 0) {
    message += `🚚 Taxa de entrega: ${formatPrice(location.deliveryFee)}\n`;
  }
  
  message += `💰 *TOTAL: ${formatPrice(total)}*\n\n`;
  
  if (customerInfo.notes) {
    message += `📝 *Observações:* ${customerInfo.notes}\n\n`;
  }
  
  message += `✅ Por favor, confirme o recebimento deste pedido.`;
  
  return encodeURIComponent(message);
};
