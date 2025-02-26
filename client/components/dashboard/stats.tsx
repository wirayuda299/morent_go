import { Car, DollarSign, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/utils';
import {
  getActiveRentals,
  getTotalCustomers,
  getTotalRevenues,
} from '@/helpers/server/admin';

export async function Stats() {
  const revenues = await getTotalRevenues();
  const activeRental = await getActiveRentals();
  const totalCustomers = await getTotalCustomers();

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>{formatPrice(revenues)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active Rentals</CardTitle>
          <Car className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>+{activeRental}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Customers</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <p className='text-2xl font-bold'>{totalCustomers}</p>
        </CardContent>
      </Card>
    </div>
  );
}
