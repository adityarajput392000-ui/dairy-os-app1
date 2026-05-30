'use client';
import { useState } from "react";
import { useDairy } from "@/context/DairyContext";

export default function Dashboard() {
  const { rawMilk, matha, polythene, gallaBalance, paneer, mattar, ghee, dahi, operationalBurn, ownerDraw, bandis, transactions, addSupplier, suppliers, pendingRequests, resolveRequest, seedDatabase, lastReconciledTimestamp, rateCard } = useDairy();
  
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
          <h2>Owner Command Center</h2>
          <p className="form-label" style={{ marginBottom: '24px' }}>Enter PIN to access executive analytics</p>
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
  const totalExpenses = todayTransactions.filter(tx => tx.type === 'EXPENSE' || tx.type === 'ADVANCE').reduce((sum, tx) => sum + (tx.amount || 0), 0);

  // Math for Analytics
  const staffList = ['Sanjay', 'Dadda', 'Owner', 'Ramu', 'Shyam'];
  const getStaffDeductions = (name: string) => {
    return transactions.filter(tx => tx.entity === name && (tx.type === 'ADVANCE' || tx.type === 'EXPENSE') && tx.expenseCategory !== 'Owner Draw').reduce((sum, tx) => sum + (tx.amount || 0), 0);
  };
  const getStaffNashtaCount = (name: string) => {
    return transactions.filter(tx => tx.entity === name && tx.expenseCategory === 'Nashta/Gutka').length;
  };

  const totalPolytheneBurnAmount = transactions.filter(tx => tx.expenseCategory === 'Shop Supply (Polythene)').reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const lifetimeMilkDistributed = transactions.filter(tx => tx.type === 'OUTFLOW' && (!tx.item || tx.item === 'Raw Milk')).reduce((sum, tx) => sum + (tx.volume || 0), 0);
  const packagingBurnRate = lifetimeMilkDistributed > 0 ? (totalPolytheneBurnAmount / lifetimeMilkDistributed).toFixed(2) : 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <h1 className="text-gradient" style={{ textAlign: 'center', margin: '24px 0 8px 0' }}>Command Center</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Executive Visibility • Last Reconciled: {new Date(lastReconciledTimestamp).toLocaleString()}
      </p>

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
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Today's Cash Outflow</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>₹{totalExpenses}</div>
        </div>
        <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--success-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Net Galla Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>₹{gallaBalance}</div>
        </div>
      </div>

      {/* MULTI-PRODUCT INVENTORY */}
      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>The Asset Pipeline (Inventory)</h2>
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
          <span className="stat-label">Dahi</span>
          <span className="stat-value">{dahi} Kg</span>
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

      <div className="grid-dashboard" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        
        {/* LEFT COLUMN: LOGS & APPROVALS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* ANALYTICS SHEET TABLE */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>Live Ledger (Sheets View)</h2>
            </div>
            
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)' }}>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Product/Category</th>
                    <th style={{ padding: '12px' }}>Entity</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Cash (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontSize: '0.875rem' }}>{new Date(tx.timestamp).toLocaleString(undefined, {hour: '2-digit', minute:'2-digit', day:'numeric', month:'short'})}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                          background: tx.type === 'INFLOW' ? '#10b98120' : tx.type === 'OUTFLOW' ? '#3b82f620' : (tx.type === 'EXPENSE' || tx.type === 'ADVANCE') ? '#ef444420' : '#f59e0b20',
                          color: tx.type === 'INFLOW' ? '#10b981' : tx.type === 'OUTFLOW' ? '#3b82f6' : (tx.type === 'EXPENSE' || tx.type === 'ADVANCE') ? '#ef4444' : '#f59e0b'
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        {tx.expenseCategory ? tx.expenseCategory : (tx.type === 'SPOILAGE_DEDUCT' ? 'Spoilage Loss' : tx.type === 'CONVERSION_ADD' ? 'Converted Yield' : tx.type === 'WATER_ADDITION' ? 'Water Added' : (tx.item || 'Raw Milk'))}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 500 }}>{tx.entity} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>by {tx.operatorId}</span></td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{tx.volume ? `${tx.volume}` : '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: (tx.type === 'EXPENSE' || tx.type === 'ADVANCE') ? 'var(--danger-color)' : (tx.amount ? 'var(--success-color)' : 'inherit') }}>
                        {(tx.type === 'EXPENSE' || tx.type === 'ADVANCE') ? `-₹${tx.amount}` : (tx.amount ? `₹${tx.amount}` : '-')}
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

          <div className="card">
            <h2>Bandi Automation Tracking</h2>
            <p className="form-label" style={{ marginBottom: '16px' }}>Status of milk delivery to vendors today</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                  {bandi.receivedToday ? (
                    <span style={{ color: 'var(--accent-color)', fontWeight: 500, fontSize: '0.875rem' }}>✓ Sent</span>
                  ) : (
                    <span style={{ color: 'var(--danger-color)', fontWeight: 500, fontSize: '0.875rem' }}>⚠ Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: KHATA & ANALYTICS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
             <h2 style={{ color: 'var(--danger-color)' }}>Expenditure & Expansion Management</h2>
             <p className="form-label" style={{ marginBottom: '16px' }}>Isolate micro-leaks and operational burn</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '12px', borderLeft: '4px solid var(--danger-color)' }}>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Operational Burn (Petrol, Supplies)</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{operationalBurn}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Owner's Draw (Personal Capital)</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{ownerDraw}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Packaging Burn Rate (Polythene vs Milk Out)</div>
                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{packagingBurnRate} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ Liter</span></div>
                </div>
             </div>
          </div>

          <div className="card">
             <h2 style={{ color: 'var(--success-color)' }}>Arbitrage & Outsourced Goods</h2>
             <p className="form-label" style={{ marginBottom: '16px' }}>Calculated yield margins against retail logic</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                   <span><strong>Dahi</strong> (Buy ₹76/kg → Sell ₹100/kg)</span>
                   <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>+ ₹24/kg Yield</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                   <span><strong>Paneer</strong> (Buy ₹280/kg → Sell ₹350/kg)</span>
                   <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>+ ₹70/kg Yield</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                   <span><strong>Mattar</strong> (Buy ₹100/kg → Sell ₹140/kg)</span>
                   <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>+ ₹40/kg Yield</span>
                </div>
             </div>
          </div>

          <div className="card">
            <h2>The Khata Engine (Vendor Payable)</h2>
            <p className="form-label" style={{ marginBottom: '16px' }}>(Total Volume × Fixed Rate) − Cash Advances</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {suppliers.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong>{s.name}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({s.type})</span>
                  </div>
                  <div style={{ fontWeight: 'bold', color: s.currentLedgerBalance > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                    {s.currentLedgerBalance > 0 ? `Owe ₹${s.currentLedgerBalance}` : s.currentLedgerBalance < 0 ? `Paid ₹${Math.abs(s.currentLedgerBalance)}` : 'Cleared'}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '24px', fontSize: '1.25rem' }}>Staff Payroll Deductions</h3>
            <p className="form-label" style={{ marginBottom: '16px' }}>Total Nashta + Cash Advances</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {staffList.map(staff => {
                  const deductions = getStaffDeductions(staff);
                  const nashtaCount = getStaffNashtaCount(staff);
                  if (deductions === 0 && nashtaCount === 0) return null;
                  return (
                     <div key={staff} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div>
                           <strong>{staff}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({nashtaCount} Nashta Logs)</span>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'var(--danger-color)' }}>
                           - ₹{deductions}
                        </div>
                     </div>
                  )
               })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
