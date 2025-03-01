import { getFeaturedCategories } from '@/helpers/server/car';
import FeatureCarCard from './feature-car-card';

export default async function FeaturedCarList() {
  const categories = await getFeaturedCategories();
  if(categories.length === 0) return null 

  return (
    
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {categories?.map(category => (
            <FeatureCarCard category={category} key={category} />
          ))}
      </div>
  );
}
