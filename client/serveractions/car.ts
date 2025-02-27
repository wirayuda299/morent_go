'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { api } from '@/lib/axios';
import { AddCarSchemaType } from '@/validation';
import { isValidDate } from '@/utils';
import { logger } from '@/lib/logger';

export async function addNewCar(data: AddCarSchemaType, thumbnails: any[]) {
  const log = logger.child({ module: 'addNewCar' });
  log.info('Adding a new car', { data, thumbnails });

  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    await api.post(
      '/car/add',
      {
        name: data.name,
        capacity: data.capacity,
        description: data.description,
        fuelTankSize: data.fuelTankSize,
        city: data.city,
        country: data.country,
        street_address: data.streetAddress,
        price: data.price,
        thumbnails,
        transmission: data.transmission,
        type: data.type,
        owner: userId,
        features: data.features,
      },
      {
        headers: {
          Authorization: 'Bearer ' + (await getToken()),
        },
      },
    );

    log.info('Car added successfully');
    revalidatePath('/');
    redirect('/');
  } catch (error) {
    log.error('Error adding new car', { error });
    throw error;
  }
}

export async function addOrremoveCarFromFav(carId: string) {
  const log = logger.child({ module: 'addOrRemoveCarFromFav' });
  log.info('Toggling favorite car', { carId });

  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    await api.post(
      '/car/add-or-remove',
      {
        car_id: carId,
        user_id: userId,
      },
      {
        headers: {
          Authorization: 'Bearer ' + (await getToken()),
        },
      },
    );

    log.info('Successfully toggled favorite car');
    revalidatePath('/');
  } catch (error) {
    log.error('Error toggling favorite car', { error });
    throw error;
  }
}

export async function rentCar(
  carId: string,
  rentedStart: string,
  rentedEnd: string,
  owner: string,
) {
  const log = logger.child({ module: 'rentCar' });
  log.info('Renting a car', { carId, rentedStart, rentedEnd });

  try {
    if (!carId || !rentedStart || !rentedEnd || !owner) {
      throw new Error('Car ID, Pickup date, or Return date is missing');
    }

    if (!isValidDate(rentedStart) || !isValidDate(rentedEnd)) {
      throw new Error('Invalid date format');
    }

    const pickupDate = new Date(rentedStart);
    const returnDate = new Date(rentedEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      throw new Error('Pickup date must be later than today');
    }
    if (returnDate <= today) {
      throw new Error('Return date must be later than today');
    }
    if (pickupDate.getTime() === returnDate.getTime()) {
      throw new Error('Pickup date cannot be the same as return date');
    }

    const authData = await auth();
    if (!authData?.userId) throw new Error('User authentication failed');

    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      throw new Error('User email not found');
    }

    if (authData.userId === owner) {
      throw new Error("You can't rent your own car");
    }

    const response = await api.post(
      '/stripe/checkout',
      {
        carId,
        userId: authData.userId,
        email: user.emailAddresses[0].emailAddress,
        rentedStart,
        rentedEnd,
      },
      {
        headers: {
          Authorization: 'Bearer ' + (await authData.getToken()),
        },
      },
    );

    log.info('Car rented successfully', { url: response.data.url });
    return response.data.url;
  } catch (error) {
    log.error('Error renting car', { error });
    return {
      errors: (error as Error).message,
    };
  }
}
