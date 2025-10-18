import React from 'react';
import { Outlet } from 'react-router-dom';
import ProviderNavigation from '../components/ProviderNavigation';

const ProviderLayout = () => {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <ProviderNavigation />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Alça Hub
              </h1>
            </div>
            <ProviderNavigation />
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProviderLayout;
