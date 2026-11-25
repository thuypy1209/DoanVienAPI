'use client';

import React from 'react';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import MainLayout from '../../components/layout/MainLayout';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );
}
