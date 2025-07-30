import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../shared/storage';
import { insertTableSchema } from '../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Adicionar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      console.log('Table creation request body:', req.body);
      
      // Validar o schema
      const table = insertTableSchema.parse(req.body);
      console.log('Parsed table data:', table);
      
      const newTable = await storage.createTable(table);
      console.log('Created table:', newTable);
      
      res.status(201).json(newTable);
    } catch (error) {
      console.error('Table creation error:', error);
      
      // Se for erro de validação Zod, retornar detalhes
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(400).json({ message: "Failed to create table" });
      }
    }
  } else if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      if (id) {
        const table = await storage.getTableById(id as string);
        if (!table) {
          return res.status(404).json({ message: "Table not found" });
        }
        res.json(table);
      } else {
        // Chamar getAllTables sem argumentos - corrigido
        const tables = await (storage.getAllTables as () => Promise<any>)();
        res.json(tables);
      }
    } catch (error) {
      console.error('Tables fetch error:', error);
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: "Table ID is required" });
      }
      
      const updates = req.body;
      const updatedTable = await storage.updateTable(parseInt(id as string), updates);
      
      res.json(updatedTable);
    } catch (error) {
      console.error('Table update error:', error);
      res.status(400).json({ message: "Failed to update table" });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: "Table ID is required" });
      }
      
      await storage.deleteTable(parseInt(id as string));
      res.status(204).send();
    } catch (error) {
      console.error('Table deletion error:', error);
      res.status(400).json({ message: "Failed to delete table" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 