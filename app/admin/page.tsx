"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/use-auth"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { useToast } from "../components/ui/use-toast"
import { Loader2, CreditCard } from "lucide-react"
import Navbar from "../components/navbar"

type UserData = {
  id: number
  email: string
  name: string
  lastname: string
  direction: string
  postalcode: string
  saldo: number
}

export default function AdminPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Redirect if not logged in or not an admin
    if (!user) {
      if (!loading) {
        router.push("/login")
      }
      return
    }

    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin panel",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    // Fetch all users
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:3001/api/v1/user/recargar", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data.users || [])
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user && user.isAdmin && token) {
      fetchUsers()
    }
  }, [user, token, router, toast, loading])

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) === 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      const response = await fetch("http://localhost:3001/api/v1/user/updateSaldo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: selectedUser,
          saldo: Number(amount),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update balance")
      }

      const data = await response.json()

      // Update the user in the local state
      setUsers((prevUsers) => prevUsers.map((u) => (u.email === selectedUser ? { ...u, saldo: data.newSaldo } : u)))

      setAmount("")

      toast({
        title: "Success",
        description: `Balance updated successfully for ${selectedUser}`,
      })
    } catch (error) {
      console.error("Error updating balance:", error)
      toast({
        title: "Error",
        description: "Failed to update user balance",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading admin panel...</span>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Postal Code</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>
                            {user.name} {user.lastname}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.direction}</TableCell>
                          <TableCell>{user.postalcode}</TableCell>
                          <TableCell>${user.saldo.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setSelectedUser(user.email)}>
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Update User Balance</CardTitle>
              <CardDescription>Add or remove funds from a user's account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateBalance} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Selected User</Label>
                  <Input
                    id="user"
                    value={selectedUser || ""}
                    readOnly
                    placeholder="Select a user from the table above"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (positive to add, negative to subtract)</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">$</div>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={!selectedUser || !amount || isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Update Balance
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
