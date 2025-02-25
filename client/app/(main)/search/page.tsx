
export const dynamic = 'force-dynamic'

import { auth } from "@clerk/nextjs/server";

import CarCard from "@/components/car-card";
import SearchByName from "@/components/search-by-name";
import { getAllCars } from "@/helpers/server/car";
import { Car } from "@/types";
import { searchCar } from "@/helpers/client/car";

type Props = {
  searchParams: Promise<{
    type: string
    capacity: string
    search_by: string
  }>
}
export default async function Search({ searchParams }: Props) {
  const type = (await searchParams).type || null  
  const capacity = (await searchParams).capacity || null 
  const searchBy = (await searchParams).search_by 
  const { userId, getToken } = await auth();

  let allCars: Car[] = []

  if (type && searchBy === 'type') {
    allCars = await searchCar({
      user_id: userId!,
      search_by: "type",
      type,
      token: (await getToken())!
    });
  } else if (type && capacity) {
    allCars = await searchCar({
      user_id: userId!,
      search_by: searchBy,
      token: (await getToken())!,
      type,
      capacity
    })

  } else if (capacity && searchBy === 'capacity') {
    allCars = await searchCar({
      user_id: userId!,
      search_by: searchBy,
      token: (await getToken())!,
      capacity
    })
  } else {
    allCars = await getAllCars("all");
  }
  console.log({type, capacity, searchBy})


  return (
    <div className="w-full p-4">
      <SearchByName />
      {allCars.length === 0 && type && (
        <p className="text-sm text-red-500">No car match with this type</p>
      )}
      {allCars.length > 0 && type && (
        <section className="">
          <p className="text-base text-gray-900 font-medium pt-4 pb-3">Search result :</p>
          <div className="flex flex-wrap w-full gap-5">
            {allCars?.map(c => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        </section>


      )}
      {allCars && !type && (
        <section className="">
          <p className="text-base text-gray-900 font-medium pt-4 pb-3">All cars</p>
          <div className="flex flex-wrap w-full gap-5">
            {allCars?.map(c => (
              <CarCard key={c.name} car={c} />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
