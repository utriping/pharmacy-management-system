import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, DollarSign, Pill, TrendingUp, UserPlus, Trash2, X } from 'lucide-react';

const AdminDashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Create User Modal State
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'cashier' });
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [medsRes, salesRes, usersRes] = await Promise.all([
        api.get('/medicines'),
        api.get('/sales'),
        api.get('/auth/users')
      ]);
      setMedicines(medsRes.data);
      setSales(salesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/users', newUser);
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'cashier' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to create user');
    }
  };

  const totalRevenue = sales.reduce((acc, sale) => acc + parseFloat(sale.total_amount), 0);
  const lowStock = medicines.filter(m => m.stock_quantity < 50).length;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Admin. Here is your pharmacy summary.</p>
      </div>

      <div className="dashboard-stats">
        <div className="glass-card stat-card">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Pill size={24} /></div>
          <div className="stat-info">
            <p>Total Inventory Items</p>
            <h3>{medicines.length}</h3>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p>Low Stock Items</p>
            <h3>{lowStock}</h3>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <p>Total Staff</p>
            <h3>{users.length}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Staff Accounts</h2>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowModal(true)}>
            <UserPlus size={18} /> Add User
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{u.role}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'transparent', color: 'var(--danger)' }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
           <div className="glass-card" style={{ width: '400px', padding: '32px', position: 'relative' }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
              <h2 style={{ marginBottom: '24px' }}>Add New Staff</h2>
              <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Name</label>
                  <input style={{ width: '100%' }} required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
                  <input type="email" style={{ width: '100%' }} required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
                  <input type="password" style={{ width: '100%' }} required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Role</label>
                  <select style={{ width: '100%' }} value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="cashier">Cashier</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>Create User</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
