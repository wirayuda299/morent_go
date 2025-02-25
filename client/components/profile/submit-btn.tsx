"use client"

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

export default function UpdateUserButton() {
  const { pending } = useFormStatus()

  return (
    <Button className="mt-2 w-full" type="submit" disabled={pending}>{pending ? "Saving changes" : "Save changes"}</Button>
  )
}
