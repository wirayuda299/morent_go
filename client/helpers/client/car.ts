import { api } from '@/lib/axios';
import { logger } from '@/lib/logger';
import { Car } from '@/types';

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
  const log = logger.child({ module: "searchCar" });
  log.info("Searching for a car", { payload });
  
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
    
    log.info("Search results received", { data: res.data });
    return res.data;
  } catch (error) {
    log.error("Error searching for car", { error });
    throw error;
  }
}
