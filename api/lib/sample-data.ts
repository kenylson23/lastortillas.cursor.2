import { getDatabase } from './database';
import { menuItems, tables } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const db = getDatabase();

const sampleMenuItems = [
  {
    name: "Tacos al Pastor",
    description: "Deliciosos tacos marinados com abacaxi grelhado e especiarias tradicionais mexicanas",
    price: 1500, // 15.00 AOA in cents
    category: "Tacos",
    available: true,
    preparationTime: 15,
    customizations: ["Sem cebola", "Extra picante", "Sem coentro"]
  },
  {
    name: "Quesadilla de Queijo",
    description: "Tortilla grelhada recheada com queijo derretido e servida com molho caseiro",
    price: 1200,
    category: "Quesadillas",
    available: true,
    preparationTime: 10,
    customizations: ["Extra queijo", "Com frango", "Com legumes"]
  },
  {
    name: "Nachos Supremos",
    description: "Chips de tortilla crocantes com queijo derretido, jalapeños e molhos especiais",
    price: 1800,
    category: "Entradas",
    available: true,
    preparationTime: 12,
    customizations: ["Extra guacamole", "Sem jalapeños", "Com carne"]
  },
  {
    name: "Burrito Las Tortillas",
    description: "Grande burrito recheado com feijão, arroz, queijo e sua escolha de proteína",
    price: 2200,
    category: "Burritos",
    available: true,
    preparationTime: 18,
    customizations: ["Com frango", "Com carne", "Vegetariano", "Extra molho"]
  },
  {
    name: "Água Fresca de Horchata",
    description: "Bebida tradicional mexicana doce e cremosa com canela",
    price: 800,
    category: "Bebidas",
    available: true,
    preparationTime: 5,
    customizations: ["Com gelo", "Sem açúcar"]
  }
];

const sampleTables = [
  // Centro (Talatona)
  { number: 1, capacity: 2, locationId: "centro", status: "available" },
  { number: 2, capacity: 4, locationId: "centro", status: "available" },
  { number: 3, capacity: 6, locationId: "centro", status: "available" },
  { number: 4, capacity: 2, locationId: "centro", status: "available" },
  { number: 5, capacity: 4, locationId: "centro", status: "available" },
  
  // Benfica
  { number: 1, capacity: 2, locationId: "benfica", status: "available" },
  { number: 2, capacity: 4, locationId: "benfica", status: "available" },
  { number: 3, capacity: 6, locationId: "benfica", status: "available" },
  { number: 4, capacity: 8, locationId: "benfica", status: "available" },
];

export async function ensureSampleData() {
  try {
    // Check if menu items exist
    const existingMenuItems = await db.select().from(menuItems).limit(1);
    
    if (existingMenuItems.length === 0) {
      console.log('🌮 Initializing sample menu items...');
      await db.insert(menuItems).values(sampleMenuItems);
      console.log('✅ Sample menu items created');
    }

    // Check if tables exist
    const existingTables = await db.select().from(tables).limit(1);
    
    if (existingTables.length === 0) {
      console.log('🪑 Initializing sample tables...');
      await db.insert(tables).values(sampleTables);
      console.log('✅ Sample tables created');
    }

  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    // Don't throw error - API should still work without sample data
  }
}

// Auto-initialize on first import
let initialized = false;
export async function autoInitialize() {
  if (!initialized) {
    initialized = true;
    await ensureSampleData();
  }
}