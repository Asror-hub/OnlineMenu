import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import MenuManagement from './components/MenuManagement';
import OrderManagement from './components/OrderManagement';
import Reservations from './components/Reservations';
import Feedbacks from './components/Feedbacks';
import Settings from './components/Settings';
import RestaurantCreation from './components/RestaurantCreation';
import ProtectedRoute from './components/ProtectedRoute';
import RestaurantLayout from './components/RestaurantLayout';

import './App.css';

// COMPLETELY SEPARATE ADMIN PANEL SYSTEM
// Each restaurant gets its own unique admin panel URL
function App() {
  return (
    <Router>
      <AuthProvider>
        <RestaurantProvider>
          <div className="App">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* COMPLETELY SEPARATE RESTAURANT ADMIN PANELS */}
              {/* Each restaurant gets its own unique admin panel */}
              <Route path="/:restaurantSlug/admin" element={
                <ProtectedRoute>
                  <RestaurantLayout>
                    <Dashboard />
                  </RestaurantLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/:restaurantSlug/admin/users" element={
                <ProtectedRoute>
                  <RestaurantLayout>
                    <UserManagement />
                  </RestaurantLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/:restaurantSlug/admin/menu" element={
                <ProtectedRoute>
                  <RestaurantLayout>
                    <MenuManagement />
                  </RestaurantLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/:restaurantSlug/admin/orders" element={
                <ProtectedRoute>
                  <RestaurantLayout>
                    <OrderManagement />
                  </RestaurantLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/:restaurantSlug/admin/reservations" element={
                <ProtectedRoute>
                  <RestaurantLayout>
                    <Reservations />
                  </RestaurantLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/:restaurantSlug/admin/feedbacks" element={
                <ProtectedRoute>
                  <RestaurantLayout>
                    <Feedbacks />
                  </RestaurantLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/:restaurantSlug/admin/settings" element={
                <ProtectedRoute>
                  <RestaurantLayout>
                    <Settings />
                  </RestaurantLayout>
                </ProtectedRoute>
              } />
              
              {/* Super Admin Route - Create New Restaurants */}
              <Route path="/admin/create-restaurant" element={
                <ProtectedRoute>
                  <RestaurantCreation />
                </ProtectedRoute>
              } />
              
              {/* DEFAULT REDIRECT */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </RestaurantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
