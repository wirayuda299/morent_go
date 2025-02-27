import { CalendarX, Car, Clock, Search } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { getUserRecentBooking } from '@/helpers/server/users';
import { formatPrice } from '@/utils';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { TabsContent } from '../ui/tabs';

export default async function RecentBookings() {
  const recentBookings = await getUserRecentBooking();

  return (
    <TabsContent value={'bookings'} className='w-full space-y-4'>
      {!recentBookings ? (
        <>
          <Card className='border-dashed'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xl'>No recent bookings</CardTitle>
              <CardDescription>
                You haven&apos;t made any car rental bookings yet.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center py-10'>
              <div className='mb-6 rounded-full bg-muted p-6'>
                <CalendarX className='h-12 w-12 text-muted-foreground' />
              </div>
              <div className='max-w-md space-y-4 text-center'>
                <h3 className='text-lg font-medium'>Ready to hit the road?</h3>
                <p className='text-sm text-muted-foreground'>
                  Explore our wide selection of vehicles and find the perfect
                  car for your next adventure.
                </p>
              </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-4 pt-0 sm:flex-row'>
              <Button asChild className='w-full sm:w-auto'>
                <Link href='/search'>
                  <Search className='mr-2 h-4 w-4' />
                  Search Cars
                </Link>
              </Button>
              <Button variant='outline' asChild className='w-full sm:w-auto'>
                <Link href='/'>
                  <Car className='mr-2 h-4 w-4' />
                  View Popular Cars
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </>
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
