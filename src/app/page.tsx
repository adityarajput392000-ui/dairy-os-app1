'use client';
import { useState } from "react";
import { useDairy } from "@/context/DairyContext";

export default function Dashboard() {
  const { rawMilk, matha, polythene, gallaBalance, paneer, mattar, ghee, bandis, transactions, addSupplier, suppliers, pendingRequests, resolveRequest, seedDatabase } = useDairy();
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierType, setNewSupplierType] = useState("Buffalo");
  
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSupplierName) {
      addSupplier(newSupplierName, newSupplierType);
      setNewSupplierName("");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect PIN");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2>Owner Login</h2>
          <p className="form-label" style={{ marginBottom: '24px' }}>Enter PIN to access dashboard</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="password" placeholder="Enter PIN (1234)" className="form-control" value={pin} onChange={e => setPin(e.target.value)} required />
            <button type="submit" className="btn btn-primary">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Totals for Today
  const todayTransactions = transactions.filter(tx => new Date(tx.timestamp).toDateString() === new Date().toDateString());
  const totalInflow = todayTransactions.filter(tx => tx.type === 'INFLOW' && (!tx.item || tx.item === 'Raw Milk')).reduce((sum, tx) => sum + (tx.volume || 0), 0);
  const totalOutflowBandi = todayTransactions.filter(tx => tx.type === 'OUTFLOW' && (!tx.item || tx.item === 'Raw Milk')).reduce((sum, tx) => sum + (tx.volume || 0), 0);
  const totalExpenses = todayTransactions.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <h1 className="text-gradient" style={{ textAlign: 'center', margin: '24px 0 8px 0' }}>Owner Analytics Dashboard</h1>
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
        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Today's Village Milk (In)</div>
          <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalInflow} L</div>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Today's Bandi Milk (Out)</div>
          <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalOutflowBandi} L</div>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--danger-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Today's Expenses</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>₹{totalExpenses}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--success-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Live Cash Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>₹{gallaBalance}</div>
        </div>
      </div>

      {/* MULTI-PRODUCT INVENTORY */}
      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>Live Inventory</h2>
      <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '24px' }}>
        <div className="card stat-card">
          <span className="stat-label">Raw Milk</span>
          <span className="stat-value">{rawMilk} L</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Paneer</span>
          <span className="stat-value">{paneer} Kg</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Safal Mattar</span>
          <span className="stat-value">{mattar} Kg</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Ghee</span>
          <span className="stat-value">{ghee} Kg</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Matha (Buttermilk)</span>
          <span className="stat-value">{matha} L</span>
        </div>
      </div>

      {/* ANALYTICS SHEET TABLE */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Live Ledger (Sheets View)</h2>
        </div>
        
        <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)' }}>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Date & Time</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Entity</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Cash (₹)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px', fontSize: '0.875rem' }}>{new Date(tx.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                      background: tx.type === 'INFLOW' ? '#10b98120' : tx.type === 'OUTFLOW' ? '#3b82f620' : tx.type === 'EXPENSE' ? '#ef444420' : '#f59e0b20',
                      color: tx.type === 'INFLOW' ? '#10b981' : tx.type === 'OUTFLOW' ? '#3b82f6' : tx.type === 'EXPENSE' ? '#ef4444' : '#f59e0b'
                    }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{tx.item || 'Raw Milk'}</td>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{tx.entity}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{tx.volume ? `${tx.volume}` : '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: tx.type === 'EXPENSE' ? 'var(--danger-color)' : (tx.amount ? 'var(--success-color)' : 'inherit') }}>
                    {tx.amount ? `₹${tx.amount}` : '-'}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
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
