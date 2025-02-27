import { Car, LogOut, User } from 'lucide-react';

import RecentBookings from '@/components/profile/recent-bookings';
import PersonalInfoForm from '@/components/profile/update-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserTotalRental } from '@/helpers/server/users';
import { currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  const user = await currentUser();
  const totalRentals = await getUserTotalRental();

  return (
    <div className='container mx-auto min-h-screen space-y-8 p-3'>
      <div className='flex w-full flex-col items-start gap-8 md:flex-row'>
        <Card className='w-full md:w-[300px]'>
          <CardHeader className='text-center'>
            <div className='mb-4 flex justify-center'>
              <Avatar className='h-24 w-24'>
                <AvatarImage src={user?.imageUrl} alt='Profile picture' />
                <AvatarFallback>FB</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.username}</CardTitle>
            <CardDescription>Premium Member</CardDescription>
            <div className='mt-2'>
              {user?.emailAddresses[0].verification?.status === 'verified' && (
                <Badge variant='secondary' className='mt-2'>
                  Verified Driver
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>
                Member since{' '}
                {user?.createdAt && new Date(user?.createdAt).getFullYear()}
              </span>
            </div>
            {}
            <div className='flex items-center gap-2'>
              <Car className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>{totalRentals} Total Rentals</span>
            </div>
            <Button variant='outline' className='mt-4 w-full'>
              <LogOut className='mr-2 h-4 w-4' />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <div className='w-full flex-1'>
          <Tabs defaultValue='bookings' className='w-full'>
            <TabsList className='w-full justify-start'>
              <TabsTrigger value='bookings'>Bookings</TabsTrigger>
              <TabsTrigger value='settings'>Settings</TabsTrigger>
            </TabsList>

              <RecentBookings />

            <PersonalInfoForm
              username={user?.username || ''}
              lastName={user?.lastName || ''}
              firstName={user?.firstName || ''}
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
}
