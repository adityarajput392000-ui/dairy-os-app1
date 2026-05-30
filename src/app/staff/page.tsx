'use client';
import { useState } from 'react';
import { useDairy } from '@/context/DairyContext';

type ModalState = null | 'INFLOW' | 'OUTFLOW' | 'PROCESSING' | 'KHATA';

export default function StaffApp() {
  const { addTransaction, bandis, suppliers, rateCard } = useDairy();
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security/Accountability State
  const [operatorId, setOperatorId] = useState('');
  
  // Form State
  const [product, setProduct] = useState('Raw Milk');
  const [entity, setEntity] = useState('');
  const [volume, setVolume] = useState('');
  
  // Processing State (Dual-Entry)
  const [processingType, setProcessingType] = useState<'SPOILAGE' | 'WATER'>('SPOILAGE');
  const [yieldProduct, setYieldProduct] = useState('Matha');
  const [yieldVolume, setYieldVolume] = useState('');

  // Khata State
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const closeModal = () => {
    setActiveModal(null);
    setProduct('Raw Milk');
    setEntity('');
    setVolume('');
    setAmount('');
    setNotes('');
    setProcessingType('SPOILAGE');
    setYieldVolume('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const linkedId = Date.now().toString();

    if (activeModal === 'INFLOW') {
      // Calculate automated expenditure from Rate Card if it's a supplier
      let automatedAmount = 0;
      if (product === 'Raw Milk') {
        const sup = suppliers.find(s => s.name === entity);
        if (sup) {
           const rate = rateCard[sup.type] || rateCard['Raw Milk'];
           automatedAmount = Number(volume) * rate;
        }
      } else {
         automatedAmount = Number(volume) * (rateCard[product] || 0);
      }

      addTransaction({
        type: 'INFLOW',
        entity: product === 'Raw Milk' ? entity : 'Factory/Purchase',
        item: product,
        volume: Number(volume),
        amount: automatedAmount,
        operatorId
      });
      showToast(`${product} Inflow Logged!`);
    } 
    
    else if (activeModal === 'OUTFLOW') {
      const rate = rateCard[product] || 0;
      const automatedAmount = Number(volume) * rate;

      addTransaction({
        type: 'OUTFLOW',
        entity: product === 'Raw Milk' ? entity : 'Retail Sale',
        item: product,
        volume: Number(volume),
        amount: automatedAmount,
        operatorId
      });
      showToast(`${product} Outflow Logged!`);
    } 
    
    else if (activeModal === 'PROCESSING') {
      if (processingType === 'SPOILAGE') {
        // DUAL-ENTRY PROTOCOL
        // 1. Deduct spoiled milk
        addTransaction({
          type: 'SPOILAGE_DEDUCT',
          entity: 'Spoilage Engine',
          item: product,
          volume: Number(volume),
          operatorId,
          linkedTxnId: linkedId
        });
        // 2. Add converted yield
        addTransaction({
          type: 'CONVERSION_ADD',
          entity: 'Conversion Engine',
          item: yieldProduct,
          volume: Number(yieldVolume),
          operatorId,
          linkedTxnId: linkedId
        });
        showToast(`Spoilage Dual-Entry Logged!`);
      } else if (processingType === 'WATER') {
        // WATER ADDITION
        addTransaction({
          type: 'WATER_ADDITION',
          entity: 'Dilution Engine',
          item: product,
          volume: Number(volume),
          operatorId
        });
        showToast(`${volume}L Water Added to ${product}!`);
      }
    } 
    
    else if (activeModal === 'KHATA') {
      addTransaction({
        type: 'ADVANCE',
        entity: entity,
        amount: Number(amount),
        notes: notes,
        operatorId
      });
      showToast(`Khata Advance Logged!`);
    }
    closeModal();
  };

  if (!operatorId) {
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Staff Access</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select your operator ID to begin logging data.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Ramu', 'Shyam', 'Manager'].map(name => (
              <button key={name} onClick={() => setOperatorId(name)} 
                style={{ padding: '16px', borderRadius: '12px', background: 'var(--surface-hover)', color: 'var(--text-color)', border: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* SUCCESS TOAST */}
      {toastMessage && (
        <div className="toast-success">
          {toastMessage}
        </div>
      )}

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-color)', letterSpacing: '-1px' }}>DATA GATEWAY</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Operator: <strong style={{ color: 'var(--accent-color)' }}>{operatorId}</strong></p>
      </div>

      {/* 4 PRIMARY GATEWAY BUTTONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        <button onClick={() => setActiveModal('INFLOW')} 
          style={{ padding: '24px', borderRadius: '16px', background: '#10b981', color: 'white', border: 'none', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
          <span>1. Milk Received (In)</span>
          <span style={{ fontSize: '1.5rem' }}>+</span>
        </button>

        <button onClick={() => setActiveModal('OUTFLOW')} 
          style={{ padding: '24px', borderRadius: '16px', background: '#3b82f6', color: 'white', border: 'none', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <span>2. Milk Distributed (Out)</span>
          <span style={{ fontSize: '1.5rem' }}>↗</span>
        </button>

        <button onClick={() => setActiveModal('PROCESSING')} 
          style={{ padding: '24px', borderRadius: '16px', background: '#f59e0b', color: 'white', border: 'none', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
          <span>3. Processing Gateway</span>
          <span style={{ fontSize: '1.5rem' }}>⟳</span>
        </button>

        <button onClick={() => setActiveModal('KHATA')} 
          style={{ padding: '24px', borderRadius: '16px', background: '#ef4444', color: 'white', border: 'none', fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
          <span>4. Khata (Advances)</span>
          <span style={{ fontSize: '1.5rem' }}>₹</span>
        </button>
      </div>

      {/* SLIDE-UP MODAL OVERLAY */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 999 }} onClick={closeModal}>
          
          <div className="slide-up-modal" onClick={e => e.stopPropagation()} 
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--card-bg)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '32px 24px', boxShadow: '0 -4px 24px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                {activeModal === 'INFLOW' && 'Log Inflow'}
                {activeModal === 'OUTFLOW' && 'Log Outflow'}
                {activeModal === 'PROCESSING' && 'Processing Engine'}
                {activeModal === 'KHATA' && 'Khata Advance'}
              </h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Product Selector for In/Out */}
              {(activeModal === 'INFLOW' || activeModal === 'OUTFLOW') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Product Type</label>
                  <select required value={product} onChange={e => setProduct(e.target.value)} 
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }}>
                    <option value="Raw Milk">Raw Milk (L)</option>
                    <option value="Paneer">Paneer (Kg)</option>
                    <option value="Matha">Matha (L)</option>
                    <option value="Ghee">Ghee (Kg)</option>
                    <option value="Mattar">Safal Mattar (Kg)</option>
                  </select>
                </div>
              )}

              {/* PROCESSING: Spoilage vs Water */}
              {activeModal === 'PROCESSING' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Processing Type</label>
                    <select required value={processingType} onChange={e => setProcessingType(e.target.value as any)} 
                      style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }}>
                      <option value="SPOILAGE">Spoilage & Conversion (Dual-Entry)</option>
                      <option value="WATER">Water Adulteration / Mixture</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Base Product</label>
                    <select required value={product} onChange={e => setProduct(e.target.value)} 
                      style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }}>
                      <option value="Raw Milk">Raw Milk</option>
                      <option value="Paneer">Paneer</option>
                    </select>
                  </div>
                </>
              )}

              {/* Entity Selector */}
              {activeModal === 'INFLOW' && product === 'Raw Milk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Select Supplier</label>
                  <select required value={entity} onChange={e => setEntity(e.target.value)} 
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }}>
                    <option value="" disabled>Select Supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.type})</option>)}
                  </select>
                </div>
              )}

              {activeModal === 'OUTFLOW' && product === 'Raw Milk' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Select Bandi (Vendor)</label>
                  <select required value={entity} onChange={e => setEntity(e.target.value)} 
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }}>
                    <option value="" disabled>Select Bandi...</option>
                    {bandis.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              )}

              {activeModal === 'KHATA' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Person / Name</label>
                  <input required type="text" value={entity} onChange={e => setEntity(e.target.value)} placeholder="e.g. Ramu Kaka"
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }} />
                </div>
              )}

              {/* Volume / Quantity Input */}
              {activeModal !== 'KHATA' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                    {processingType === 'SPOILAGE' && activeModal === 'PROCESSING' ? 'Quantity Lost / Spoiled' : 
                     processingType === 'WATER' && activeModal === 'PROCESSING' ? 'Liters of Water Added' :
                     `Quantity (${product === 'Raw Milk' || product === 'Matha' ? 'Liters' : 'Kg'})`}
                  </label>
                  <input required type="number" inputMode="decimal" pattern="[0-9]*" value={volume} onChange={e => setVolume(e.target.value)} placeholder="0.0"
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.5rem', fontWeight: 'bold' }} />
                </div>
              )}

              {/* Yield Input for Processing Dual Entry */}
              {activeModal === 'PROCESSING' && processingType === 'SPOILAGE' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Yield Product (Recovered)</label>
                    <select required value={yieldProduct} onChange={e => setYieldProduct(e.target.value)} 
                      style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }}>
                      <option value="Matha">Matha</option>
                      <option value="Paneer">Paneer</option>
                      <option value="Ghee">Ghee</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Yield Quantity Recovered</label>
                    <input required type="number" inputMode="decimal" pattern="[0-9]*" value={yieldVolume} onChange={e => setYieldVolume(e.target.value)} placeholder="0.0"
                      style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.5rem', fontWeight: 'bold' }} />
                  </div>
                </>
              )}

              {/* Only Khata has Cash input now */}
              {activeModal === 'KHATA' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Advance Amount (₹)</label>
                  <input required type="number" inputMode="decimal" pattern="[0-9]*" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ 0"
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.5rem', fontWeight: 'bold' }} />
                </div>
              )}

              {activeModal === 'KHATA' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>Notes / Reason</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. For cow feed"
                    style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }} />
                </div>
              )}

              {/* Automated Cash Text Helper */}
              {(activeModal === 'INFLOW' || activeModal === 'OUTFLOW') && volume && (
                 <div style={{ background: 'var(--surface-hover)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Calculated Ledger Value:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                       ₹ {product === 'Raw Milk' && entity ? (Number(volume) * (rateCard[suppliers.find(s=>s.name===entity)?.type || 'Raw Milk'] || 0)) : (Number(volume) * (rateCard[product] || 0))}
                    </div>
                 </div>
              )}

              <button type="submit" 
                style={{ marginTop: '16px', padding: '20px', borderRadius: '12px', background: 'var(--text-color)', color: 'var(--bg-color)', border: 'none', fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer' }}>
                CONFIRM & SUBMIT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
