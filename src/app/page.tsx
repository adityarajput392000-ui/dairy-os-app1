"use client";

import { useState } from "react";
import { useDairy } from "@/context/DairyContext";

export default function Dashboard() {
  const { rawMilk, matha, polythene, gallaBalance, bandis, transactions, addSupplier, suppliers } = useDairy();
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierType, setNewSupplierType] = useState("Buffalo");

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSupplierName) {
      addSupplier(newSupplierName, newSupplierType);
      setNewSupplierName("");
      alert("Supplier added successfully!");
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient">Command Dashboard</h1>
      
      <div className="grid-dashboard">
        <div className="card stat-card">
          <span className="stat-label">Net Galla Balance</span>
          <span className={`stat-value ${gallaBalance >= 0 ? 'text-success' : 'text-danger'}`}>
            ₹{gallaBalance.toLocaleString('en-IN')}
          </span>
        </div>
        
        <div className="card stat-card">
          <span className="stat-label">Raw Milk Available</span>
          <span className="stat-value">{rawMilk} L</span>
        </div>
        
        <div className="card stat-card">
          <span className="stat-label">Matha Yield</span>
          <span className="stat-value">{matha} L</span>
        </div>

        <div className="card stat-card">
          <span className="stat-label">Polythene Stock</span>
          <span className="stat-value">{polythene} Units</span>
        </div>
      </div>

      <div className="grid-dashboard" style={{ gridTemplateColumns: '1fr 1fr' }}>
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
          <h2>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} style={{
                display: 'flex', justifyContent: 'space-between',
                paddingBottom: '12px', borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{tx.type} - {tx.entity}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {tx.volume && <div>{tx.volume} L</div>}
                  {tx.amount && <div className={tx.type === 'INFLOW' || tx.type === 'OUTFLOW' ? 'text-success' : 'text-danger'}>
                    ₹{tx.amount}
                  </div>}
                </div>
              </div>
            ))}
            {transactions.length === 0 && <div className="form-label">No recent transactions.</div>}
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
