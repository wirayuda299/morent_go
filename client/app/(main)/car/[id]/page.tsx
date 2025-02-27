import { auth } from '@clerk/nextjs/server';
import { Cog, FuelIcon, User2Icon } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import RentForm from '@/components/rent-form';
import { searchCar } from '@/helpers/client/car';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CarDetail({ params }: Props) {
  const id = (await params).id;
  const { userId, getToken } = await auth();

  const car = await searchCar({
    search_by: 'id',
    carId: id,
    user_id: userId!,
    token: (await getToken()) as string,
  });
  if (car.length < 1) notFound();

  return (
    <div className='container mx-auto p-3'>
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <div className='space-y-4'>
          <div className='relative h-64 w-full md:h-96'>
            <Image
              priority
              fetchPriority='high'
              src={car[0].thumbnails[0].url}
              alt='Car main image'
              fill
              className='rounded-lg object-cover object-center'
            />
          </div>
          {car[0]?.thumbnails.length > 1 && (
            <div className='grid grid-cols-3 gap-4'>
              {car[0].thumbnails.map(thumbnail => (
                <Image
                  key={thumbnail.public_id}
                  src={thumbnail.url}
                  alt='Car image 1'
                  width={150}
                  priority
                  fetchPriority='high'
                  height={100}
                  className='rounded-lg'
                />
              ))}
            </div>
          )}
        </div>

        <div className='w-full space-y-6'>
          <h1 className='text-3xl font-bold'>{car[0].name}</h1>
          <p className='text-wrap break-all text-gray-600'>
            {car[0].description}
          </p>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex items-center space-x-2'>
              <User2Icon className='h-5 w-5 text-gray-500' />
              <span>{car[0].capacity} Seats</span>
            </div>

            <div className='flex items-center space-x-2'>
              <FuelIcon className='h-5 w-5 text-gray-500' />
              <span>{car[0].fuelTankSize}L</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Cog className='h-5 w-5 text-gray-500' />
              <span className='capitalize'>{car[0].transmission}</span>
            </div>
          </div>

          <div className='rounded-lg bg-gray-100 p-4'>
            <h2 className='mb-4 text-xl font-semibold'>Book Now</h2>
            <RentForm carId={car[0].id} owner={car[0].owner} />
          </div>
        </div>
      </div>

      <div className='mt-12'>
        <h2 className='mb-4 text-2xl font-bold'>Features</h2>
        <ul className='grid grid-cols-2 gap-4 py-3 md:grid-cols-3 lg:grid-cols-4'>
          {car[0]?.features.map(feat => (
            <li key={feat} className='flex items-center space-x-2'>
              <svg
                className='h-5 w-5 text-green-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M5 13l4 4L19 7'
                ></path>
              </svg>
              <span className='capitalize'>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
