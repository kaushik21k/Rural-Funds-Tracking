'use client';

import { Dashboard } from '@/src/components/Dashboard';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardWrapper />
    </ProtectedRoute>
  );
}

function DashboardWrapper() {
  return <Dashboard />;
}
