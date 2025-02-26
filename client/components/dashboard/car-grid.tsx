import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car } from '@/types';
import { formatPrice } from '@/utils';

export function CarGrid({ cars }: { cars: Car[] }) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {cars.map(car => (
        <Card key={car.id}>
          <CardHeader>
            <Image
              src={car.thumbnails[0].url || '/placeholder.svg'}
              alt={car.name}
              width={300}
              height={200}
              className='rounded-lg object-cover'
            />
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>{car.name}</CardTitle>
              <Badge>Available</Badge>
            </div>
            <div className='mt-2 flex items-center justify-between text-sm text-muted-foreground'>
              <span>{car.type}</span>
              <span>{formatPrice(car.price)}/day</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
