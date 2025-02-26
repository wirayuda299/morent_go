'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

import { Form, FormField, FormItem, FormLabel } from './ui/form';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { searchByNameSchema, SearchByNameSchemaType } from '@/validation';
import { Car } from '@/types';
import CarCard from './car-card';
import { searchCar } from '@/helpers/client/car';

export default function SearchByName() {
  const [searchResult, setSearchResult] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const { userId, getToken } = useAuth();

  const form = useForm<SearchByNameSchemaType>({
    resolver: zodResolver(searchByNameSchema),
    defaultValues: { name: '' },
  });

  const handleSubmit = async (data: SearchByNameSchemaType) => {
    if (!userId) {
      toast.error('User is not authenticated');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const token = await getToken();
      if (!token) throw new Error('Unauthorized');

      const response = await searchCar({
        token,
        user_id: userId,
        search_by: 'name',
        name: data.name,
      });
      setSearchResult(response || []);
    } catch (error) {
      if ((error as any).status === 404) {
        toast.error('No car matches the query');
      } else {
        toast.error((error as Error).message || 'Failed to search car');
      }
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minDuration = 500;
      setTimeout(
        () => {
          setLoading(false);
          form.reset();
        },
        Math.max(0, minDuration - elapsedTime),
      );
    }
  };

  useEffect(() => {
    if (searchParams.get('type')) {
      setSearchResult([]);
    }
  }, [searchParams]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className='mt-5 flex w-full flex-wrap gap-2 bg-white p-4'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='min-w-[300px] flex-1'>
                <FormLabel className='flex items-center gap-2'>
                  <p className='text-sm font-medium text-gray-900'>Search</p>
                  <Input
                    {...field}
                    placeholder='Search car by name'
                    className='border-none bg-white-200 p-2 text-gray-900 placeholder:pl-2 focus-visible:ring-0'
                    type='search'
                    autoComplete='off'
                  />
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            disabled={loading || form.formState.isSubmitting}
            className='flex-1 self-end bg-green-600 hover:bg-green-700 md:max-w-max'
          >
            {loading || form.formState.isSubmitting
              ? 'Please wait...'
              : 'Search'}
          </Button>
        </form>
      </Form>

      {searchResult.length > 0 && (
        <div className='py-3'>
          <h3 className='py-3 font-semibold'>Search result :</h3>
          {searchResult.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </>
  );
}
