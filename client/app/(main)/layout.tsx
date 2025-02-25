import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className=" bg-white-200 size-full">
      <Navbar />
      <div className="bg-white-200 size-full p-3">
        {children}
        <Footer />
      </div>
    </div>
  );
}
