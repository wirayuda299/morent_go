'use client';

import { toast } from 'sonner';
import Form from 'next/form';
import { CalendarIcon } from 'lucide-react';

import { Input } from './ui/input';
import { rentCar } from '@/serveractions/car';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function RentForm({ carId }: { carId: string }) {
  const { push } = useRouter();
  const handleSubmit = async (form: FormData) => {
    try {
      const rentedStart = form.get('rentedStart') as string,
        rentedEnd = form.get('rentedEnd') as string;

      if (!rentedStart || !rentedEnd) {
        toast.error('Missing pickup date or return date');
        return;
      }

      const res = await rentCar(carId, rentedStart, rentedEnd);
      if (res && res.errors) {
        toast.message(res.errors);
      }

      push(res);
    } catch (error) {
      toast.message((error as Error).message || 'Failed to rent car');
    }
  };

  return (
    <Form className='space-y-4' action={handleSubmit} formMethod='post'>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <div className='flex-1'>
          <label
            htmlFor='pickup-date'
            className='mb-1 block text-sm font-medium text-gray-700'
          >
            Pickup Date
          </label>
          <div className='relative'>
            <Input
              required
              type='date'
              id='pickup-date'
              name='rentedStart'
              className='w-full'
            />
            <CalendarIcon className='absolute right-2 top-2.5 h-5 w-5 text-gray-400' />
          </div>
        </div>
        <div className='flex-1'>
          <label
            htmlFor='return-date'
            className='mb-1 block text-sm font-medium text-gray-700'
          >
            Return Date
          </label>
          <div className='relative'>
            <Input
              type='date'
              required
              id='return-date'
              name='rentedEnd'
              className='w-full'
            />
            <CalendarIcon className='absolute right-2 top-2.5 h-5 w-5 text-gray-400' />
          </div>
        </div>
      </div>
      <div className='w-full flex-1'>
        <Button className='inline-block w-full rounded bg-black p-2 text-center text-sm text-white disabled:cursor-not-allowed'>
          Checkout
        </Button>
      </div>
    </Form>
  );
}
