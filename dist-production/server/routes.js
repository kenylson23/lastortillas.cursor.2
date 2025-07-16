"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const storage_1 = require("./storage");
const auth_1 = require("./auth");
// Zod schemas for validation (will be replaced with Prisma types)
const zod_1 = require("zod");
// Validation schemas
const insertReservationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    date: zod_1.z.string().min(1),
    time: zod_1.z.string().min(1),
    guests: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
    notes: zod_1.z.string().optional(),
});
const insertContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    message: zod_1.z.string().min(1),
});
const insertMenuItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    price: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
    category: zod_1.z.string().min(1),
    image: zod_1.z.string().optional(),
    available: zod_1.z.boolean().default(true),
    preparationTime: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val).default(15),
    customizations: zod_1.z.array(zod_1.z.string()).default([]),
});
const insertOrderSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1),
    customerPhone: zod_1.z.string().min(1),
    customerEmail: zod_1.z.string().email().optional(),
    deliveryAddress: zod_1.z.string().optional(),
    orderType: zod_1.z.enum(['delivery', 'takeaway', 'dine-in']),
    locationId: zod_1.z.string().min(1),
    tableId: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val).optional(),
    totalAmount: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
    paymentMethod: zod_1.z.enum(['cash', 'card', 'transfer']),
    paymentStatus: zod_1.z.enum(['pending', 'paid', 'failed']).default('pending'),
    notes: zod_1.z.string().optional(),
    estimatedDeliveryTime: zod_1.z.string().optional(),
});
const insertOrderItemSchema = zod_1.z.object({
    orderId: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
    menuItemId: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
    quantity: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
    unitPrice: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val),
    customizations: zod_1.z.array(zod_1.z.string()).default([]),
});
const insertTableSchema = zod_1.z.object({
    locationId: zod_1.z.string().min(1),
    tableNumber: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
    seats: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
    status: zod_1.z.enum(['available', 'occupied', 'reserved', 'maintenance']).default('available'),
});
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Cache otimizado para verificação de disponibilidade
const availabilityCache = new Map();
const CACHE_DURATION = 5000; // 5 segundos para dados mais atualizados
// Cache para resultados de reservas por data
const reservationsCache = new Map();
const RESERVATIONS_CACHE_DURATION = 30 * 1000; // 30 segundos
// Função para limpar cache expirado
function cleanExpiredCache() {
    const now = Date.now();
    // Limpar cache de disponibilidade
    for (const [key, value] of availabilityCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            availabilityCache.delete(key);
        }
    }
    // Limpar cache de reservas
    for (const [key, value] of reservationsCache.entries()) {
        if (now - value.timestamp > RESERVATIONS_CACHE_DURATION) {
            reservationsCache.delete(key);
        }
    }
}
// Executar limpeza do cache a cada 30 segundos
setInterval(cleanExpiredCache, 30 * 1000);
// Configurar multer para upload de arquivos
const uploadsDir = path_1.default.join(process.cwd(), 'public', 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage_multer = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'menu-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage_multer,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Apenas arquivos de imagem são permitidos'));
        }
    }
});
async function registerRoutes(app) {
    // Headers otimizados para performance
    app.use((req, res, next) => {
        // Headers de cache para APIs
        if (req.url.startsWith('/api/')) {
            res.set('Cache-Control', 'public, max-age=5'); // 5 segundos para APIs
        }
        // Headers de segurança e performance
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
        res.set('X-XSS-Protection', '1; mode=block');
        next();
    });
    // ================================
    // AUTHENTICATION ROUTES
    // ================================
    // Login endpoint
    app.post("/api/auth/login", async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    message: 'Username e password são obrigatórios'
                });
            }
            // Validar credenciais
            const user = await (0, auth_1.validateCredentials)(username, password);
            if (!user) {
                return res.status(401).json({
                    message: 'Credenciais inválidas'
                });
            }
            // Gerar token JWT
            const token = (0, auth_1.generateToken)(user);
            // Retornar dados do usuário e token
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                },
                token,
                expiresIn: '7d'
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                message: 'Erro interno do servidor'
            });
        }
    });
    // Token verification endpoint
    app.get("/api/auth/verify", auth_1.authenticateToken, async (req, res) => {
        try {
            // Se chegou até aqui, o token é válido
            res.json({
                authenticated: true,
                user: req.user
            });
        }
        catch (error) {
            console.error('Token verification error:', error);
            res.status(500).json({
                message: 'Erro interno do servidor',
                authenticated: false
            });
        }
    });
    // Logout endpoint
    app.post("/api/auth/logout", async (req, res) => {
        try {
            // Para JWT, logout é principalmente client-side (remover token)
            res.json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                message: 'Erro interno do servidor'
            });
        }
    });
    // Check availability endpoint com cache
    app.get("/api/availability", async (req, res) => {
        try {
            const { date, time } = req.query;
            if (!date || !time) {
                return res.status(400).json({ message: "Date and time are required" });
            }
            const cacheKey = `${date}-${time}`;
            const cached = availabilityCache.get(cacheKey);
            const now = Date.now();
            // Verificar se cache é válido
            if (cached && (now - cached.timestamp) < CACHE_DURATION) {
                // Headers de cache para resposta cacheada
                res.set('Cache-Control', 'public, max-age=5');
                res.set('X-Cache', 'HIT');
                return res.json({ available: cached.available });
            }
            const isAvailable = await storage_1.storage.checkAvailability(date, time);
            // Armazenar no cache
            availabilityCache.set(cacheKey, { available: isAvailable, timestamp: now });
            // Headers de cache para resposta nova
            res.set('Cache-Control', 'public, max-age=5');
            res.set('X-Cache', 'MISS');
            res.json({ available: isAvailable });
        }
        catch (error) {
            res.status(500).json({ message: "Failed to check availability" });
        }
    });
    // Reservation endpoint
    app.post("/api/reservations", async (req, res) => {
        try {
            const reservation = insertReservationSchema.parse(req.body);
            const newReservation = await storage_1.storage.createReservation(reservation);
            // Limpar cache após criação de reserva
            const cacheKey = `${reservation.date}-${reservation.time}`;
            availabilityCache.delete(cacheKey);
            // Limpar cache de reservas para a data
            const reservationsCacheKey = `reservations-${reservation.date}`;
            reservationsCache.delete(reservationsCacheKey);
            res.json(newReservation);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ message: "Invalid reservation data", errors: error.errors });
            }
            else if (error instanceof Error && error.message === 'Horário já reservado') {
                res.status(409).json({ message: "Horário já reservado. Escolha outro horário." });
            }
            else {
                res.status(500).json({ message: "Failed to create reservation" });
            }
        }
    });
    // Contact form endpoint
    app.post("/api/contacts", async (req, res) => {
        try {
            const contact = insertContactSchema.parse(req.body);
            const newContact = await storage_1.storage.createContact(contact);
            res.json(newContact);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ message: "Invalid contact data", errors: error.errors });
            }
            else {
                res.status(500).json({ message: "Failed to create contact" });
            }
        }
    });
    // Get reservations by date com cache
    app.get("/api/reservations/date/:date", async (req, res) => {
        try {
            const { date } = req.params;
            const cacheKey = `reservations-${date}`;
            const cached = reservationsCache.get(cacheKey);
            const now = Date.now();
            // Verificar se cache é válido
            if (cached && (now - cached.timestamp) < RESERVATIONS_CACHE_DURATION) {
                return res.json(cached.data);
            }
            const reservations = await storage_1.storage.getReservationsByDate(date);
            // Armazenar no cache
            reservationsCache.set(cacheKey, { data: reservations, timestamp: now });
            res.json(reservations);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch reservations for date" });
        }
    });
    // Get reservations (admin only - simplified for demo)
    app.get("/api/reservations", async (req, res) => {
        try {
            const reservations = await storage_1.storage.getAllReservations();
            res.json(reservations);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to fetch reservations" });
        }
    });
    // Menu Items endpoints for admin
    app.get("/api/menu-items", async (req, res) => {
        try {
            const menuItems = await storage_1.storage.getAllMenuItems();
            res.json(menuItems);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    app.post("/api/menu-items", async (req, res) => {
        try {
            const validatedItem = insertMenuItemSchema.parse(req.body);
            const menuItem = await storage_1.storage.createMenuItem(validatedItem);
            res.status(201).json(menuItem);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
            }
            else {
                res.status(500).json({ error: error.message });
            }
        }
    });
    app.put("/api/menu-items/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const updates = req.body;
            // Validar dados essenciais
            if (updates.name && typeof updates.name !== 'string') {
                return res.status(400).json({ error: "Nome deve ser uma string" });
            }
            if (updates.price && typeof updates.price !== 'string') {
                return res.status(400).json({ error: "Preço deve ser uma string" });
            }
            if (updates.category && typeof updates.category !== 'string') {
                return res.status(400).json({ error: "Categoria deve ser uma string" });
            }
            const menuItem = await storage_1.storage.updateMenuItem(id, updates);
            res.json(menuItem);
        }
        catch (error) {
            console.error("Erro ao atualizar item:", error);
            res.status(500).json({ error: error.message });
        }
    });
    app.delete("/api/menu-items/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            // Verificar se o item existe
            const existingItem = await storage_1.storage.getMenuItem(id);
            if (!existingItem) {
                return res.status(404).json({ error: "Item não encontrado" });
            }
            await storage_1.storage.deleteMenuItem(id);
            res.json({ message: "Item removido com sucesso" });
        }
        catch (error) {
            console.error("Erro ao remover item:", error);
            res.status(500).json({ error: error.message });
        }
    });
    // Menu Items endpoints for customers
    app.get("/api/menu", async (req, res) => {
        try {
            const menuItems = await storage_1.storage.getAllMenuItems();
            res.json(menuItems);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    app.get("/api/menu/category/:category", async (req, res) => {
        try {
            const { category } = req.params;
            const menuItems = await storage_1.storage.getMenuItemsByCategory(category);
            res.json(menuItems);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    app.get("/api/menu/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const menuItem = await storage_1.storage.getMenuItem(id);
            if (!menuItem) {
                return res.status(404).json({ error: "Menu item not found" });
            }
            res.json(menuItem);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // Simplified auth - no authentication required
    app.get('/api/auth/user', async (req, res) => {
        // Return a simple admin user for development
        res.json({
            id: 'admin',
            email: 'admin@lastortillas.com',
            firstName: 'Admin',
            lastName: 'User'
        });
    });
    // Orders endpoints
    app.post("/api/orders", async (req, res) => {
        try {
            console.log('Received order request:', JSON.stringify(req.body, null, 2));
            const { order, items } = req.body;
            if (!order) {
                return res.status(400).json({ error: "Order data is required" });
            }
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ error: "Items array is required" });
            }
            // Validate order
            const validatedOrder = insertOrderSchema.parse(order);
            console.log('Validated order:', validatedOrder);
            // Validate items
            const validatedItems = items.map((item) => {
                console.log('Validating item:', item);
                return insertOrderItemSchema.parse(item);
            });
            console.log('Validated items:', validatedItems);
            const result = await storage_1.storage.createOrder(validatedOrder, validatedItems);
            // Send WhatsApp notification (optional - can be implemented later)
            // await sendWhatsAppNotification(result);
            res.json(result);
        }
        catch (error) {
            console.error('Order creation error:', error);
            res.status(400).json({ error: error.message });
        }
    });
    // Update order status
    app.patch("/api/orders/:id/status", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (!['received', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            const updatedOrder = await storage_1.storage.updateOrderStatus(id, status);
            // Send WhatsApp notification about status change (optional)
            // await sendStatusUpdateNotification(updatedOrder);
            res.json(updatedOrder);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
    // Get all orders with optional filtering
    app.get("/api/orders", async (req, res) => {
        try {
            const { status, location } = req.query;
            let orders;
            if (status) {
                orders = await storage_1.storage.getOrdersByStatus(status);
            }
            else if (location) {
                orders = await storage_1.storage.getOrdersByLocation(location);
            }
            else {
                orders = await storage_1.storage.getAllOrders();
            }
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // Get specific order with items
    app.get("/api/orders/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const order = await storage_1.storage.getOrder(id);
            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }
            const items = await storage_1.storage.getOrderItems(id);
            res.json({ ...order, items });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // Delete order (admin only)
    app.delete("/api/orders/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            // Verificar se o pedido existe
            const existingOrder = await storage_1.storage.getOrder(id);
            if (!existingOrder) {
                return res.status(404).json({ error: "Pedido não encontrado" });
            }
            // Remove order and associated items
            await storage_1.storage.deleteOrder(id);
            res.json({ message: "Pedido removido com sucesso" });
        }
        catch (error) {
            console.error("Erro ao remover pedido:", error);
            res.status(500).json({ error: error.message });
        }
    });
    // Upload de imagens
    app.post('/api/upload-image', upload.single('image'), (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
            }
            const imageUrl = `/uploads/${req.file.filename}`;
            res.json({ imageUrl });
        }
        catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({ error: 'Erro ao processar upload da imagem' });
        }
    });
    // Tables routes
    // Get all tables
    app.get("/api/tables", async (req, res) => {
        try {
            const { location } = req.query;
            let tables;
            if (location) {
                tables = await storage_1.storage.getTablesByLocation(location);
            }
            else {
                tables = await storage_1.storage.getAllTables();
            }
            res.json(tables);
        }
        catch (error) {
            console.error('Error fetching tables:', error);
            res.status(500).json({ error: error.message });
        }
    });
    // Get specific table
    app.get("/api/tables/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const table = await storage_1.storage.getTable(id);
            if (!table) {
                return res.status(404).json({ error: "Mesa não encontrada" });
            }
            res.json(table);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // Create table
    app.post("/api/tables", async (req, res) => {
        try {
            const validatedData = insertTableSchema.parse(req.body);
            const table = await storage_1.storage.createTable(validatedData);
            res.status(201).json(table);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ error: "Dados inválidos", details: error.errors });
            }
            res.status(500).json({ error: error.message });
        }
    });
    // Update table
    app.put("/api/tables/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const existingTable = await storage_1.storage.getTable(id);
            if (!existingTable) {
                return res.status(404).json({ error: "Mesa não encontrada" });
            }
            const table = await storage_1.storage.updateTable(id, req.body);
            res.json(table);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // Update table status
    app.patch("/api/tables/:id/status", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;
            if (!status || !['available', 'occupied', 'reserved', 'maintenance'].includes(status)) {
                return res.status(400).json({ error: "Status inválido" });
            }
            const table = await storage_1.storage.updateTableStatus(id, status);
            res.json(table);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // Delete table
    app.delete("/api/tables/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const existingTable = await storage_1.storage.getTable(id);
            if (!existingTable) {
                return res.status(404).json({ error: "Mesa não encontrada" });
            }
            await storage_1.storage.deleteTable(id);
            res.json({ message: "Mesa removida com sucesso" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
