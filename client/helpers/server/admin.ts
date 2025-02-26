import { auth} from '@clerk/nextjs/server';

import { api } from '@/lib/axios';
import { logger } from "@/lib/logger";


export async function getTotalRevenues() {
  const log = logger.child({ module: "getTotalRevenues" });
  log.info("Fetching total revenues");

  try {
    const { getToken, sessionClaims } = await auth();
    const res = await api.get('/admin/revenue', {
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
        Role: sessionClaims?.metadata.role,
      },
    });
    log.info("Total revenues fetched successfully", { data: res.data });
    return res.data;
  } catch (error) {
    log.error("Error fetching total revenues", { error });
    throw error;
  }
}

export async function getActiveRentals() {
  const log = logger.child({ module: "getActiveRentals" });
  log.info("Fetching active rentals");

  try {
    const { getToken, sessionClaims } = await auth();
    const res = await api.get('/admin/active-rental', {
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
        Role: sessionClaims?.metadata.role,
      },
    });

    log.info("Active rentals fetched successfully", { data: res.data });
    return res.data;
  } catch (error) {
    log.error("Error fetching active rentals", { error });
    throw error;
  }
}

export async function getTotalCustomers() {
  const log = logger.child({ module: "getTotalCustomers" });
  log.info("Fetching total customers");

  try {
    const { getToken, sessionClaims } = await auth();
    const res = await api.get('/admin/total-customers', {
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
        Role: sessionClaims?.metadata.role,
      },
    });

    log.info("Total customers fetched successfully", { data: res.data });
    return res.data;
  } catch (error) {
    log.error("Error fetching total customers", { error });
    throw error;
  }
}

