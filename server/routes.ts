import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReservationSchema, insertContactSchema } from "@shared/schema";
import { z } from "zod";

// Cache simples para verificação de disponibilidade
const availabilityCache = new Map<string, { available: boolean; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 segundos

export async function registerRoutes(app: Express): Promise<Server> {
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
        return res.json({ available: cached.available });
      }
      
      const isAvailable = await storage.checkAvailability(date as string, time as string);
      
      // Armazenar no cache
      availabilityCache.set(cacheKey, { available: isAvailable, timestamp: now });
      
      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Reservation endpoint
  app.post("/api/reservations", async (req, res) => {
    try {
      const reservation = insertReservationSchema.parse(req.body);
      const newReservation = await storage.createReservation(reservation);
      
      // Limpar cache após criação de reserva
      const cacheKey = `${reservation.date}-${reservation.time}`;
      availabilityCache.delete(cacheKey);
      
      res.json(newReservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid reservation data", errors: error.errors });
      } else if (error instanceof Error && error.message === 'Horário já reservado') {
        res.status(409).json({ message: "Horário já reservado. Escolha outro horário." });
      } else {
        res.status(500).json({ message: "Failed to create reservation" });
      }
    }
  });

  // Contact form endpoint
  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contact);
      res.json(newContact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create contact" });
      }
    }
  });

  // Get reservations by date
  app.get("/api/reservations/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const reservations = await storage.getReservationsByDate(date);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations for date" });
    }
  });

  // Get reservations (admin only - simplified for demo)
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await storage.getAllReservations();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reservations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
