"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/use-auth"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useToast } from "../components/ui/use-toast"
import { Loader2, CreditCard, ShoppingBag, User } from "lucide-react"
import Navbar from "@/components/navbar"

type Purchase = {
  id: number
  items: string
  payment_method: string
  total_amount: number
  created_at: string
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [balance, setBalance] = useState<number | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [addingFunds, setAddingFunds] = useState(false)
  const [amount, setAmount] = useState("")

  useEffect(() => {
    // Redirect if not logged in
    if (!user && !loading) {
      router.push("/login")
      return
    }

    // Fetch user balance
    const fetchBalance = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/v1/user/saldo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch balance")
        }

        const data = await response.json()
        setBalance(data.saldo)
      } catch (error) {
        console.error("Error fetching balance:", error)
        toast({
          title: "Error",
          description: "Failed to fetch your balance",
          variant: "destructive",
        })
      }
    }

    // Fetch purchase history
    const fetchPurchases = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/v1/purchases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 404) {
          // No purchases found is not an error
          setPurchases([])
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch purchases")
        }

        const data = await response.json()
        setPurchases(data.purchases || [])
      } catch (error) {
        console.error("Error fetching purchases:", error)
        toast({
          title: "Error",
          description: "Failed to fetch your purchase history",
          variant: "destructive",
        })
      }
    }

    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchBalance(), fetchPurchases()])
      setLoading(false)
    }

    if (user && token) {
      loadData()
    }
  }, [user, token, router, toast])

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      setAddingFunds(true)
      const response = await fetch("http://localhost:3001/api/v1/user/saldo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(amount) }),
      })

      if (!response.ok) {
        throw new Error("Failed to add funds")
      }

      const data = await response.json()
      setBalance(data.newSaldo)
      setAmount("")

      toast({
        title: "Success",
        description: `${amount} has been added to your balance`,
      })
    } catch (error) {
      console.error("Error adding funds:", error)
      toast({
        title: "Error",
        description: "Failed to add funds to your account",
        variant: "destructive",
      })
    } finally {
      setAddingFunds(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your dashboard...</span>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Welcome</CardTitle>
              <CardDescription>
                Hello, {user?.name} {user?.lastname}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <User className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Your Balance</CardTitle>
              <CardDescription>Current available funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${balance?.toFixed(2) || "0.00"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Purchase History</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  {purchases.length} {purchases.length === 1 ? "purchase" : "purchases"} made
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="balance">Manage Balance</TabsTrigger>
            <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Funds</CardTitle>
                <CardDescription>Add money to your account balance</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFunds} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">$</div>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={addingFunds}>
                    {addingFunds ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Funds
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>View your recent purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">You haven't made any purchases yet.</p>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => {
                      const items = JSON.parse(purchase.items)
                      return (
                        <div key={purchase.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">Purchase #{purchase.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${purchase.total_amount.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">{purchase.payment_method}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <h5 className="text-sm font-medium mb-1">Items:</h5>
                            <ul className="text-sm text-muted-foreground">
                              {items.map((item: any, index: number) => (
                                <li key={index} className="flex justify-between">
                                  <span>
                                    {item.name} x{item.quantity}
                                  </span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

