'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, ShoppingBag, Check, X, MailCheck, Store, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signUpSchema, normalizeAuthError } from '@/lib/validators/auth'
import { FcGoogle } from 'react-icons/fc'

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const searchParams = useSearchParams()
  const [role, setRole] = useState<'buyer' | 'seller'>(
    searchParams.get('role') === 'seller' ? 'seller' : 'buyer'
  )
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

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

    const result = signUpSchema.safeParse({ email, password, firstName, lastName, phone })
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message
      })
      setFieldErrors(errors)
      return
    }
    if (!passwordsMatch) { setError('Passwords do not match'); return }

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
            role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) { setError(normalizeAuthError(authError)); setLoading(false); return }
      setNeedsVerification(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    }
    setLoading(false)
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?role=${role}` },
    })
    if (authError) { setError(authError.message); setGoogleLoading(false) }
  }

  const isAnyLoading = loading || googleLoading

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">gikomba.shop</span>
            </Link>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account and start {role === 'seller' ? 'selling' : 'shopping'} on gikomba.shop.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">gikomba.shop</span>
          </Link>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join Kenya's favourite marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">I want to:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  role === 'buyer'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="text-sm font-semibold">Buy</span>
                <span className="text-xs">Shop products</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  role === 'seller'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                <Store className="w-6 h-6" />
                <span className="text-sm font-semibold">Sell</span>
                <span className="text-xs">List products</span>
              </button>
            </div>
          </div>

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleSignUp}
            disabled={isAnyLoading}
          >
            {googleLoading
              ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              : <FcGoogle className="mr-2 h-4 w-4" />}
            Continue with Google as {role === 'seller' ? 'Seller' : 'Buyer'}
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="Sam" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={!!fieldErrors.firstName} autoComplete="given-name" disabled={isAnyLoading} />
                {fieldErrors.firstName && <p className="text-xs text-destructive">{fieldErrors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Gachara" value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={!!fieldErrors.lastName} autoComplete="family-name" disabled={isAnyLoading} />
                {fieldErrors.lastName && <p className="text-xs text-destructive">{fieldErrors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email} autoComplete="email" disabled={isAnyLoading} />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" type="tel" placeholder="+254 7XX XXX XXX" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!fieldErrors.phone} autoComplete="tel" disabled={isAnyLoading} />
              {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
              <p className="text-xs text-muted-foreground">Kenyan number for M-Pesa payments</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a strong password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                aria-invalid={!!fieldErrors.password} autoComplete="new-password" disabled={isAnyLoading} />
              {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              {showPasswordRequirements && password.length > 0 && (
                <div className="mt-2 p-3 bg-muted rounded-lg space-y-1.5">
                  {passwordRequirements.map((req) => {
                    const passed = req.test(password)
                    return (
                      <div key={req.id} className={cn('flex items-center gap-2 text-xs', passed ? 'text-green-600' : 'text-muted-foreground')}>
                        {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {req.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!passwordsMatch && confirmPassword !== ''} autoComplete="new-password" disabled={isAnyLoading} />
              {confirmPassword.length > 0 && (
                <p className={cn('text-xs', passwordsMatch ? 'text-green-600' : 'text-destructive')}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isAnyLoading || !isPasswordValid || !passwordsMatch}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : `Create ${role === 'seller' ? 'Seller' : 'Buyer'} Account`}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{' '}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
