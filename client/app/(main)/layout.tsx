import Navbar from '@/components/navbar/navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='!w-full bg-white-200'>
      <Navbar />
      {children}
    </div>
  );
}
