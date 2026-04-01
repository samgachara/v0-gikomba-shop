// app/auth/sign-up/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, ShoppingBag, Check, X, MailCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signUpSchema, passwordSchema, normalizeAuthError } from '@/lib/validators/auth'
import { ZodError } from 'zod'

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false) // ADDED THIS LINE
  const router = useRouter()

  const passwordRequirements = [
    { id: 1, label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { id: 2, label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { id: 3, label: 'At least one lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { id: 4, label: 'At least one number', test: (p: string) => /[0-9]/.test(p) },
    { id: 5, label: 'At least one special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ]

  const isPasswordValid = useMemo(
    () => passwordRequirements.every((req) => req.test(password)),
    [password]
  )

  const passwordsMatch = useMemo(
    () => password === confirmPassword && confirmPassword !== '',
    [password, confirmPassword]
  )

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setNeedsVerification(false)

    const result = signUpSchema.safeParse({
      email,
      password,
      firstName,
      lastName,
      phone,
    })

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message
      })
      setFieldErrors(errors)
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: {
            first_name: result.data.firstName,
            last_name: result.data.lastName,
            phone: result.data.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/sign-up-success`,
        },
      })

      if (authError) {
        setError(normalizeAuthError(authError))
        setLoading(false)
        return
      }

      setNeedsVerification(true)
    } catch (err) {
      console.error('[signup] Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">gikomba.shop</span>
          </Link>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Sign up to start shopping or selling</CardDescription>
        </CardHeader>
        <CardContent>
          {needsVerification && (
            <div className="flex items-start gap-3 p-4 mb-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
              <MailCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Verify your email address</p>
                <p className="mt-1 text-blue-700">
                  We sent a confirmation link to <strong>{email}</strong>. Please check your inbox
                  (and spam folder) to activate your account.
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={!!fieldErrors.firstName}
                  autoComplete="given-name"
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={!!fieldErrors.lastName}
                  autoComplete="family-name"
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
                )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!fieldErrors.phone}
                autoComplete="tel"
              />
              {fieldErrors.phone && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>
              )}
              <p className="text-xs text-muted-foreground">Kenyan number for M-Pesa payments</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                aria-invalid={!!fieldErrors.password}
                autoComplete="new-password"
              />
              {fieldErrors.password && (
                <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
              )}
              {showPasswordRequirements && password.length > 0 && (
                <div className="mt-2 p-3 bg-muted rounded-lg space-y-1.5">
                  {passwordRequirements.map((req) => {
                    const passed = req.test(password)
                    return (
                      <div
                        key={req.id}
                        className={cn(
                          'flex items-center gap-2 text-xs transition-colors',
                          passed ? 'text-green-600' : 'text-muted-foreground'
                        )}
                      >
                        {passed ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {req.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!passwordsMatch && confirmPassword !== ''}
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && (
                <p className={cn(
                  'text-xs',
                  passwordsMatch ? 'text-green-600' : 'text-destructive'
                )}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !isPasswordValid || !passwordsMatch}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
