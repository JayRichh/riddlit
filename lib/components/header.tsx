/*
<ai_context>
Landing page header component for the Riddlit app.
Provides navigation and user controls for the landing page.
Updated with notification bell for signed-in users (already has dark mode toggle).
</ai_context>
*/

'use client'

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Menu, Rocket, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/lib/components/ui/button'
import { NotificationBell } from '@/lib/components/ui/notification-bell'
import ThemeSwitcher from '@/lib/components/utilities/theme-switcher'

interface NavLink {
  href: string
  label: string
}

const navLinks: NavLink[] = []

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        isScrolled ? 'bg-background/80 shadow-xs backdrop-blur-xs' : 'bg-background'
      }`}
    >
      <div className="mx-auto flex max-w-(--breakpoint-2xl) items-center justify-between p-4">
        <div className="flex items-center space-x-2 hover:cursor-pointer hover:opacity-80">
          <Image
            src="/riddlit_text.png"
            alt="Riddlit Logo"
            onClick={() => (window.location.href = '/')}
            width={150}
            height={48}
            className="-my-12 rounded-md object-contain transition-all duration-300 hover:translate-y-1 hover:scale-105 hover:cursor-pointer dark:invert"
            style={{
              objectPosition: 'center',
            }}
          />
        </div>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 space-x-2 font-semibold md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1 hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Display these on desktop only */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeSwitcher />

            <SignedIn>
              <NotificationBell />
              <Link href="/dashboard">
                <Button className="gap-2">
                  <Rocket className="size-4" />
                  Go to App
                </Button>
              </Link>
            </SignedIn>
          </div>

          <SignedOut>
            <SignInButton>
              <Button variant="outline">Login</Button>
            </SignInButton>

            <SignUpButton>
              <Button className="bg-blue-500 hover:bg-blue-600">Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="bg-background border-b p-4 md:hidden">
          <div className="space-y-4">
            <SignedIn>
              <div className="flex items-center space-x-2">
                <NotificationBell />
                <Link
                  href="/dashboard"
                  className="text-foreground/80 hover:text-foreground block py-2 text-sm font-medium"
                  onClick={toggleMenu}
                >
                  Go to App
                </Link>
              </div>
            </SignedIn>
            <div>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
