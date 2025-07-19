import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware para JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'client/dist')));

// Simular Vercel API routes
app.use('/api/menu-items', async (req, res) => {
  try {
    const handler = await import('./api/menu-items.js');
    await handler.default(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/reservations', async (req, res) => {
  try {
    const handler = await import('./api/reservations.js');
    await handler.default(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/orders', async (req, res) => {
  try {
    const handler = await import('./api/orders.js');
    await handler.default(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/contacts', async (req, res) => {
  try {
    const handler = await import('./api/contacts.js');
    await handler.default(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth/login', async (req, res) => {
  try {
    const handler = await import('./api/auth/login.js');
    await handler.default(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth/register', async (req, res) => {
  try {
    const handler = await import('./api/auth/register.js');
    await handler.default(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Vercel simulation running on port ${PORT}`);
});