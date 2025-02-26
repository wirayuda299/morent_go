
import { auth } from '@clerk/nextjs/server';

import { api } from '@/lib/axios';
import { Car } from '@/types';
import { logger } from '@/lib/logger';

export async function getAllCars(sort: string = 'popular') {
  const log = logger.child({ module: 'getAllCars' });
  log.info('Fetching all cars', { sort });

  try {
    const { getToken, userId } = await auth();
    const res = await api.get<Car[]>(`/car/find-all/${userId}?sort=${sort}`, {
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
      },
      fetchOptions: {
        cache: 'force-cache',
      },
    });
    log.info('Fetched all cars successfully', { data: res.data });
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
    const { getToken } = await auth();
    const res = await api.get<Car[]>(`/car/available-car`, {
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
      },
    });
    log.info('Fetched available cars successfully', { data: res.data });
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
    const { getToken } = await auth();
    const res = await api.get<string[]>(`/car/featured_categories`, {
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
      },
    });
    log.info('Fetched featured categories successfully', { data: res.data });
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
      ...(payload.name ? { name: payload.name } : {}),
      ...(payload.capacity ? { capacity: payload.capacity } : {}),
      ...(payload.type ? { type: payload.type } : {}),
      ...(payload.carId && { id: payload.carId }),
      search_by: payload.search_by,
    });

    const res = await api.get(`/car/search?${params.toString()}`, {
      headers: {
        Authorization: 'Bearer ' + payload.token,
      },
    });
    log.info('Search results retrieved successfully', { data: res.data });
    return res.data;
  } catch (error) {
    log.error('Error searching for cars', { error });
    throw error;
  }
}

