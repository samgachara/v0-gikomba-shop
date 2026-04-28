'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Search, Menu, User, Heart, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Shop', href: '/shop' },
  { name: 'New Arrivals', href: '/shop?filter=new' },
  { name: 'Categories', href: '/shop#categories' },
]

export function Header() {
  const { user, loading, signOut } = useAuth()
  const { cartCount, wishlistCount } = useCart()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setUserRole(null); return }
    const supabase = createClient()
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data }) => setUserRole(data?.role ?? 'buyer'))
  }, [user])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="gikomba.shop"
              width={140}
              height={46}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {item.name}
              </Link>
            ))}
            {userRole === 'seller' && (
              <Link href="/dashboard/seller"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80 flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                Seller Dashboard
              </Link>
            )}
            {userRole === 'admin' && (
              <Link href="/dashboard/admin"
                className="text-sm font-medium text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-700 flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
              <Link href="/shop"><Search className="h-5 w-5" /><span className="sr-only">Search</span></Link>
            </Button>

            <Button variant="ghost" size="icon" className="hidden sm:flex relative" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                    {wishlistCount}
                  </span>
                )}
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {userRole === 'seller' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/seller" className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Seller Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {userRole === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/admin" className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
                  <Link href="/auth/login"><User className="h-5 w-5" /></Link>
                </Button>
              )
            )}

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 pt-6">
                  <div className="flex items-center">
                    <Image
                      src="/logo.png"
                      alt="gikomba.shop"
                      width={120}
                      height={40}
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <nav className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href} className="text-lg font-medium text-foreground">
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    {user ? (
                      <>
                        {userRole === 'seller' && (
                          <Button variant="outline" className="w-full justify-start gap-2" asChild>
                            <Link href="/dashboard/seller">
                              <LayoutDashboard className="h-4 w-4" />Seller Dashboard
                            </Link>
                          </Button>
                        )}
                        {userRole === 'admin' && (
                          <Button variant="outline" className="w-full justify-start gap-2 text-violet-600 dark:text-violet-400 border-violet-200" asChild>
                            <Link href="/dashboard/admin">
                              <LayoutDashboard className="h-4 w-4" />Admin Panel
                            </Link>
                          </Button>
                        )}
                        <Button variant="outline" className="w-full justify-start gap-2" asChild>
                          <Link href="/account"><User className="h-4 w-4" />My Account</Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" asChild>
                          <Link href="/wishlist"><Heart className="h-4 w-4" />Wishlist ({wishlistCount})</Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2 text-destructive" onClick={signOut}>
                          <LogOut className="h-4 w-4" />Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full justify-start gap-2" asChild>
                          <Link href="/auth/login"><User className="h-4 w-4" />Sign In</Link>
                        </Button>
                        <Button className="w-full" asChild>
                          <Link href="/auth/sign-up">Create Account</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
