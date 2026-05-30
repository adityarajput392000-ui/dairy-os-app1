"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, push, update } from 'firebase/database';

export type TransactionType = 'INFLOW' | 'OUTFLOW' | 'SPOILAGE' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  entity: string;
  volume?: number;
  amount?: number;
  timestamp: string;
  notes?: string;
}

export interface Bandi {
  name: string;
  expectedLiters: number;
  receivedToday: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  type: string;
}

export interface PendingRequest {
  id: string;
  type: 'SUPPLIER' | 'BANDI';
  name: string;
  milkType?: string; // For suppliers
  expectedLiters?: number; // For bandis
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface DairyState {
  rawMilk: number;
  matha: number;
  polythene: number;
  gallaBalance: number;
  transactions: Transaction[];
  bandis: Bandi[];
  suppliers: Supplier[];
  pendingRequests: PendingRequest[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateBandiStatus: (name: string, received: boolean) => void;
  addSupplier: (name: string, type: string) => void;
  requestAddition: (req: Omit<PendingRequest, 'id' | 'status'>) => void;
  resolveRequest: (id: string, approve: boolean) => void;
  seedDatabase: () => void;
}

const initialState: DairyState = {
  rawMilk: 0,
  matha: 0,
  polythene: 1000,
  gallaBalance: 5000, // starting float
  transactions: [],
  bandis: [
    { name: 'Sharma Ji', expectedLiters: 50, receivedToday: false },
    { name: 'Durga Nagar', expectedLiters: 30, receivedToday: false }
  ],
  suppliers: [
    { id: '1', name: 'Madan Lal', type: 'Buffalo' },
    { id: '2', name: 'Hari Shingh', type: 'Buffalo' },
    { id: '3', name: 'Dharmendra', type: 'Cow' },
    { id: '4', name: 'Mahesh', type: 'Mixed' },
  ],
  pendingRequests: [],
  addTransaction: () => {},
  updateBandiStatus: () => {},
  addSupplier: () => {},
  requestAddition: () => {},
  resolveRequest: () => {},
  seedDatabase: () => {}
};

const DairyContext = createContext<DairyState>(initialState);

export const DairyProvider = ({ children }: { children: ReactNode }) => {
  const [rawMilk, setRawMilk] = useState(0);
  const [matha, setMatha] = useState(0);
  const [polythene, setPolythene] = useState(0);
  const [gallaBalance, setGallaBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bandis, setBandis] = useState<Bandi[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  // FIREBASE SYNC
  useEffect(() => {
    const unsubrawMilk = onValue(ref(database, 'rawMilk'), snap => setRawMilk(snap.val() || 0));
    const unsubMatha = onValue(ref(database, 'matha'), snap => setMatha(snap.val() || 0));
    const unsubPoly = onValue(ref(database, 'polythene'), snap => setPolythene(snap.val() || 0));
    const unsubGalla = onValue(ref(database, 'gallaBalance'), snap => setGallaBalance(snap.val() || 0));

    const unsubTx = onValue(ref(database, 'transactions'), snap => {
      const data = snap.val();
      if (data) {
        // Sort descending by timestamp
        const txs = Object.values(data) as Transaction[];
        setTransactions(txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } else {
        setTransactions([]);
      }
    });

    const unsubBandis = onValue(ref(database, 'bandis'), snap => {
      const data = snap.val();
      setBandis(data ? Object.values(data) : initialState.bandis); // fallback to initial for demo if empty
    });

    const unsubSuppliers = onValue(ref(database, 'suppliers'), snap => {
      const data = snap.val();
      setSuppliers(data ? Object.values(data) : initialState.suppliers);
    });

    const unsubPending = onValue(ref(database, 'pendingRequests'), snap => {
      const data = snap.val();
      setPendingRequests(data ? Object.values(data) : []);
    });

    return () => {
      unsubrawMilk(); unsubMatha(); unsubPoly(); unsubGalla();
      unsubTx(); unsubBandis(); unsubSuppliers(); unsubPending();
    };
  }, []);

  const requestAddition = (req: Omit<PendingRequest, 'id' | 'status'>) => {
    const newRef = push(ref(database, 'pendingRequests'));
    set(newRef, { ...req, id: newRef.key, status: 'PENDING' });
  };

  const resolveRequest = (id: string, approve: boolean) => {
    const req = pendingRequests.find(p => p.id === id);
    if (req && approve) {
      if (req.type === 'SUPPLIER') {
        addSupplier(req.name, req.milkType || 'Mixed');
      } else if (req.type === 'BANDI') {
        const newBandiRef = push(ref(database, 'bandis'));
        set(newBandiRef, { name: req.name, expectedLiters: req.expectedLiters || 0, receivedToday: false });
      }
    }
    set(ref(database, `pendingRequests/${id}`), null); // Delete request
  };

  const addSupplier = (name: string, type: string) => {
    const newRef = push(ref(database, 'suppliers'));
    set(newRef, { id: newRef.key, name, type });
  };

  const updateBandiStatus = (name: string, received: boolean) => {
    // Find the bandi key
    const bandiEntry = Object.entries(bandis).find(([_, b]) => b.name === name);
    // Note: since we store bandis directly without IDs in the initial state, 
    // a production app would use unique keys. For now we just rewrite the whole array to Firebase
    const updatedBandis = bandis.map(b => b.name === name ? { ...b, receivedToday: received } : b);
    set(ref(database, 'bandis'), updatedBandis);
  };

  const seedDatabase = () => {
    // Only seed if empty
    if (bandis.length === 0) {
      initialState.bandis.forEach(b => {
        const r = push(ref(database, 'bandis'));
        set(r, b);
      });
    }
    if (suppliers.length === 0) {
      initialState.suppliers.forEach(s => {
        const r = push(ref(database, 'suppliers'));
        set(r, { id: r.key, name: s.name, type: s.type });
      });
    }
    alert('Default database initialized! Please refresh your page.');
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newRef = push(ref(database, 'transactions'));
    const newTx: Transaction = {
      ...tx,
      id: newRef.key as string,
      timestamp: new Date().toISOString()
    };
    
    set(newRef, newTx);

    // GOOGLE SHEETS WEBHOOK CALL (Fire and forget)
    // We will hook this up when the user provides the webhook URL
    const SHEETS_WEBHOOK_URL = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK_URL;
    if (SHEETS_WEBHOOK_URL) {
      fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors', // So it doesn't block on CORS from Apps Script
        body: JSON.stringify(newTx)
      }).catch(err => console.error("Sheets webhook failed", err));
    }

    // Update balances atomically (simplified)
    if (tx.type === 'INFLOW') {
      set(ref(database, 'rawMilk'), rawMilk + (tx.volume || 0));
    } else if (tx.type === 'OUTFLOW') {
      set(ref(database, 'rawMilk'), rawMilk - (tx.volume || 0));
      if (tx.amount) {
        set(ref(database, 'gallaBalance'), gallaBalance + tx.amount);
      }
      updateBandiStatus(tx.entity, true);
    } else if (tx.type === 'SPOILAGE') {
      set(ref(database, 'rawMilk'), rawMilk - (tx.volume || 0));
      set(ref(database, 'matha'), matha + (tx.volume || 0));
    } else if (tx.type === 'EXPENSE') {
      set(ref(database, 'gallaBalance'), gallaBalance - (tx.amount || 0));
    }
  };

  return (
    <DairyContext.Provider value={{
      rawMilk,
      matha,
      polythene,
      gallaBalance,
      transactions,
      bandis,
      suppliers,
      pendingRequests,
      addTransaction,
      updateBandiStatus,
      addSupplier,
      requestAddition,
      resolveRequest,
      seedDatabase
    }}>
      {children}
    </DairyContext.Provider>
  );
};

export const useDairy = () => useContext(DairyContext);
