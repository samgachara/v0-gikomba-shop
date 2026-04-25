import { Suspense } from "react"
import { SignUpForm } from "./sign-up-form"

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
