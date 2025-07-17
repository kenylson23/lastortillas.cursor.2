"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSampleData = ensureSampleData;
exports.autoInitialize = autoInitialize;
const database_1 = require("./database");
const schema_1 = require("../../shared/schema");
const db = (0, database_1.getDatabase)();
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
    { tableNumber: 1, seats: 2, locationId: "centro", status: "available" },
    { tableNumber: 2, seats: 4, locationId: "centro", status: "available" },
    { tableNumber: 3, seats: 6, locationId: "centro", status: "available" },
    { tableNumber: 4, seats: 2, locationId: "centro", status: "available" },
    { tableNumber: 5, seats: 4, locationId: "centro", status: "available" },
    // Benfica
    { tableNumber: 1, seats: 2, locationId: "benfica", status: "available" },
    { tableNumber: 2, seats: 4, locationId: "benfica", status: "available" },
    { tableNumber: 3, seats: 6, locationId: "benfica", status: "available" },
    { tableNumber: 4, seats: 8, locationId: "benfica", status: "available" },
];
async function ensureSampleData() {
    try {
        // Check if menu items exist
        const existingMenuItems = await db.select().from(schema_1.menuItems).limit(1);
        if (existingMenuItems.length === 0) {
            console.log('🌮 Initializing sample menu items...');
            await db.insert(schema_1.menuItems).values(sampleMenuItems);
            console.log('✅ Sample menu items created');
        }
        // Check if tables exist
        const existingTables = await db.select().from(schema_1.tables).limit(1);
        if (existingTables.length === 0) {
            console.log('🪑 Initializing sample tables...');
            await db.insert(schema_1.tables).values(sampleTables);
            console.log('✅ Sample tables created');
        }
    }
    catch (error) {
        console.error('❌ Error initializing sample data:', error);
        // Don't throw error - API should still work without sample data
    }
}
// Auto-initialize on first import
let initialized = false;
async function autoInitialize() {
    if (!initialized) {
        initialized = true;
        await ensureSampleData();
    }
}
