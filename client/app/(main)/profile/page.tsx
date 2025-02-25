
import { Suspense } from "react"
import { currentUser } from "@clerk/nextjs/server"
import { Car, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getUserTotalRental } from "@/helpers/server/users"
import RecentBookings from "@/components/profile/recent-bookings"
import PersonalInfoForm from "@/components/profile/update-form"

export default async function ProfilePage() {
  const user = await currentUser()
  const totalRentals = await getUserTotalRental()


  return (
    <div className="container mx-auto space-y-8 min-h-screen">
      <div className="flex flex-col w-full md:flex-row gap-8 items-start">

        <Card className="w-full md:w-[300px]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.imageUrl} alt="Profile picture" />
                <AvatarFallback>FB</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.username}</CardTitle>
            <CardDescription>Premium Member</CardDescription>
            <div className="mt-2">
              {user?.emailAddresses[0].verification?.status === "verified" && (
                <Badge variant="secondary" className="mt-2">
                  Verified Driver
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Member since {user?.createdAt && new Date(user?.createdAt).getFullYear()}</span>
            </div>
            {}
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{totalRentals} Total Rentals</span>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <div className="flex-1 w-full">
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <Suspense fallback="Loading recent bookings">
              <RecentBookings />
            </Suspense>

            <PersonalInfoForm username={user?.username || ""} lastName={user?.lastName || ""} firstName={user?.firstName || ""} />
          </Tabs>
        </div>
      </div>
    </div>
  )
}


