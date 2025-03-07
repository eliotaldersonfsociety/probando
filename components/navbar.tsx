"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <header className="w-full border-b bg-white">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">E-Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/shop" className="text-sm font-medium hover:text-primary">
              Shop
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                  Dashboard
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" className="text-sm font-medium hover:text-primary">
                    Admin
                  </Link>
                )}
                <Button variant="ghost" onClick={logout} className="text-sm font-medium">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="text-sm font-medium">Register</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/shop"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="text-sm font-medium hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="text-sm font-medium justify-start px-0"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

