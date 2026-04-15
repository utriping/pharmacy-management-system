import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import CashierDashboard from './pages/CashierDashboard';

const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return <Layout>{children}</Layout>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Pharmacist Routes */}
        <Route path="/pharmacist/*" element={
          <ProtectedRoute allowedRoles={['pharmacist', 'admin']}>
            <PharmacistDashboard />
          </ProtectedRoute>
        } />

        {/* Cashier Routes */}
        <Route path="/cashier/*" element={
          <ProtectedRoute allowedRoles={['cashier', 'admin']}>
            <CashierDashboard />
          </ProtectedRoute>
        } />

        {/* Default Redirect */}
        <Route path="/" element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin" /> :
            user.role === 'pharmacist' ? <Navigate to="/pharmacist" /> :
            <Navigate to="/cashier" />
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
};

export default App;
