import { CarGrid } from '@/components/dashboard/car-grid';
import { Header } from '@/components/dashboard/header';
import { Stats } from '@/components/dashboard/stats';
import { getAvailableCars } from '@/helpers/server/car';


export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const availableCars = await getAvailableCars();

  return (
    <main className='min-h-screen w-full'>
      <Header />
      <div className='p-4 md:p-6 lg:p-8'>
        <div className='space-y-8'>
          <div>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <p className='text-muted-foreground'>
              Welcome to your car rental dashboard
            </p>
          </div>
            <Stats />

          {availableCars.length > 0 && (
            <div>
              <h2 className='mb-4 text-2xl font-bold'>Available Cars</h2>
              <CarGrid cars={availableCars} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
