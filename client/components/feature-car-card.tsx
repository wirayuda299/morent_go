import { carCategories } from "@/constants";
import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function FeatureCarCard({ category }: { category: string }) {
  return (
    <Link href="/search" className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 transform group-hover:scale-105">
        <div className="relative h-48">
          <Image
            src={
              carCategories.find((c) => c.name === category)?.icon ||
              "/placeholder.svg"
            }
            alt={category}
            fill
            className="transition-all duration-300 group-hover:opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-xl font-semibold capitalize">{category}</h3>
            <p className="text-gray-300 capitalize group-hover:text-white transition-colors duration-300">
              Explore {category}{" "}
              <ChevronRightIcon className="inline-block ml-1 w-5 h-5" />
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
