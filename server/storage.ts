import { users, reservations, contacts, type User, type InsertUser, type Reservation, type InsertReservation, type Contact, type InsertContact } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  createContact(contact: InsertContact): Promise<Contact>;
  getAllReservations(): Promise<Reservation[]>;
  checkAvailability(date: string, time: string): Promise<boolean>;
  getReservationsByDate(date: string): Promise<Reservation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reservations: Map<number, Reservation>;
  private contacts: Map<number, Contact>;
  private currentUserId: number;
  private currentReservationId: number;
  private currentContactId: number;
  private reservationMutex: Promise<void> = Promise.resolve();
  // Índice para busca rápida por data+hora
  private reservationIndex: Map<string, number> = new Map();

  constructor() {
    this.users = new Map();
    this.reservations = new Map();
    this.contacts = new Map();
    this.currentUserId = 1;
    this.currentReservationId = 1;
    this.currentContactId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    // Implementa mutex para evitar condições de corrida
    await this.reservationMutex;
    
    return new Promise((resolve, reject) => {
      this.reservationMutex = (async () => {
        try {
          // Busca rápida O(1) usando índice
          const dateTimeKey = `${insertReservation.date}-${insertReservation.time}`;
          
          if (this.reservationIndex.has(dateTimeKey)) {
            throw new Error('Horário já reservado');
          }
          
          // Gerar ID único de forma thread-safe
          const id = this.currentReservationId++;
          const reservation: Reservation = { 
            ...insertReservation,
            email: insertReservation.email || null,
            notes: insertReservation.notes || null,
            id, 
            createdAt: new Date() 
          };
          
          // Armazenar com índice para busca rápida
          this.reservations.set(id, reservation);
          this.reservationIndex.set(dateTimeKey, id);
          resolve(reservation);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact,
      phone: insertContact.phone || null,
      id, 
      createdAt: new Date() 
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getAllReservations(): Promise<Reservation[]> {
    return Array.from(this.reservations.values());
  }

  async checkAvailability(date: string, time: string): Promise<boolean> {
    const dateTimeKey = `${date}-${time}`;
    return !this.reservationIndex.has(dateTimeKey);
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(
      (r) => r.date === date
    );
  }
}

export const storage = new MemStorage();
