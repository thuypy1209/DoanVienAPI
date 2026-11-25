'use client';

import React from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import ChatRoom from '@/components/features/ChatRoom';

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ChatRoom />
      </MainLayout>
    </ProtectedRoute>
  );
}
