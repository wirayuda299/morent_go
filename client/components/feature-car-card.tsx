import { ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { carCategories } from '@/constants';

export default function FeatureCarCard({ category }: { category: string }) {
  return (
    <Link href='/search' className='group'>
      <div className='transform overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 group-hover:scale-105'>
        <div className='relative h-48'>
          <Image
            src={
              carCategories.find(c => c.name === category)?.icon ||
              '/placeholder.svg'
            }
            priority
            alt={category}
            fill
            className='transition-all duration-300 group-hover:opacity-75'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50'></div>
          <div className='absolute bottom-4 left-4 right-4'>
            <h3 className='text-xl font-semibold capitalize text-white'>
              {category}
            </h3>
            <p className='capitalize text-gray-300 transition-colors duration-300 group-hover:text-white'>
              Explore {category}{' '}
              <ChevronRightIcon className='ml-1 inline-block h-5 w-5' />
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
