"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface DairyState {
  rawMilk: number;
  matha: number;
  polythene: number;
  gallaBalance: number;
  transactions: Transaction[];
  bandis: Bandi[];
  suppliers: Supplier[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateBandiStatus: (name: string, received: boolean) => void;
  addSupplier: (name: string, type: string) => void;
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
  addTransaction: () => {},
  updateBandiStatus: () => {},
  addSupplier: () => {}
};

const DairyContext = createContext<DairyState>(initialState);

export const DairyProvider = ({ children }: { children: ReactNode }) => {
  const [rawMilk, setRawMilk] = useState(initialState.rawMilk);
  const [matha, setMatha] = useState(initialState.matha);
  const [polythene, setPolythene] = useState(initialState.polythene);
  const [gallaBalance, setGallaBalance] = useState(initialState.gallaBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(initialState.transactions);
  const [bandis, setBandis] = useState<Bandi[]>(initialState.bandis);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialState.suppliers);

  const addSupplier = (name: string, type: string) => {
    setSuppliers(prev => [...prev, { id: Math.random().toString(36).substring(7), name, type }]);
  };

  const updateBandiStatus = (name: string, received: boolean) => {
    setBandis(prev => prev.map(b => b.name === name ? { ...b, receivedToday: received } : b));
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update inventory/balances based on transaction type
    if (tx.type === 'INFLOW') {
      setRawMilk(prev => prev + (tx.volume || 0));
    } else if (tx.type === 'OUTFLOW') {
      setRawMilk(prev => prev - (tx.volume || 0));
      if (tx.amount) {
        setGallaBalance(prev => prev + (tx.amount || 0)); // Cash collected from Bandi
      }
      updateBandiStatus(tx.entity, true);
    } else if (tx.type === 'SPOILAGE') {
      setRawMilk(prev => prev - (tx.volume || 0));
      setMatha(prev => prev + (tx.volume || 0)); // 1:1 conversion for simplicity
    } else if (tx.type === 'EXPENSE') {
      setGallaBalance(prev => prev - (tx.amount || 0));
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
      addTransaction,
      updateBandiStatus,
      addSupplier
    }}>
      {children}
    </DairyContext.Provider>
  );
};

export const useDairy = () => useContext(DairyContext);
