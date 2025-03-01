import { auth } from '@clerk/nextjs/server';

import { api } from '@/lib/axios';
import { logger } from '@/lib/logger';
import { Car } from '@/types';

async function getAuthData() {
  const { getToken, userId } = await auth();
  return {
    userId,
    headers: {
      Authorization: 'Bearer ' + (await getToken()),
    },
  };
}

export async function getAllCars(sort: string = 'popular') {
  const log = logger.child({ module: 'getAllCars' });
  log.info('Fetching all cars', { sort });

  try {
    const { userId, headers } = await getAuthData();
    const res = await api.get<Car[]>(`/car/find-all/${userId}?sort=${sort}`, {
      headers,
      fetchOptions: {
        cache: 'force-cache',
      },
    });
    return res.data;
  } catch (error) {
    log.error('Error fetching all cars', { error });
    throw error;
  }
}

export async function getAvailableCars() {
  const log = logger.child({ module: 'getAvailableCars' });
  log.info('Fetching available cars');

  try {
    const { headers } = await getAuthData();
    const res = await api.get<Car[]>(`/car/available-car`, { headers });
    return res.data;
  } catch (error) {
    log.error('Error fetching available cars', { error });
    throw error;
  }
}

export async function getFeaturedCategories() {
  const log = logger.child({ module: 'getFeaturedCategories' });
  log.info('Fetching featured categories');

  try {
    const { headers } = await getAuthData();
    const res = await api.get<string[]>(`/car/featured_categories`, {
      headers,
    });

    return res.data;
  } catch (error) {
    log.error('Error fetching featured categories', { error });
    throw error;
  }
}

type SearchPayload = {
  user_id: string;
  search_by: string;
  token: string;
  name?: string;
  capacity?: string;
  type?: string;
  carId?: string;
};

export async function searchCar(payload: SearchPayload): Promise<Car[]> {
  const log = logger.child({ module: 'searchCar' });
  log.info('Searching for cars', { payload });

  try {
    if (!payload.user_id) {
      throw new Error('User ID is required');
    }

    const params = new URLSearchParams({
      user_id: payload.user_id,
      search_by: payload.search_by,
      ...(payload.name && { name: payload.name }),
      ...(payload.capacity && { capacity: payload.capacity }),
      ...(payload.type && { type: payload.type }),
      ...(payload.carId && { id: payload.carId }),
    });

    const res = await api.get<Car[]>(`/car/search?${params.toString()}`, {
      headers: { Authorization: 'Bearer ' + payload.token },
    });

    return res.data;
  } catch (error) {
    log.error('Error searching for cars', { error });
    throw error;
  }
}
