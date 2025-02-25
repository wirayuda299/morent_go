import Image from "next/image";
import { CalendarIcon, CarIcon, SearchIcon } from "lucide-react"

import CarCard from "@/components/car-card";
import { HOME_HEADERS } from "@/constants";
import { getAllCars, getFeaturedCategories } from "@/helpers/server/car";
import { Button } from "@/components/ui/button";
import FeatureCarCard from "@/components/feature-car-card";

export default async function Home() {

  const cars = await getAllCars()
  const categories=await getFeaturedCategories()

  return (
    <main className="w-full bg-white h-full p-2">
      <header className="flex justify-center gap-4 text-white ">
        {HOME_HEADERS.map((header, i) => (
          <div
            className={`relative group ${i === 1 ? 'hidden sm:block' : ''}`}
            key={header.title1}
          >
            <div className='overflow-hidden rounded-lg aspect-w-16 aspect-h-9 relative'>
              <Image
                className='bject-cover w-full min-h-[232px] lg:min-h-[360px]'
                src={header.background}
                alt='Blue background with car'
                width={500}
                height={500}
                priority
              />
              <div className='absolute top-0 p-4 lg:p-6 text-left'>
                <div className='font-semibold text-2xl md:text-32 md:leading-9'>
                  <p>
                    {header.title1}
                  </p>
                  <p>
                    {header.title2}
                  </p>
                </div>
                <p className=' text-sm md:text-base leading-6 pt-2'>
                  {header.subtitle1}
                  <br></br>
                  {header.subtitle2}
                </p>
              </div>
            </div>
          </div>
        ))}
      </header>
      <section className="w-full bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category ) => (
            <FeatureCarCard category={category} key={category}/>
                          ))}
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="w-full bg-white-200 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cars?.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Wide Selection", icon: CarIcon },
              { title: "Best Prices", icon: SearchIcon },
              { title: "24/7 Support", icon: CalendarIcon },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Hit the Road?</h2>
          <p className="text-xl mb-8">Book your perfect car today and start your adventure!</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            Book Now
          </Button>
        </div>
      </section>

    </main>
  );
}
