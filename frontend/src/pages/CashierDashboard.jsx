import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShoppingCart, Plus, Trash2, CheckCircle } from 'lucide-react';

const CashierDashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (med) => {
    if (med.stock_quantity <= 0) return;
    
    const existing = cart.find(item => item.medicine_id === med.id);
    if (existing) {
      if (existing.quantity >= med.stock_quantity) return; // Cant add more than stock
      setCart(cart.map(item => item.medicine_id === med.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { medicine_id: med.id, name: med.name, price: med.price, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.medicine_id !== id));
  };

  const updateQuantity = (id, delta, maxStock) => {
    setCart(cart.map(item => {
      if (item.medicine_id === id) {
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= maxStock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await api.post('/sales', {
        items: cart.map(item => ({ medicine_id: item.medicine_id, quantity: item.quantity, unit_price: item.price })),
        total_amount: total
      });
      setMessage('Sale completed successfully!');
      setCart([]);
      fetchMedicines(); // Refresh stock
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.msg || 'Error completing sale');
    }
  };

  const filteredMeds = medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Point of Sale</h1>
        <p style={{ color: 'var(--text-muted)' }}>Process customer purchases and cashouts.</p>
      </div>

      {message && (
        <div className="glass" style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)', marginBottom: '24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} />
          {message}
        </div>
      )}

      <div className="pos-container">
        {/* Products List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <input 
            type="text" 
            placeholder="Search medicine..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', marginBottom: '16px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', overflowY: 'auto', maxHeight: '600px', paddingRight: '8px' }}>
            {filteredMeds.map(med => (
              <div 
                key={med.id} 
                className="glass" 
                style={{ padding: '16px', borderRadius: '12px', cursor: med.stock_quantity > 0 ? 'pointer' : 'not-allowed', opacity: med.stock_quantity > 0 ? 1 : 0.5 }}
                onClick={() => addToCart(med)}
              >
                <h4 style={{ marginBottom: '8px' }}>{med.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>${med.price}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock: {med.stock_quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <ShoppingCart size={24} /> Current Order
          </h2>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
            {cart.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Cart is empty</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cart.map(item => {
                  const maxStock = medicines.find(m => m.id === item.medicine_id)?.stock_quantity || 0;
                  return (
                    <div key={item.medicine_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>{item.name}</h4>
                        <span style={{ color: 'var(--text-muted)' }}>${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '6px' }}>
                          <button onClick={() => updateQuantity(item.medicine_id, -1, maxStock)} style={{ background: 'none', color: 'white' }}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.medicine_id, 1, maxStock)} style={{ background: 'none', color: 'white' }}>+</button>
                        </div>
                        <span style={{ fontWeight: 600, width: '60px', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.medicine_id)} style={{ background: 'none', color: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.25rem' }}>Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>${total.toFixed(2)}</span>
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: cart.length === 0 ? 0.5 : 1 }}
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              <CheckCircle size={20} /> Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
