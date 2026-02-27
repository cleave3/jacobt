import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { axios } from '../lib/axios'

interface User {
    id: string
    name?: string
    phone?: string
    role?: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (userData: User) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if the user is already logged in (e.g., from a stored token or /api/auth/me endpoint)
        // For now, check localStorage as a fallback, but cookies are mainly used by the backend
        const initializeAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user')
                if (storedUser) {
                    setUser(JSON.parse(storedUser))
                }

                // Optional: fetch real user session using cookies
                // const res = await fetch('/api/auth/me')
                // if (res.ok) {
                //   const data = await res.json()
                //   setUser(data.user)
                // }
            } catch (error) {
                console.error("Failed to restore session", error)
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const login = (userData: User) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        // Call backend endpoint to clear cookie as well
        axios.post('/auth/logout').catch(console.error)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
