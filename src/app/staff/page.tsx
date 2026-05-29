"use client";

import { useState } from 'react';
import { useDairy } from '@/context/DairyContext';

export default function StaffApp() {
  const { addTransaction, bandis, suppliers } = useDairy();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Inflow State
  const [supplier, setSupplier] = useState('');
  const [inflowVolume, setInflowVolume] = useState('');
  
  // Outflow State
  const [bandi, setBandi] = useState('');
  const [outflowVolume, setOutflowVolume] = useState('');

  // Spoilage State
  const [spoiledVolume, setSpoiledVolume] = useState('');

  // Expense State
  const [expensePerson, setExpensePerson] = useState('');
  const [expenseReason, setExpenseReason] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const handleInflow = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({ type: 'INFLOW', entity: supplier, volume: Number(inflowVolume) });
    setSupplier(''); setInflowVolume('');
    setActiveSection(null);
    alert('Milk Received Logged Successfully');
  };

  const handleQuickDispatch = (bandiName: string, liters: number) => {
    addTransaction({ type: 'OUTFLOW', entity: bandiName, volume: liters });
    alert(`${bandiName} dispatched successfully!`);
  };

  const handleOutflow = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({ type: 'OUTFLOW', entity: bandi, volume: Number(outflowVolume) });
    setBandi(''); setOutflowVolume('');
    setActiveSection(null);
    alert('Custom Dispatch Logged Successfully');
  };

  const handleSpoilage = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({ type: 'SPOILAGE', entity: 'Spoilage Conversion', volume: Number(spoiledVolume) });
    setSpoiledVolume('');
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
            <form onSubmit={handleInflow} style={{ marginTop: '24px' }}>
              <div className="form-group">
                <label className="form-label">Select Supplier</label>
                <select className="form-control form-select" required value={supplier} onChange={e => setSupplier(e.target.value)}>
                  <option value="" disabled>Select...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={`${s.name} (${s.type})`}>{s.name} ({s.type})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity (Liters)</label>
                <input type="number" className="form-control" required value={inflowVolume} onChange={e => setInflowVolume(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Inflow</button>
            </form>
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
                  <button onClick={() => setBandi(b.name)} className="btn btn-outline" style={{ padding: '12px' }}>✏️</button>
                </div>
              ))}

              <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
              <p className="form-label">Custom Dispatch / Edit</p>
              
              <form onSubmit={handleOutflow}>
                <div className="form-group">
                  <label className="form-label">Select Bandi</label>
                  <select className="form-control form-select" required value={bandi} onChange={e => setBandi(e.target.value)}>
                    <option value="" disabled>Select...</option>
                    {bandis.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Quantity (Liters)</label>
                  <input type="number" className="form-control" required value={outflowVolume} onChange={e => setOutflowVolume(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Custom Dispatch</button>
              </form>
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

      </div>
    </div>
  );
}
