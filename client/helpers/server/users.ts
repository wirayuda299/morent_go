
import { auth } from '@clerk/nextjs/server';

import { api } from '@/lib/axios';
import { logger } from '@/lib/logger';

export async function getAllUsers() {
  const log = logger.child({ module: 'getAllUsers' });
  log.info('Fetching all users');

  try {
    const users = await api.get('/users/find-all');
    log.info('GET ALL USERS', { users: users.data });
    return users;
  } catch (error) {
    log.error('Error fetching all users', { error });
    throw error;
  }
}

export async function getUserTotalRental() {
  const log = logger.child({ module: 'getUserTotalRental' });
  log.info('Fetching user total rental');

  try {
    const { userId, getToken } = await auth();
    const users = await api.get(`/users/total-rentals?userId=${userId}`, {
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
      },
    });
    log.info('GET USER TOTAL RENTAL', { users: users.data });
    return users.data;
  } catch (error) {
    log.error('Error fetching user total rental', { error });
    throw error;
  }
}

type Rental = {
  car_id: string;
  car_name: string;
  pickup_date: string; // Bisa dijadikan Date jika ingin otomatis parsing
  rental_id: string;
  return_date: string; // Bisa dijadikan Date juga
  status: 'pending' | 'paid' | 'canceled'; // Sesuai dengan kemungkinan status
  total_price: number;
  user_id: string;
};

export async function GetUserRecentBooking(): Promise<Rental[]> {
  const log = logger.child({ module: 'GetUserRecentBooking' });
  log.info('Fetching user recent booking');

  try {
    const { userId, getToken } = await auth();
    const res = await api.get('/users/recent-booking?userId=' + userId, {
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
      },
    });
    log.info('GET USER RECENT BOOKING', { bookings: res.data });
    return res.data;
  } catch (error) {
    log.error('Error fetching user recent booking', { error });
    throw error;
  }
}

