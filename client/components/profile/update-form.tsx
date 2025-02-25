"use client"

import Form from "next/form"
import { useActionState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import { ActionResponse, updateUser } from "@/serveractions/user"
import UpdateUserButton from "./submit-btn"

const states: ActionResponse = {
  message: "",
  success: false,
  errors: {}
}


export default function PersonalInfoForm({ firstName, lastName, username }:
  { firstName: string, lastName: string, username: string }) {

  const [state, formAction] = useActionState(updateUser, states)

  return (
    <TabsContent value="settings" className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 w-full">
          <Form action={formAction}>
            <div
              className="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" defaultValue={firstName || ""} />
                {state.errors?.firstName && (
                  <p id="firstname-error" className="text-sm text-red-500">
                    {state.errors.firstName[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" defaultValue={lastName || ""} />
                {state.errors?.lastName && (
                  <p id="lastName-error" className="text-sm text-red-500">
                    {state.errors.lastName[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" defaultValue={username || ""} />
                {state.errors?.username && (
                  <p id="username-error" className="text-sm text-red-500">
                    {state.errors.username[0]}
                  </p>
                )}
              </div>
            </div>
            <UpdateUserButton />
            {state.success && (
              <p className="text-sm text-green-500 my-1">
                {state.message}
              </p>
            )}
          </Form>
        </CardContent>
      </Card>
    </TabsContent>
  )
}


