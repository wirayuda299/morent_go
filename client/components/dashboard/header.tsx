import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "../ui/sidebar"
import { UserButton } from "@clerk/nextjs"

export function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="block md:hidden" />
        <Input
          placeholder="Search..."
          className="w-[200px] lg:w-[300px]"
        />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <UserButton />
      </div>
    </header>
  )
}


