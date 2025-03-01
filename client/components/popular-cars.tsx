import { getAllCars } from '@/helpers/server/car';
import CarCard from './car-card';

export default async function PopularCar() {
  const cars = await getAllCars();
  if(cars.length === 0) return null
  return (
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {cars?.map(car => <CarCard key={car.id} car={car} />)}
        </div>
  );
}
