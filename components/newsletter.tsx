"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-6">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            Get 10% Off Your First Order
          </h2>
          <p className="text-primary-foreground/80 max-w-md">
            Subscribe to our newsletter for exclusive deals, new arrivals, and flash sales. 
            Be the first to know!
          </p>
          
          {submitted ? (
            <div className="flex items-center gap-2 rounded-full bg-primary-foreground/10 px-6 py-3">
              <span className="text-primary-foreground">
                Thanks! You&apos;re subscribed.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                required
              />
              <Button 
                type="submit" 
                variant="secondary"
                className="gap-2"
              >
                Subscribe
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}

          <p className="text-xs text-primary-foreground/60">
            By subscribing, you agree to receive marketing messages. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
