"use client";

import { useState } from "react";
import { useDairy } from "@/context/DairyContext";

export default function Dashboard() {
  const { rawMilk, matha, polythene, gallaBalance, bandis, transactions, addSupplier, suppliers, pendingRequests, resolveRequest, seedDatabase } = useDairy();
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierType, setNewSupplierType] = useState("Buffalo");
  
  // Owner Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const OWNER_PIN = "1234"; // Default PIN for testing

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSupplierName) {
      addSupplier(newSupplierName, newSupplierType);
      setNewSupplierName("");
      alert("Supplier added successfully!");
    }
  };
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === OWNER_PIN) setIsAuthenticated(true);
    else alert("Incorrect PIN!");
  };

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2 className="text-gradient" style={{ marginBottom: '24px' }}>Owner Access</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter PIN (1234)" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', marginBottom: '16px' }}
              required 
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Unlock Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Totals for Today
  const todayTransactions = transactions.filter(tx => new Date(tx.timestamp).toDateString() === new Date().toDateString());
  const totalInflow = todayTransactions.filter(tx => tx.type === 'INFLOW').reduce((sum, tx) => sum + (tx.volume || 0), 0);
  const totalOutflow = todayTransactions.filter(tx => tx.type === 'OUTFLOW').reduce((sum, tx) => sum + (tx.volume || 0), 0);
  const totalExpenses = todayTransactions.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '8px' }}>Owner Analytics Dashboard</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>Live track record & ledger</p>

      {/* DATABASE SETUP WARNING */}
      {(suppliers.length === 0 || bandis.length === 0) && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'var(--danger-color)' }}>
          <h2 style={{ color: 'var(--danger-color)' }}>⚠️ Cloud Database is Empty</h2>
          <p className="form-label" style={{ marginBottom: '16px' }}>Your staff cannot see any milkmen because the database is new. Click the button below to initialize the defaults.</p>
          <button onClick={seedDatabase} className="btn btn-primary" style={{ width: '100%' }}>Initialize Default Data</button>
        </div>
      )}

      {/* QUICK STATS */}
      <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Today's Total Inflow</div>
          <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalInflow} L</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Today's Total Outflow</div>
          <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalOutflow} L</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Today's Expenses</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>₹{totalExpenses}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Live Cash Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>₹{gallaBalance}</div>
        </div>
      </div>

      <div className="grid-dashboard" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* PENDING APPROVALS */}
        {pendingRequests.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', borderColor: 'var(--accent-color)' }}>
            <h2 style={{ color: 'var(--accent-color)' }}>🔔 Pending Approvals from Staff</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {pendingRequests.map(req => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{req.type === 'SUPPLIER' ? 'New Supplier' : 'New Bandi'}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Name: <strong>{req.name}</strong> • Detail: {req.milkType || `${req.expectedLiters}L`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => resolveRequest(req.id, true)} className="btn btn-primary" style={{ padding: '8px 16px' }}>Approve</button>
                    <button onClick={() => resolveRequest(req.id, false)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h2>Bandi Automation Tracking</h2>
          <p className="form-label" style={{ marginBottom: '16px' }}>Status of milk delivery to vendors today</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bandis.map((bandi, i) => (
              <div key={i} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)',
                border: `1px solid ${bandi.receivedToday ? 'var(--accent-color)' : 'var(--danger-color)'}`
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{bandi.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Expected: {bandi.expectedLiters}L</div>
                </div>
                <div>
                  {bandi.receivedToday ? (
                    <span style={{ color: 'var(--accent-color)', fontWeight: 500, fontSize: '0.875rem' }}>✓ Dispatched</span>
                  ) : (
                    <span style={{ color: 'var(--danger-color)', fontWeight: 500, fontSize: '0.875rem' }}>⚠ Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Add New Supplier</h2>
          <form onSubmit={handleAddSupplier} style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Supplier Name</label>
              <input type="text" className="form-control" required value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} placeholder="e.g. Ramu Kaka" />
            </div>
            <div className="form-group">
              <label className="form-label">Milk Type</label>
              <select className="form-control form-select" required value={newSupplierType} onChange={e => setNewSupplierType(e.target.value)}>
                <option value="Buffalo">Buffalo</option>
                <option value="Cow">Cow</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>Add Supplier</button>
          </form>
          
          <h3 style={{ marginTop: '24px', fontSize: '1rem' }}>Active Suppliers</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            {suppliers.map(s => (
              <span key={s.id} style={{ padding: '4px 12px', background: 'var(--bg-color)', borderRadius: '16px', fontSize: '0.875rem', border: '1px solid var(--border-color)' }}>
                {s.name} <span style={{ color: 'var(--text-secondary)' }}>({s.type})</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
