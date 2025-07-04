
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminRideTracker from '@/components/admin/AdminRideTracker';

const AdminRidesPage = () => {
  return (
    <MainLayout title="Ride Management">
      <AdminRideTracker />
    </MainLayout>
  );
};

export default AdminRidesPage;
