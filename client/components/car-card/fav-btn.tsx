'use client';

import { cn } from '@/lib/utils';
import { addOrremoveCarFromFav } from '@/serveractions/car';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function FavButton({
  isFavorite,
  carId,
}: {
  isFavorite: boolean;
  carId: string;
}) {
  const title = isFavorite
    ? 'Remove from your favorite car list'
    : 'Add to your favorite car list';
  const handleAddOrRemove = async () => {
    try {
      await addOrremoveCarFromFav(carId);
    } catch (error) {
      toast.error((error as Error).message || 'Something went wrong');
    }
  };

  return (
    <button onClick={handleAddOrRemove} title={title}>
      <Heart
        size={20}
        className={cn(isFavorite ? 'fill-red-500 stroke-red-600' : '')}
      />
    </button>
  );
}
