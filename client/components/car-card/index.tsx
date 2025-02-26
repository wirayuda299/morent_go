import Image from 'next/image';
import Link from 'next/link';

import { Car } from '@/types';
import FavButton from './fav-btn';
import { formatPrice } from '@/utils';

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className='h-full min-w-[300px] max-w-[350px] overflow-hidden rounded-md bg-white p-3 shadow-md'>
      <header className='flex items-center justify-between'>
        <div>
          <h3 className='text-base font-semibold capitalize'>{car.name}</h3>
          <p className='text-xs font-medium'>{car.type}</p>
        </div>
        <FavButton isFavorite={car.is_favorite} carId={car.id} />
      </header>
      <div className='pt-2'>
        <Image
          src={car?.thumbnails[0]?.url}
          width={300}
          height={300}
          alt='car'
          loading='lazy'
          quality={70}
          placeholder='blur'
          blurDataURL={car.thumbnails[0].url}
          className='rounded-md object-cover object-center'
        />
        <div className='flex items-center justify-between pt-2'>
          <button className='flex items-center gap-2'>
            <Image
              src={'/gas-station.svg'}
              width={30}
              height={30}
              alt='car'
              className='size-6 object-contain'
            />
            <p className='text-sm font-semibold text-gray-500'>
              {car.fuelTankSize}L
            </p>
          </button>
          <button className='flex items-center gap-2'>
            <Image
              src={'/Car.svg'}
              width={30}
              height={30}
              alt='car'
              className='size-6 object-contain'
            />
            <p className='text-sm font-semibold capitalize text-gray-500'>
              {car.transmission}
            </p>
          </button>
          <button className='flex items-center gap-2'>
            <Image
              src={'/users.svg'}
              width={30}
              height={30}
              alt='car'
              className='size-6 object-contain'
            />
            <p className='text-sm font-semibold capitalize text-gray-500'>
              {car.capacity} people
            </p>
          </button>
        </div>
        <div className='flex items-center justify-between pt-4'>
          <p className='truncate text-base font-semibold'>
            {formatPrice(car.price)}/
            <span className='text-sm font-normal text-gray-500'>day</span>
          </p>
          <Link
            href={`/car/${car.id}`}
            className='rounded-sm bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700'
          >
            More info
          </Link>
        </div>
      </div>
    </div>
  );
}
