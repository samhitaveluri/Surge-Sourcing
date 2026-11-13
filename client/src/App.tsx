import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { CreateRfqPage } from './pages/buyer/CreateRfqPage';
import { EditRfqPage } from './pages/buyer/EditRfqPage';
import { RfqDetailsBuyerPage } from './pages/buyer/RfqDetailsBuyerPage';

// Supplier Pages
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';
import { RfqDetailsSupplierPage } from './pages/supplier/RfqDetailsSupplierPage';
import { MyQuotationsPage } from './pages/supplier/MyQuotationsPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Buyer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['BUYER']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/buyer/rfqs/new" element={<CreateRfqPage />} />
              <Route path="/buyer/rfqs/:id" element={<RfqDetailsBuyerPage />} />
              <Route path="/buyer/rfqs/:id/edit" element={<EditRfqPage />} />
            </Route>
          </Route>

          {/* Supplier Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPPLIER']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
              <Route path="/supplier/rfqs/:id" element={<RfqDetailsSupplierPage />} />
              <Route path="/supplier/quotations" element={<MyQuotationsPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
