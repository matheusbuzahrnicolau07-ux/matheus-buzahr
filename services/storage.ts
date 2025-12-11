
import { AnalysisRecord, User } from "../types";

const DB_NAME = "NutriVisionDB";
const STORE_HISTORY = "history";
const STORE_USER = "user";
const DB_VERSION = 1;

// Helper para abrir o banco de dados
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Verifica suporte
    if (!('indexedDB' in window)) {
        reject(new Error("Seu navegador não suporta armazenamento local."));
        return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store para histórico de refeições
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        const store = db.createObjectStore(STORE_HISTORY, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("userId", "userId", { unique: false });
      }

      // Store para dados do usuário
      if (!db.objectStoreNames.contains(STORE_USER)) {
        db.createObjectStore(STORE_USER, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const storageService = {
  // Salvar ou atualizar refeição
  saveRecord: async (record: AnalysisRecord): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, "readwrite");
      const store = tx.objectStore(STORE_HISTORY);
      const request = store.put(record);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Deletar refeição
  deleteRecord: async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, "readwrite");
      const store = tx.objectStore(STORE_HISTORY);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Buscar todo o histórico
  getAllHistory: async (userId?: string): Promise<AnalysisRecord[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_HISTORY, "readonly");
      const store = tx.objectStore(STORE_HISTORY);
      
      let request;
      if (userId) {
          const index = store.index("userId");
          request = index.getAll(userId);
      } else {
          request = store.getAll();
      }

      request.onsuccess = () => {
          const records = request.result || [];
          // Ordenar por data (mais recente primeiro)
          records.sort((a, b) => b.timestamp - a.timestamp);
          resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Salvar usuário
  saveUser: async (user: User): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_USER, "readwrite");
      const store = tx.objectStore(STORE_USER);
      const request = store.put(user);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Buscar usuário
  getUser: async (id: string): Promise<User | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_USER, "readonly");
      const store = tx.objectStore(STORE_USER);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
};
