import AddCarForm from '@/components/add-car-form';

export const metadata = {
  title: 'Add new car',
};
export default function AddCar() {
  return (
    <main className='size-full p-3'>
      <AddCarForm />
    </main>
  );
}
