export default function Loader() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-white'>
      <div className='flex w-full flex-col items-center justify-center gap-4'>
        <div className='flex h-20 w-20 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-blue-400 text-4xl text-blue-400'>
          <div className='flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-red-400 text-2xl text-red-400'></div>
        </div>
      </div>
    </div>
  );
}
