import { Car, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '@/components/ui/badge';
import { GetUserRecentBooking } from '@/helpers/server/users';
import { formatPrice } from '@/utils';
import { TabsContent } from '../ui/tabs';
import Link from 'next/link';

export default async function RecentBookings() {
  const recentBookings = await GetUserRecentBooking();

  return (
    <TabsContent value={'bookings'} className='w-full space-y-4'>
      {recentBookings && recentBookings?.length < 1 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <div className='mb-6 rounded-full bg-muted p-6'>
            <Car className='h-12 w-12 text-muted-foreground' />
          </div>
          <h3 className='mb-2 text-xl font-semibold'>No bookings yet</h3>
          <p className='mb-6 max-w-sm text-muted-foreground'>
            You haven&apos;t made any car bookings yet. Start your journey by
            exploring our available vehicles.
          </p>
          <Link
            href={'/search'}
            className='flex items-center gap-2 rounded-sm bg-primary p-2 text-sm text-white hover:bg-primary/85'
          >
            <Car className='h-4 w-4' />
            Browse Cars
          </Link>
        </div>
      ) : (
        <>
          <h2 className='mb-4 text-2xl font-bold'>Recent Bookings</h2>
          {recentBookings &&
            recentBookings?.length > 0 &&
            recentBookings.map(book => (
              <Card className='w-full' key={book?.rental_id}>
                <CardContent className='flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center'>
                  <div className='space-y-1'>
                    <h3 className='font-semibold'>{book?.car_name}</h3>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Clock className='h-4 w-4' />
                      {new Date(book?.pickup_date).toLocaleDateString() +
                        ' - ' +
                        new Date(book?.return_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
                    <Badge
                      className='capitalize'
                      variant={
                        book?.status === 'paid' ? 'secondary' : 'default'
                      }
                    >
                      {book?.status}
                    </Badge>
                    <span className='font-semibold'>
                      {formatPrice(book?.total_price)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </>
      )}
    </TabsContent>
  );
}
