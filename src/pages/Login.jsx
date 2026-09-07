import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShoppingCart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react'


export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] =
    useState(false)
  const [error, setError] = useState('')

  const handleLogin = async(e) => {
    e.preventDefault()

    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    /*
      DEMO LOGIN

      This stores the login information in localStorage.
      Later you can replace this with your backend API.
    */
     
    
    const r1 =  await fetch("https://buyqk-bakend.onrender.com/api/login", {method : "POST",headers:{'Content-Type': 'application/json'},body: JSON.stringify({email,password})})
    const r = await r1.json()
    console.log(r)
    if(r.login===true)
    {
      
      let userName = r.email

      localStorage.setItem('isLoggedIn','true')

      localStorage.setItem('userName',userName)

      localStorage.setItem('userEmail', email)
      localStorage.setItem('token',r.token)

      navigate('/dashboard',{replace: true})

    }
   
    
    
    
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* LEFT SIDE */}
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
            Manage your business
            <br />
            finances with ease.
          </h2>

          <p className="text-xl text-orange-50 leading-relaxed max-w-lg">
            Track income, expenses, invoices,
            payments and business performance
            from one simple dashboard.
          </p>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">

        <div className="w-full max-w-[520px]">

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">

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

          {/* LOGIN CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 md:p-10">

            <div className="mb-8">

              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="text-slate-500 mt-2">
                Sign in to your BuyQK merchant account.
              </p>

            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="space-y-6"
            >

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
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter password"
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

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-orange-100"
              >
                Sign In
                <ArrowRight size={20} />
              </button>

            </form>

            {/* SIGNUP */}
            <div className="text-center mt-8">

              <p className="text-sm text-slate-500">
                Don't have an account?{' '}

                <Link
                  to="/signup"
                  className="font-semibold text-orange-500 hover:text-orange-600"
                >
                  Create account
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
