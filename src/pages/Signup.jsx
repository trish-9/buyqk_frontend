import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react'

const API_BASE = 'https://buyqk-bakend.onrender.com/api'

export default function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()

    setError('')

    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password.trim()) {
      setError('Please enter a password.')
      return
    }

    if (password.length < 6) {
      setError(
        'Password must contain at least 6 characters.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      // Backend route: POST /api/signup, body: { email, password }
      // On success it just responds with status 200 (no token/user
      // object is returned), so localStorage below is still what
      // keeps the person logged in on the frontend.
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      if (response.status !== 200) {
        throw new Error(`Signup failed with status ${response.status}`)
      }

      // Save account information
      const user = {
        name: name.trim(),
        email: email.trim(),
        password: password,
      }

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      )

      // Automatically log the user in
      localStorage.setItem(
        'isLoggedIn',
        'true'
      )

      localStorage.setItem(
        'userName',
        name.trim()
      )

      localStorage.setItem(
        'userEmail',
        email.trim()
      )

      // Go to dashboard
      navigate('/login', {
        replace: true,
      })
    } catch (err) {
      console.error('Signup error:', err)
      setError('Something went wrong while creating your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* =========================
          LEFT SIDE
      ========================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-16 flex-col justify-center">

        <div className="max-w-xl">

          {/* LOGO */}
          <div className="flex items-center gap-4 mb-20">

            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart
                size={34}
                className="text-orange-500"
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold">
                Buy<span className="text-white">QK</span>
              </h1>

              <p className="text-orange-100">
                Local. Quick. Reliable.
              </p>
            </div>

          </div>

          <h2 className="text-5xl font-bold leading-tight mb-8">
            Start managing your
            <br />
            business finances.
          </h2>

          <p className="text-xl text-orange-50 leading-relaxed max-w-lg">
            Create your BuyQK merchant account and
            manage income, expenses, invoices and
            payments from one simple dashboard.
          </p>

        </div>

      </div>

      {/* =========================
          RIGHT SIDE
      ========================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">

        <div className="w-full max-w-[520px]">

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">

            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
              <ShoppingCart
                size={26}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Buy<span className="text-orange-500">QK</span>
              </h1>

              <p className="text-xs text-slate-400">
                Local. Quick. Reliable.
              </p>
            </div>

          </div>

          {/* SIGNUP CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 md:p-10">

            <div className="mb-7">

              <h2 className="text-3xl font-bold text-slate-900">
                Create account
              </h2>

              <p className="text-slate-500 mt-2">
                Create your BuyQK merchant account.
              </p>

            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSignup}
              className="space-y-5"
            >

              {/* NAME */}
              <div>

                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Full name
                </label>

                <div className="relative">

                  <User
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition"
                  />

                </div>

              </div>

              {/* EMAIL */}
              <div>

                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition"
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Create a password"
                    className="w-full h-14 pl-12 pr-12 rounded-xl border border-slate-200 bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm your password"
                    className="w-full h-14 pl-12 pr-12 rounded-xl border border-slate-200 bg-white outline-none text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>

              </div>

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating account...' : 'Create Account'}
                {!submitting && <ArrowRight size={20} />}
              </button>

            </form>

            {/* LOGIN LINK */}
            <div className="text-center mt-7">

              <p className="text-sm text-slate-500">
                Already have an account?{' '}

                <Link
                  to="/login"
                  className="font-semibold text-orange-500 hover:text-orange-600"
                >
                  Sign in
                </Link>
              </p>

            </div>

          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 BuyQK. All rights reserved.
          </p>

        </div>

      </div>

    </div>
  )
}
