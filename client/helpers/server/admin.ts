import { auth } from '@clerk/nextjs/server';

import { api } from '@/lib/axios';
import { logger } from '@/lib/logger';

async function getAuthHeaders() {
  const { getToken, sessionClaims } = await auth();
  return {
    Authorization: 'Bearer ' + (await getToken()),
    Role: sessionClaims?.metadata.role,
  };
}

async function fetchAdminData(endpoint: string, module: string) {
  const log = logger.child({ module });
  log.info(`Fetching ${module}`);

  try {
    const headers = await getAuthHeaders();
    const res = await api.get(endpoint, { headers });

    log.info(`${module} fetched successfully`);
    return res.data;
  } catch (error) {
    log.error(`Error fetching ${module}`, { error });
    throw error;
  }
}

export async function getTotalRevenues() {
  return fetchAdminData('/admin/revenue', 'getTotalRevenues');
}

export async function getActiveRentals() {
  return fetchAdminData('/admin/active-rental', 'getActiveRentals');
}

export async function getTotalCustomers() {
  return fetchAdminData('/admin/total-customers', 'getTotalCustomers');
}
