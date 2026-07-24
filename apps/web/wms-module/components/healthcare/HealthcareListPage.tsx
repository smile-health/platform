'use client';

import React from 'react';

import { isSuperAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import HealthcareAdminListPage from './HealthcareAdminListPage';
import HealthcareHFListPage from './HealthcareHFListPage';

const HealthcareListPage: React.FC = () => {
  usePermission('healthcare-view');

  return isSuperAdmin() ? (
    <HealthcareAdminListPage />
  ) : (
    <HealthcareHFListPage />
  );
};

export default HealthcareListPage;
