"use client"
//cc
import { createContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: number
  name: string
  lastname: string
  email: string
  isAdmin: boolean
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string, recaptchaToken: string) => Promise<void>
  register: (userData: RegisterData, recaptchaToken: string) => Promise<void>
  logout: () => void
  loading: boolean
}

type RegisterData = {
  name: string
  lastname: string
  email: string
  password: string
  direction: string
  postalcode: string
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string, recaptchaToken: string) => {
    try {
      setLoading(true)
      const response = await fetch("https://probando-h1ip.onrender.com/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, recaptchaToken }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()

      // Save auth data to state and localStorage
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData, recaptchaToken: string) => {
    try {
      console.log("Enviando datos al servidor:", userData, recaptchaToken) // 👀 Verifica qué se envía
      setLoading(true)
      const response = await fetch("https://probando-h1ip.onrender.com/api/v1/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...userData, recaptchaToken }),
      })

      console.log("Respuesta de la API:", response) // 👀 Verifica la respuesta

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error de la API:", errorData) // 👀 Muestra el error si falla
        throw new Error(errorData.message || "Registration failed")
      }

      const data = await response.json()
      console.log("Datos recibidos:", data) // 👀 Verifica la respuesta

      // Save auth data to state and localStorage
      setToken(data.token)
      setUser(data.newUser)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.newUser))

      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear auth data from state and localStorage
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>
  )
}

