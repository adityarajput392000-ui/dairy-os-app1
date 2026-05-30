'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, push, update } from 'firebase/database';

export type TransactionType = 'INFLOW' | 'OUTFLOW' | 'SPOILAGE' | 'EXPENSE' | 'ADVANCE' | 'SPOILAGE_DEDUCT' | 'CONVERSION_ADD' | 'WATER_ADDITION';

export interface Transaction {
  id: string;
  type: TransactionType;
  entity: string;
  volume?: number; // In Liters or Kg
  amount?: number; // In Rupees
  item?: string; // e.g., "Paneer", "Mattar"
  notes?: string; // For khata advances or reasons
  expenseCategory?: string; // e.g., "Nashta/Gutka", "Petrol"
  operatorId?: string; // Accountability
  linkedTxnId?: string; // For dual-entry tracking
  timestamp: string;
}

export interface Bandi {
  name: string;
  expectedLiters: number;
  receivedToday: boolean;
  currentLedgerBalance: number; // For Khata
}

export interface Supplier {
  id: string;
  name: string;
  type: string;
  currentLedgerBalance: number; // For Khata
}

export interface PendingRequest {
  id: string;
  type: 'SUPPLIER' | 'BANDI';
  name: string;
  milkType?: string; // For suppliers
  expectedLiters?: number; // For bandis
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type DairyState = {
  rawMilk: number;
  matha: number;
  polythene: number;
  gallaBalance: number;
  paneer: number;
  mattar: number;
  ghee: number;
  dahi: number;
  operationalBurn: number;
  ownerDraw: number;
  lastReconciledTimestamp: string;
  rateCard: Record<string, number>;
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
  paneer: 0,
  mattar: 0,
  ghee: 0,
  dahi: 0,
  operationalBurn: 0,
  ownerDraw: 0,
  lastReconciledTimestamp: new Date().toISOString(),
  rateCard: {
    'Buffalo': 50,
    'Cow': 40,
    'Mixed': 45,
    'Paneer': 300,
    'Matha': 20,
    'Ghee': 800,
    'Mattar': 120,
    'Dahi': 100,
    'Raw Milk': 50 // Default
  },
  transactions: [],
  bandis: [
    { name: 'Sharma Ji', expectedLiters: 50, receivedToday: false, currentLedgerBalance: 0 },
    { name: 'Durga Nagar', expectedLiters: 30, receivedToday: false, currentLedgerBalance: 0 }
  ],
  suppliers: [
    { id: '1', name: 'Madan Lal', type: 'Buffalo', currentLedgerBalance: 0 },
    { id: '2', name: 'Hari Shingh', type: 'Buffalo', currentLedgerBalance: 0 },
    { id: '3', name: 'Dharmendra', type: 'Cow', currentLedgerBalance: 0 },
    { id: '4', name: 'Mahesh', type: 'Mixed', currentLedgerBalance: 0 },
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
  const [paneer, setPaneer] = useState(0);
  const [mattar, setMattar] = useState(0);
  const [ghee, setGhee] = useState(0);
  const [dahi, setDahi] = useState(0);
  const [operationalBurn, setOperationalBurn] = useState(0);
  const [ownerDraw, setOwnerDraw] = useState(0);
  const [lastReconciledTimestamp, setLastReconciledTimestamp] = useState(initialState.lastReconciledTimestamp);
  const [rateCard, setRateCard] = useState<Record<string, number>>(initialState.rateCard);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bandis, setBandis] = useState<Bandi[]>(initialState.bandis);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialState.suppliers);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  // FIREBASE SYNC
  useEffect(() => {
    const unsubrawMilk = onValue(ref(database, 'rawMilk'), snap => setRawMilk(snap.val() || 0));
    const unsubMatha = onValue(ref(database, 'matha'), snap => setMatha(snap.val() || 0));
    const unsubPoly = onValue(ref(database, 'polythene'), snap => setPolythene(snap.val() || 0));
    const unsubGalla = onValue(ref(database, 'gallaBalance'), snap => setGallaBalance(snap.val() || 0));
    const unsubPaneer = onValue(ref(database, 'paneer'), snap => setPaneer(snap.val() || 0));
    const unsubMattar = onValue(ref(database, 'mattar'), snap => setMattar(snap.val() || 0));
    const unsubGhee = onValue(ref(database, 'ghee'), snap => setGhee(snap.val() || 0));
    const unsubDahi = onValue(ref(database, 'dahi'), snap => setDahi(snap.val() || 0));
    const unsubOpBurn = onValue(ref(database, 'operationalBurn'), snap => setOperationalBurn(snap.val() || 0));
    const unsubOwnerDraw = onValue(ref(database, 'ownerDraw'), snap => setOwnerDraw(snap.val() || 0));
    const unsubReconciled = onValue(ref(database, 'lastReconciledTimestamp'), snap => setLastReconciledTimestamp(snap.val() || initialState.lastReconciledTimestamp));
    const unsubRateCard = onValue(ref(database, 'rateCard'), snap => setRateCard(snap.val() || initialState.rateCard));

    const unsubTx = onValue(ref(database, 'transactions'), snap => {
      const data = snap.val();
      if (data) {
        const txs = Object.values(data) as Transaction[];
        setTransactions(txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } else {
        setTransactions([]);
      }
    });

    const unsubBandis = onValue(ref(database, 'bandis'), snap => {
      const data = snap.val();
      setBandis(data ? Object.values(data) : initialState.bandis);
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
      unsubPaneer(); unsubMattar(); unsubGhee(); unsubReconciled(); unsubRateCard();
      unsubDahi(); unsubOpBurn(); unsubOwnerDraw();
    };
  }, []);

  const seedDatabase = () => {
    set(ref(database, 'bandis'), initialState.bandis);
    set(ref(database, 'suppliers'), initialState.suppliers);
    set(ref(database, 'rateCard'), initialState.rateCard);
    set(ref(database, 'gallaBalance'), initialState.gallaBalance);
    set(ref(database, 'lastReconciledTimestamp'), new Date().toISOString());
  };

  const updateBandiStatus = (name: string, received: boolean) => {
    const updatedBandis = bandis.map(b => b.name === name ? { ...b, receivedToday: received } : b);
    set(ref(database, 'bandis'), updatedBandis);
  };

  const addSupplier = (name: string, type: string) => {
    const newSupplier = { id: Date.now().toString(), name, type, currentLedgerBalance: 0 };
    set(ref(database, 'suppliers'), [...suppliers, newSupplier]);
  };

  const requestAddition = (req: Omit<PendingRequest, 'id' | 'status'>) => {
    const newReqRef = push(ref(database, 'pendingRequests'));
    set(newReqRef, { ...req, id: newReqRef.key, status: 'PENDING' });
  };

  const resolveRequest = (id: string, approve: boolean) => {
    const req = pendingRequests.find(r => r.id === id);
    if (!req) return;

    if (approve) {
      if (req.type === 'SUPPLIER') {
        addSupplier(req.name, req.milkType || 'Mixed');
      } else if (req.type === 'BANDI') {
        set(ref(database, 'bandis'), [...bandis, { name: req.name, expectedLiters: req.expectedLiters || 0, receivedToday: false, currentLedgerBalance: 0 }]);
      }
    }

    const filtered = pendingRequests.filter(r => r.id !== id);
    set(ref(database, 'pendingRequests'), filtered);
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTxRef = push(ref(database, 'transactions'));
    const fullTx = { ...tx, id: newTxRef.key, timestamp: new Date().toISOString() };
    set(newTxRef, fullTx);

    // Business Logic for Inventory & Cash Updates
    const itemName = tx.item || 'Raw Milk';
    
    // Helper to update specific inventory item
    const updateInventory = (item: string, delta: number) => {
      if (item === 'Raw Milk') set(ref(database, 'rawMilk'), rawMilk + delta);
      else if (item === 'Paneer') set(ref(database, 'paneer'), paneer + delta);
      else if (item === 'Mattar') set(ref(database, 'mattar'), mattar + delta);
      else if (item === 'Ghee') set(ref(database, 'ghee'), ghee + delta);
      else if (item === 'Matha') set(ref(database, 'matha'), matha + delta);
      else if (item === 'Dahi') set(ref(database, 'dahi'), dahi + delta);
    };

    // INFLOW LOGIC
    if (tx.type === 'INFLOW' || tx.type === 'WATER_ADDITION') {
      updateInventory(itemName, tx.volume || 0);
      
      // Khata updates (if supplier inflow costs us money, add to their ledger balance instead of deducting galla cash directly here)
      if (tx.type === 'INFLOW' && tx.amount && tx.amount > 0) {
         const s = suppliers.find(sup => sup.name === tx.entity);
         if (s) {
            const updated = suppliers.map(sup => sup.name === s.name ? { ...sup, currentLedgerBalance: sup.currentLedgerBalance + (tx.amount || 0) } : sup);
            set(ref(database, 'suppliers'), updated);
         }
      }
    } 
    // OUTFLOW LOGIC
    else if (tx.type === 'OUTFLOW') {
      updateInventory(itemName, -(tx.volume || 0));
      
      if (itemName === 'Raw Milk') {
        updateBandiStatus(tx.entity, true);
      }
      
      if (tx.amount && tx.amount > 0) {
        set(ref(database, 'gallaBalance'), gallaBalance + tx.amount);
      }
    } 
    // DUAL ENTRY PROCESSING
    else if (tx.type === 'SPOILAGE_DEDUCT') {
      updateInventory(itemName, -(tx.volume || 0));
    }
    else if (tx.type === 'CONVERSION_ADD') {
      updateInventory(itemName, (tx.volume || 0));
    }
    else if (tx.type === 'SPOILAGE') {
      // Legacy catch for old processing
      updateInventory(itemName, -(tx.volume || 0));
    }
    // ADVANCES & EXPENSES
    else if (tx.type === 'EXPENSE' || tx.type === 'ADVANCE') {
      set(ref(database, 'gallaBalance'), gallaBalance - (tx.amount || 0));
      
      if (tx.expenseCategory === 'Owner Draw') {
        set(ref(database, 'ownerDraw'), ownerDraw + (tx.amount || 0));
      } else if (tx.type === 'EXPENSE' && tx.expenseCategory !== 'Cash Advance') {
        set(ref(database, 'operationalBurn'), operationalBurn + (tx.amount || 0));
      }
      
      // If it's an advance to a supplier, reduce what we owe them
      const s = suppliers.find(sup => sup.name === tx.entity);
      if (s) {
        const updated = suppliers.map(sup => sup.name === s.name ? { ...sup, currentLedgerBalance: sup.currentLedgerBalance - (tx.amount || 0) } : sup);
        set(ref(database, 'suppliers'), updated);
      }
    }
  };

  return (
    <DairyContext.Provider value={{
      rawMilk, matha, polythene, gallaBalance,
      paneer, mattar, ghee, dahi, operationalBurn, ownerDraw,
      lastReconciledTimestamp, rateCard,
      transactions, bandis, suppliers, pendingRequests,
      addTransaction, updateBandiStatus, addSupplier,
      requestAddition, resolveRequest, seedDatabase
    }}>
      {children}
    </DairyContext.Provider>
  );
};

export const useDairy = () => useContext(DairyContext);
