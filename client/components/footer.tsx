import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">
              At Morent, we make mobility simple and stress-free. With a wide
              range of vehicles, competitive pricing, and exceptional service,
              we’re here to provide reliable car rentals for every journey.
              Whether it’s a quick trip or a long adventure, we’re committed to
              getting you where you need to go with ease and convenience.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Cars
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-400">123 Car Street, City, Country</p>
            <p className="text-gray-400">Phone: +1 234 567 8900</p>
            <p className="text-gray-400">Email: info@carrentalapp.com</p>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400">
          <p>&copy; 2025 Car Rental App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
