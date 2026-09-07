import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'buyqk_users'
const CURRENT_USER_KEY = 'buyqk_current_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_KEY)

      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Auth loading error:', error)
      localStorage.removeItem(CURRENT_USER_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  // ==========================================
  // GET USERS
  // ==========================================

  const getUsers = () => {
    try {
      const savedUsers = localStorage.getItem(USERS_KEY)

      if (!savedUsers) {
        return []
      }

      const parsedUsers = JSON.parse(savedUsers)

      return Array.isArray(parsedUsers)
        ? parsedUsers
        : []
    } catch (error) {
      console.error('Users loading error:', error)
      return []
    }
  }

  // ==========================================
  // SIGNUP
  // ==========================================

  const signup = ({
    name,
    email,
    password,
    businessName = 'Mehta Enterprises',
  }) => {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanBusinessName =
      businessName.trim() || 'Mehta Enterprises'

    if (!cleanName || !cleanEmail || !password) {
      return {
        success: false,
        message: 'Please fill all required fields.',
      }
    }

    if (password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters.',
      }
    }

    const users = getUsers()

    const existingUser = users.find(
      (item) =>
        item.email.toLowerCase() === cleanEmail
    )

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists.',
      }
    }

    const newUser = {
      id: Date.now(),
      name: cleanName,
      email: cleanEmail,
      password,
      businessName: cleanBusinessName,
      role: 'Merchant',
      merchantId: `BQK-${Date.now()
        .toString()
        .slice(-6)}`,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [
      ...users,
      newUser,
    ]

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(updatedUsers)
    )

    // Do not keep password in logged-in user
    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      businessName: newUser.businessName,
      role: newUser.role,
      merchantId: newUser.merchantId,
      createdAt: newUser.createdAt,
    }

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(safeUser)
    )

    setUser(safeUser)

    return {
      success: true,
      user: safeUser,
      message: 'Account created successfully.',
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================

  const login = ({
    email,
    password,
  }) => {
    const cleanEmail = email.trim().toLowerCase()

    const users = getUsers()

    const foundUser = users.find(
      (item) =>
        item.email.toLowerCase() === cleanEmail &&
        item.password === password
    )

    if (!foundUser) {
      return {
        success: false,
        message: 'Invalid email or password.',
      }
    }

    const safeUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      businessName:
        foundUser.businessName ||
        'Mehta Enterprises',
      role: foundUser.role || 'Merchant',
      merchantId:
        foundUser.merchantId ||
        'BQK-27845',
      createdAt: foundUser.createdAt,
    }

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(safeUser)
    )

    setUser(safeUser)

    return {
      success: true,
      user: safeUser,
      message: 'Login successful.',
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY)

    setUser(null)

    return {
      success: true,
      message: 'Logged out successfully.',
    }
  }

  // ==========================================
  // UPDATE USER
  // ==========================================

  const updateUser = (updates) => {
    if (!user) return

    const users = getUsers()

    const updatedUsers = users.map(
      (item) =>
        item.id === user.id
          ? {
              ...item,
              ...updates,
            }
          : item
    )

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(updatedUsers)
    )

    const updatedCurrentUser = {
      ...user,
      ...updates,
    }

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(updatedCurrentUser)
    )

    setUser(updatedCurrentUser)
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    signup,
    login,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}