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
import { passwordSchema } from '@/lib/validators/auth'
import { ZodError } from 'zod'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const router = useRouter()

  const passwordRequirements = [
    { id: 1, label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { id: 2, label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { id: 3, label: 'At least one lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { id: 4, label: 'At least one number', test: (p: string) => /[0-9]/.test(p) },
    { id: 5, label: 'At least one special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ]

  const isPasswordValid = useMemo(() =>
    passwordRequirements.every(req => req.test(password)),
    [password]
  )

  const passwordsMatch = useMemo(() =>
    password === confirmPassword && confirmPassword !== '',
    [password, confirmPassword]
  )

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      passwordSchema.parse(password)
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0].message)
        return
      }
      setError('An unexpected validation error occurred')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      router.push('/auth/login?message=Password updated successfully! Please log in.')
    }, 2000)
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
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="flex items-start gap-3 p-4 mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
              <MailCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Password updated successfully!</p>
                <p className="mt-1 text-green-700">
                  You can now <Link href="/auth/login" className="underline">log in</Link> with your new password.
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
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                required
                autoComplete="new-password"
                disabled={loading || success}
              />
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
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading || success}
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
              disabled={loading || success || !isPasswordValid || !passwordsMatch}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
