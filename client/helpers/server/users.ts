import { auth } from '@clerk/nextjs/server';

import { api } from '@/lib/axios';
import { logger } from '@/lib/logger';

async function getAuthHeaders() {
  const { getToken, userId } = await auth();
  return {
    userId,
    headers: {
      Authorization: 'Bearer ' + (await getToken()),
    },
  };
}

async function fetchUserData<T>(endpoint: string, module: string): Promise<T> {
  const log = logger.child({ module });
  log.info(`Fetching ${module}`);

  try {
    const { headers } = await getAuthHeaders();
    const res = await api.get<T>(endpoint, { headers });

    log.info(`${module} fetched successfully`, res);
    return res.data;
  } catch (error) {
    log.error(`Error fetching ${module}`, { error });
    throw error;
  }
}

export async function getAllUsers() {
  return fetchUserData('/users/find-all', 'getAllUsers');
}

export async function getUserTotalRental() {
  const { userId } = await getAuthHeaders();
  return fetchUserData<number>(
    `/users/total-rentals?userId=${userId}`,
    'getUserTotalRental',
  );
}

export async function getUserRecentBooking(): Promise<Rental[]> {
  const { userId } = await getAuthHeaders();
  return fetchUserData<Rental[]>(
    `/users/recent-booking?userId=${userId}`,
    'getUserRecentBooking',
  );
}

type Rental = {
  car_id: string;
  car_name: string;
  pickup_date: string;
  rental_id: string;
  return_date: string;
  status: 'pending' | 'paid' | 'canceled';
  total_price: number;
  user_id: string;
};
