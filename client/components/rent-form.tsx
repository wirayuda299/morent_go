'use client';

import { CalendarIcon } from 'lucide-react';
import Form from 'next/form';
import { toast } from 'sonner';

import { rentCar } from '@/serveractions/car';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function RentForm({
  carId,
  owner,
}: {
  carId: string;
  owner: string;
}) {
  const { push } = useRouter();

  const handleSubmit = async (form: FormData) => {
    try {
      const rentedStart = form.get('rentedStart') as string,
        rentedEnd = form.get('rentedEnd') as string;

      if (!rentedStart || !rentedEnd) {
        toast.error('Missing pickup date or return date');
        return;
      }

      const res = await rentCar(carId, rentedStart, rentedEnd, owner);
      if (res && res.errors) {
        toast.message(res.errors);
        return;
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
              about=''
              id='return-date'
              name='rentedEnd'
              className='w-full appearance-none rounded border px-3 py-2 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <CalendarIcon className='absolute right-2 top-2.5 h-5 w-5 text-gray-400' />
          </div>
        </div>
      </div>
      <Button className='inline-block w-full rounded bg-black p-2 text-center text-sm text-white disabled:cursor-not-allowed'>
        Checkout
      </Button>
    </Form>
  );
}
