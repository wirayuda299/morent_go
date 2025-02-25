import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 ">
      <Image
        src={"/lambo.jpg"}
        width={500}
        height={500}
        alt="lambo"
        className="w-full h-full object-cover hidden md:block" />
      <div className="flex items-center justify-center">
        {children}

      </div>
    </div>
  );
}
