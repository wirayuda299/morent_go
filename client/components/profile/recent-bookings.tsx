import { Car, Clock } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Badge } from "@/components/ui/badge"
import { GetUserRecentBooking } from "@/helpers/server/users"
import { formatPrice } from "@/utils"
import { TabsContent } from "../ui/tabs"
import Link from "next/link"

export default async function RecentBookings() {
  const recentBookings = await GetUserRecentBooking()

  return (
    <TabsContent value={"bookings"} className="space-y-4 w-full">
      {recentBookings.length < 1 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Car className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            You haven&apos;t made any car bookings yet. Start your journey by exploring our available vehicles.
          </p>
          <Link href={"/search"} className="gap-2 flex bg-primary items-center p-2 rounded-sm text-white hover:bg-primary/85 text-sm">
            <Car className="w-4 h-4" />
            Browse Cars
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Recent Bookings</h2>
          {recentBookings.length > 0 && (
            recentBookings.map(book => (
              <Card className="w-full" key={book.rental_id}>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{book.car_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(book.pickup_date).toLocaleDateString() + " - " + new Date(book.return_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Badge className="capitalize" variant={book.status === "paid" ? "secondary" : "default"}>{book.status}</Badge>
                    <span className="font-semibold">{formatPrice(book.total_price)}</span>
                  </div>
                </CardContent>
              </Card>

            ))
          )}
        </>

      )}
    </TabsContent>
  )
}



