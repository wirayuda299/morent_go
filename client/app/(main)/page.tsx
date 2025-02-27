import { CalendarIcon, CarIcon, SearchIcon } from 'lucide-react';
import Image from 'next/image';

import CarCard from '@/components/car-card';
import FeatureCarCard from '@/components/feature-car-card';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { HOME_HEADERS } from '@/constants';
import { getAllCars, getFeaturedCategories } from '@/helpers/server/car';

export default async function Home() {
  const cars = await getAllCars();
  const categories = await getFeaturedCategories();

  return (
    <main className='h-full w-full bg-white p-3'>
      <header className='flex w-full justify-center gap-4 text-white'>
        {HOME_HEADERS.map((header, i) => (
          <div
            className={`group relative ${i === 1 ? 'hidden sm:block' : ''}`}
            key={header.title1}
          >
            <div className='aspect-w-16 aspect-h-9 relative overflow-hidden rounded-lg'>
              <Image
                fetchPriority='high'
                className='bject-cover min-h-[232px] w-full lg:min-h-[360px]'
                src={header.background}
                alt='Blue background with car'
                width={500}
                height={500}
                priority
              />
              <div className='absolute top-0 p-4 text-left lg:p-6'>
                <div className='text-2xl font-semibold md:text-32 md:leading-9'>
                  <p>{header.title1}</p>
                  <p>{header.title2}</p>
                </div>
                <p className='pt-2 text-sm leading-6 md:text-base'>
                  {header.subtitle1}
                  <br></br>
                  {header.subtitle2}
                </p>
              </div>
            </div>
          </div>
        ))}
      </header>
      {categories && categories.length > 0 && (
        <section className='w-full bg-gray-100 py-16'>
          <div className='container mx-auto px-4'>
            <h2 className='mb-8 text-center text-3xl font-bold'>
              Featured Categories
            </h2>
            <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
              {categories?.map(category => (
                <FeatureCarCard category={category} key={category} />
              ))}
            </div>
          </div>
        </section>
      )}

      {cars && cars?.length > 0 && (
        <section className='w-full bg-white-200 py-16'>
          <div className='container mx-auto px-4'>
            <h2 className='mb-8 text-center text-3xl font-bold'>
              Featured Cars
            </h2>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
              {cars?.map(car => <CarCard key={car.id} car={car} />)}
            </div>
          </div>
        </section>
      )}

      <section className='w-full bg-white py-16'>
        <div className='container mx-auto px-4'>
          <h2 className='mb-8 text-center text-3xl font-bold'>Why Choose Us</h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {[
              {
                title: 'Extensive Vehicle Selection',
                icon: CarIcon,
                description:
                  'Choose from a wide range of high-quality vehicles to match your needs and budget.',
              },
              {
                title: 'Best Price Guarantee',
                icon: SearchIcon,
                description:
                  'Get competitive rates with no hidden fees—transparent pricing you can trust.',
              },
              {
                title: '24/7 Customer Support',
                icon: CalendarIcon,
                description:
                  'Our support team is available around the clock to assist you whenever needed.',
              },
            ].map((feature, index) => (
              <div key={index} className='text-center'>
                <feature.icon className='mx-auto mb-4 h-12 w-12 text-blue-600' />
                <h3 className='mb-2 text-xl font-semibold'>{feature.title}</h3>
                <p className='text-gray-600'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='w-full bg-blue-600 py-16 text-white'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='mb-4 text-3xl font-bold'>Ready to Hit the Road?</h2>
          <p className='mb-8 text-xl'>
            Book your perfect car today and start your adventure!
          </p>
          <Button size='lg' className='bg-white text-blue-600 hover:bg-blue-50'>
            Book Now
          </Button>
        </div>
      </section>
      <Footer />
    </main>
  );
}
