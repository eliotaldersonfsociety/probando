"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/use-auth"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardDescription, CardFooter, CardTitle } from "../../components/ui/card"
import { useToast } from "../components/ui/use-toast"
import { Plus, Minus, Trash2 } from "lucide-react"
import Navbar from "../components/navbar"
import Image from "next/image"

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

      toast({
        title: "Purchase successful",
        description: "Your order has been processed successfully",
      })

      // Redirect to order confirmation or another page if necessary
      router.push("/order-confirmation")
    } catch (error) {
      console.error("Error during checkout:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container">
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-48 object-cover"
              />
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => addToCart(product)} leftIcon={<Plus />}>Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {showCart && (
        <div className="cart">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <span>{item.name}</span>
                <div className="quantity-controls">
                  <Button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}><Minus /></Button>
                  <span>{item.quantity}</span>
                  <Button onClick={() => updateQuantity(item.id, 1)}><Plus /></Button>
                </div>
                <span>${item.price * item.quantity}</span>
                <Button onClick={() => removeFromCart(item.id)}><Trash2 /></Button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <span>Total: ${calculateTotal()}</span>
            <Button onClick={handleCheckout} isLoading={isProcessing}>Checkout</Button>
          </div>
        </div>
      )}
    </div>
  )
}
