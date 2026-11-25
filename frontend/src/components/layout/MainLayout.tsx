'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useSignalR } from '../../hooks/useSignalR';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { bellCount } = useSignalR();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar bellCount={bellCount} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
