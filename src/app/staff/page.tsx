"use client";

import { useState } from 'react';
import { useDairy } from '@/context/DairyContext';

export default function StaffApp() {
  const { addTransaction, bandis, suppliers, requestAddition } = useDairy();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [product, setProduct] = useState<'Raw Milk' | 'Paneer' | 'Mattar' | 'Matha' | 'Ghee'>('Raw Milk');
  
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBandi, setSelectedBandi] = useState("");
  const [volume, setVolume] = useState("");
  const [amount, setAmount] = useState("");

  // Expense State
  const [expensePerson, setExpensePerson] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Request State
  const [requestMode, setRequestMode] = useState<null | 'SUPPLIER' | 'BANDI'>(null);
  const [reqName, setReqName] = useState('');
  const [reqDetail, setReqDetail] = useState('');

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestMode === 'SUPPLIER') {
      requestAddition({ type: 'SUPPLIER', name: reqName, milkType: reqDetail || 'Mixed' });
    } else {
      requestAddition({ type: 'BANDI', name: reqName, expectedLiters: Number(reqDetail) });
    }
    setReqName(''); setReqDetail(''); setRequestMode(null);
    alert('Request sent to Owner for approval!');
  };

  const handleInflow = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      type: 'INFLOW',
      entity: product === 'Raw Milk' ? selectedSupplier : 'Factory/Purchase',
      item: product,
      volume: Number(volume),
    });
    setVolume("");
    alert(`${product} Inflow Logged!`);
  };

  const handleQuickDispatch = (bandiName: string, liters: number) => {
    addTransaction({ type: 'OUTFLOW', entity: bandiName, volume: liters });
    alert(`${bandiName} dispatched successfully!`);
  };

  const handleOutflow = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({ 
        type: 'OUTFLOW', 
        entity: product === 'Raw Milk' ? selectedBandi : 'Direct Sale', 
        item: product,
        volume: Number(volume),
        amount: Number(amount) || 0
    });
    setVolume(''); setAmount('');
    setActiveSection(null);
    alert('Dispatch Logged Successfully');
  };

  const handleSpoilage = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({ type: 'SPOILAGE', entity: 'Spoilage Conversion', volume: Number(volume) });
    setVolume('');
    setActiveSection(null);
    alert('Spoilage Converted to Matha Successfully');
  };

  const handleExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({ type: 'EXPENSE', entity: `${expensePerson} (${expenseReason})`, amount: Number(expenseAmount) });
    setExpensePerson(''); setExpenseReason(''); setExpenseAmount('');
    setActiveSection(null);
    alert('Expense Logged Successfully');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: '32px' }}>Staff Data Entry</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* MILK RECEIVED */}
        <div className="card">
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between' }}
            onClick={() => setActiveSection(activeSection === 'INFLOW' ? null : 'INFLOW')}>
            <span>🥛 Milk Received (Village)</span>
            <span>{activeSection === 'INFLOW' ? '▲' : '▼'}</span>
          </button>
          
          {activeSection === 'INFLOW' && (
            <div className="card" style={{ marginTop: '24px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🥛 Log Inflow (Receive)
              </h2>
              
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Select Product</label>
                <select className="form-control form-select" value={product} onChange={e => setProduct(e.target.value as any)}>
                  <option value="Raw Milk">Raw Milk (L)</option>
                  <option value="Paneer">Paneer (Kg)</option>
                  <option value="Matha">Matha (L)</option>
                  <option value="Ghee">Ghee (Kg)</option>
                  <option value="Mattar">Safal Mattar (Kg)</option>
                </select>
              </div>

              {product === 'Raw Milk' && (
                <div className="form-group">
                  <label className="form-label">Select Supplier</label>
                  <select className="form-control form-select" value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                    <option value="">Select...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>{s.name} ({s.type})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Quantity ({product === 'Raw Milk' || product === 'Matha' ? 'Liters' : 'Kg'})</label>
                <input type="number" className="form-control" value={volume} onChange={e => setVolume(e.target.value)} />
              </div>

              <button onClick={handleInflow} className="btn btn-primary" style={{ width: '100%' }}>Submit Inflow</button>
            </div>
          )}
        </div>

        {/* MILK DISPATCH */}
        <div className="card">
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between' }}
            onClick={() => setActiveSection(activeSection === 'OUTFLOW' ? null : 'OUTFLOW')}>
            <span>🚚 Milk Sent (Bandi)</span>
            <span>{activeSection === 'OUTFLOW' ? '▲' : '▼'}</span>
          </button>
          
          {activeSection === 'OUTFLOW' && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p className="form-label">Quick Dispatch (Defaults)</p>
              
              {bandis.map(b => (
                <div key={b.name} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    disabled={b.receivedToday}
                    onClick={() => handleQuickDispatch(b.name, b.expectedLiters)}
                    className="btn btn-outline" 
                    style={{ flex: 1, borderColor: b.receivedToday ? 'var(--accent-color)' : '', color: b.receivedToday ? 'var(--accent-color)' : '' }}>
                    {b.receivedToday ? `✅ ${b.name} (${b.expectedLiters}L)` : `Dispatch ${b.name} (${b.expectedLiters}L)`}
                  </button>
                </div>
              ))}

              <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
              
              <div className="card" style={{ marginTop: '24px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🚚 Log Outflow (Dispatch / Sale)
                </h2>

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Select Product</label>
                  <select className="form-control form-select" value={product} onChange={e => setProduct(e.target.value as any)}>
                    <option value="Raw Milk">Raw Milk (L)</option>
                    <option value="Paneer">Paneer (Kg)</option>
                    <option value="Matha">Matha (L)</option>
                    <option value="Ghee">Ghee (Kg)</option>
                    <option value="Mattar">Safal Mattar (Kg)</option>
                  </select>
                </div>
                
                {product === 'Raw Milk' && (
                  <div className="form-group">
                    <label className="form-label">Select Bandi (Vendor)</label>
                    <select className="form-control form-select" value={selectedBandi} onChange={e => setSelectedBandi(e.target.value)}>
                      <option value="">Select...</option>
                      {bandis.map((b, i) => (
                        <option key={i} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Quantity ({product === 'Raw Milk' || product === 'Matha' ? 'Liters' : 'Kg'})</label>
                  <input type="number" className="form-control" value={volume} onChange={e => setVolume(e.target.value)} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Cash Received (₹) - Optional</label>
                  <input type="number" className="form-control" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>

                <button onClick={handleOutflow} className="btn btn-primary" style={{ width: '100%' }}>Submit Outflow</button>
              </div>
            </div>
          )}
        </div>

        {/* SPOILAGE */}
        <div className="card">
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between' }}
            onClick={() => setActiveSection(activeSection === 'SPOILAGE' ? null : 'SPOILAGE')}>
            <span>⚠️ Spoilage (Fata Doodh)</span>
            <span>{activeSection === 'SPOILAGE' ? '▲' : '▼'}</span>
          </button>
          
          {activeSection === 'SPOILAGE' && (
            <form onSubmit={handleSpoilage} style={{ marginTop: '24px' }}>
              <div className="form-group">
                <label className="form-label">Fata Doodh Volume (Liters)</label>
                <input type="number" className="form-control" required value={spoiledVolume} onChange={e => setSpoiledVolume(e.target.value)} />
              </div>
              <div className="form-group">
                <p className="form-label" style={{ color: 'var(--accent-color)' }}>This will automatically convert into Matha inventory.</p>
              </div>
              <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>Log Spoilage</button>
            </form>
          )}
        </div>

        {/* EXPENSES / KHATA */}
        <div className="card">
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between' }}
            onClick={() => setActiveSection(activeSection === 'EXPENSE' ? null : 'EXPENSE')}>
            <span>💸 Cash Out (Khata/Expense)</span>
            <span>{activeSection === 'EXPENSE' ? '▲' : '▼'}</span>
          </button>
          
          {activeSection === 'EXPENSE' && (
            <form onSubmit={handleExpense} style={{ marginTop: '24px' }}>
              <div className="form-group">
                <label className="form-label">Who is taking cash?</label>
                <select className="form-control form-select" required value={expensePerson} onChange={e => setExpensePerson(e.target.value)}>
                  <option value="" disabled>Select...</option>
                  <option value="Sanjay">Sanjay</option>
                  <option value="Dadda">Dadda</option>
                  <option value="Shop">Shop Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <select className="form-control form-select" required value={expenseReason} onChange={e => setExpenseReason(e.target.value)}>
                  <option value="" disabled>Select...</option>
                  <option value="Nashta/Gutka">Nashta/Gutka</option>
                  <option value="Cash Advance">Cash Advance</option>
                  <option value="Petrol">Petrol</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" className="form-control" required value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Deduct from Galla</button>
            </form>
          )}
        </div>

        {/* REQUEST NEW */}
        <div className="card" style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '16px' }}>Need to add someone new?</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setRequestMode('SUPPLIER')} className="btn btn-outline" style={{ flex: 1, fontSize: '0.875rem' }}>Request Supplier</button>
            <button onClick={() => setRequestMode('BANDI')} className="btn btn-outline" style={{ flex: 1, fontSize: '0.875rem' }}>Request Bandi</button>
          </div>

          {requestMode && (
            <form onSubmit={handleRequest} style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
              <div className="form-group">
                <label className="form-label">{requestMode === 'SUPPLIER' ? 'Supplier Name' : 'Bandi Name'}</label>
                <input type="text" className="form-control" required value={reqName} onChange={e => setReqName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{requestMode === 'SUPPLIER' ? 'Milk Type (Cow/Buffalo/Mixed)' : 'Expected Liters'}</label>
                <input type={requestMode === 'SUPPLIER' ? 'text' : 'number'} className="form-control" required value={reqDetail} onChange={e => setReqDetail(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Send Request</button>
                <button type="button" onClick={() => setRequestMode(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
