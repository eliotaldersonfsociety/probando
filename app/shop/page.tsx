"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/use-auth"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../components/ui/use-toast"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import Navbar from "../components/navbar"

// Mock product data
const products = [
  {
    id: 1,
    name: "Premium T-Shirt",
    description: "High-quality cotton t-shirt with a modern fit",
    price: 29.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Designer Jeans",
    description: "Stylish jeans with a comfortable stretch fit",
    price: 59.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Casual Sneakers",
    description: "Lightweight and comfortable for everyday wear",
    price: 79.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Leather Wallet",
    description: "Genuine leather wallet with multiple card slots",
    price: 39.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    name: "Wireless Headphones",
    description: "High-quality sound with noise cancellation",
    price: 129.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    name: "Smartwatch",
    description: "Track your fitness and stay connected",
    price: 199.99,
    image: "/placeholder.svg?height=200&width=200",
  },
]

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
}

export default function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const addToCart = (product: (typeof products)[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prevCart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
      }
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const updateQuantity = (id: number, change: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)),
    )
  }

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (!user || !token) {
      toast({
        title: "Login required",
        description: "Please login to complete your purchase",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // First check if user has enough balance
      const balanceResponse = await fetch("http://localhost:3001/api/v1/user/saldo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!balanceResponse.ok) {
        throw new Error("Failed to check balance")
      }

      const balanceData = await balanceResponse.json()
      const total = calculateTotal()

      if (balanceData.saldo < total) {
        toast({
          title: "Insufficient funds",
          description: "Please add more funds to your account",
          variant: "destructive",
        })
        return
      }

      // Process the purchase
      const purchaseResponse = await fetch("http://localhost:3001/api/v1/user/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          payment_method: "Balance",
          total_amount: total,
        }),
      })

      if (!purchaseResponse.ok) {
        throw new Error("Failed to process purchase")
      }

      // Update user balance
      const updateBalanceResponse = await fetch("http://localhost:3001/api/v1/user/actualizar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          total_amount: total,
        }),
      })

      if (!updateBalanceResponse.ok) {
        throw new Error("Failed to update balance")
      }

      // Clear cart and show success message
      setCart([])
      setShowCart(false)

      toast({
        title: "Purchase successful",
        description: "Your order has been processed successfully",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Failed to process your purchase",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Shop</h1>
          <Button variant="outline" className="relative" onClick={() => setShowCart(!showCart)}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </Button>
        </div>

        {showCart ? (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Cart</CardTitle>
                <CardDescription>
                  {cart.length === 0
                    ? "Your cart is empty"
                    : `${cart.reduce((total, item) => total + item.quantity, 0)} items in your cart`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Your cart is empty. Add some products to get started.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex justify-between w-full">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex space-x-2 w-full">
                  <Button variant="outline" className="w-1/2" onClick={() => setShowCart(false)}>
                    Continue Shopping
                  </Button>
                  <Button className="w-1/2" onClick={handleCheckout} disabled={cart.length === 0 || isProcessing}>
                    {isProcessing ? "Processing..." : "Checkout"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => addToCart(product)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
