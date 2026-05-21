
import React from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <NotificationsProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </NotificationsProvider>
    </AppProvider>
  );
};

export default Index;
