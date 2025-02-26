import Footer from '@/components/footer';
import Navbar from '@/components/navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='size-full bg-white-200'>
      <Navbar />
      <div className='size-full bg-white-200 p-3'>
        {children}
        <Footer />
      </div>
    </div>
  );
}
