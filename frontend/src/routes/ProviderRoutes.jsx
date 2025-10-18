import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProviderLayout from '../layouts/ProviderLayout';
import ProviderDashboard from '../pages/ProviderDashboard';
import ProviderServices from '../pages/ProviderServices';
import ProviderBookings from '../pages/ProviderBookings';
import ProviderReports from '../pages/ProviderReports';
import ProviderMessages from '../pages/ProviderMessages';
import ProviderNotifications from '../pages/ProviderNotifications';
import ProviderSettings from '../pages/ProviderSettings';

const ProviderRoutes = () => {
  return (
    <Routes>
      <Route path="/provider" element={<ProviderLayout />}>
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="services" element={<ProviderServices />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="reports" element={<ProviderReports />} />
        <Route path="messages" element={<ProviderMessages />} />
        <Route path="notifications" element={<ProviderNotifications />} />
        <Route path="settings" element={<ProviderSettings />} />
      </Route>
    </Routes>
  );
};

export default ProviderRoutes;
