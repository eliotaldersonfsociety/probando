import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import Link from "next/link"
import { ShoppingBag, User, BarChart3 } from "lucide-react"
import Navbar from "../components/navbar"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Your Complete E-commerce Solution
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Shop with confidence, manage your balance, and track your purchases all in one place.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" size="lg">
                    Browse Shop
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <ShoppingBag className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Shop Products</CardTitle>
                  <CardDescription>Browse our wide selection of products and add them to your cart.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our shop features a variety of products to meet your needs. Easily browse, search, and filter to
                    find exactly what you're looking for.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/shop">
                    <Button variant="outline">Visit Shop</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <User className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>User Dashboard</CardTitle>
                  <CardDescription>Manage your account, view your balance, and track purchases.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your personal dashboard gives you complete control over your account. Check your balance, view
                    purchase history, and update your profile.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Admin Panel</CardTitle>
                  <CardDescription>For administrators to manage users and balances.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Administrators can view all users, manage balances, and oversee the platform's operations through a
                    dedicated admin interface.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/admin">
                    <Button variant="outline">Admin Access</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-gray-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">© 2025 E-commerce Platform. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-sm text-gray-500 hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:underline">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

