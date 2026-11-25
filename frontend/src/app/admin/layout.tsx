'use client';

import React from 'react';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import MainLayout from '../../components/layout/MainLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="Admin">
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );
}
