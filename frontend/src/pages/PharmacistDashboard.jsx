import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Pill, AlertTriangle, Edit3, Plus, X } from 'lucide-react';

const PharmacistDashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [newMed, setNewMed] = useState({ name: '', generic_name: '', manufacturer: '', price: '', stock_quantity: '', expiry_date: '', category_id: '' });
  const [editMed, setEditMed] = useState(null);

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medicines', newMed);
      setShowAddModal(false);
      setNewMed({ name: '', generic_name: '', manufacturer: '', price: '', stock_quantity: '', expiry_date: '', category_id: '' });
      fetchMedicines();
    } catch (err) {
      console.error(err);
      alert('Failed to add medicine');
    }
  };

  const handleEditMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/medicines/${editMed.id}`, editMed);
      setShowEditModal(false);
      setEditMed(null);
      fetchMedicines();
    } catch (err) {
      console.error(err);
      alert('Failed to edit medicine');
    }
  };

  const openEdit = (med) => {
    // Format date for date picker YYYY-MM-DD
    const dateStr = new Date(med.expiry_date).toISOString().split('T')[0];
    setEditMed({ ...med, expiry_date: dateStr });
    setShowEditModal(true);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Inventory Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and restock medicines.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Medicine
        </button>
      </div>

      <div className="glass-card">
        <h2 style={{ marginBottom: '16px' }}>Current Inventory</h2>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Generic Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Expiry Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => {
                const isLowStock = med.stock_quantity < 50;
                return (
                  <tr key={med.id}>
                    <td style={{ fontWeight: 500 }}>{med.name}</td>
                    <td>{med.generic_name}</td>
                    <td>{med.category_name}</td>
                    <td style={{ color: isLowStock ? 'var(--danger)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {med.stock_quantity}
                      {isLowStock && <AlertTriangle size={14} />}
                    </td>
                    <td>${parseFloat(med.price).toFixed(2)}</td>
                    <td>{new Date(med.expiry_date).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => openEdit(med)} style={{ background: 'transparent', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                         <Edit3 size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
           <div className="glass-card" style={{ width: '500px', padding: '32px', position: 'relative' }}>
              <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
              <h2 style={{ marginBottom: '24px' }}>Add Medicine</h2>
              <form onSubmit={handleAddMedicine} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Trade Name</label>
                  <input style={{ width: '100%' }} required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Generic Name</label>
                  <input style={{ width: '100%' }} required value={newMed.generic_name} onChange={e => setNewMed({...newMed, generic_name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Category</label>
                  <select style={{ width: '100%' }} required value={newMed.category_id} onChange={e => setNewMed({...newMed, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Manufacturer</label>
                  <input style={{ width: '100%' }} required value={newMed.manufacturer} onChange={e => setNewMed({...newMed, manufacturer: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Price</label>
                  <input type="number" step="0.01" style={{ width: '100%' }} required value={newMed.price} onChange={e => setNewMed({...newMed, price: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Initial Stock</label>
                  <input type="number" style={{ width: '100%' }} required value={newMed.stock_quantity} onChange={e => setNewMed({...newMed, stock_quantity: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Expiry Date</label>
                  <input type="date" style={{ width: '100%' }} required value={newMed.expiry_date} onChange={e => setNewMed({...newMed, expiry_date: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '16px' }}>Save Medicine</button>
              </form>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editMed && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
           <div className="glass-card" style={{ width: '500px', padding: '32px', position: 'relative' }}>
              <button onClick={() => setShowEditModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
              <h2 style={{ marginBottom: '24px' }}>Edit Medicine Stock</h2>
              <form onSubmit={handleEditMedicine} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Trade Name</label>
                  <input style={{ width: '100%' }} disabled value={editMed.name} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>Price ($)</label>
                      <input type="number" step="0.01" style={{ width: '100%' }} required value={editMed.price} onChange={e => setEditMed({...editMed, price: e.target.value})} />
                   </div>
                   <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>Stock Quantity</label>
                      <input type="number" style={{ width: '100%' }} required value={editMed.stock_quantity} onChange={e => setEditMed({...editMed, stock_quantity: e.target.value})} />
                   </div>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>Update Stock</button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default PharmacistDashboard;
