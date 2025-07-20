// WebSocket client for real-time updates
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners = new Map<string, Set<(data: any) => void>>();

  constructor() {
    // Only connect in production to avoid conflicts with Vite WebSocket in development
    if (import.meta.env.PROD) {
      this.connect();
    }
  }

  private connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.broadcast(message.type, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, delay);
    }
  }

  private broadcast(type: string, data: any) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => listener(data));
    }
  }

  // Subscribe to a specific update type
  subscribe(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(callback);
        if (typeListeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  // Check if WebSocket is connected
  isConnected() {
    // In development, always return false to avoid conflicts with Vite
    if (import.meta.env.DEV) {
      return false;
    }
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const wsManager = new WebSocketManager();

import { useEffect } from 'react';

// React hook for real-time updates
export function useRealTimeUpdates(type: string, callback: (data: any) => void) {
  useEffect(() => {
    const unsubscribe = wsManager.subscribe(type, callback);
    return unsubscribe;
  }, [type, callback]);
}