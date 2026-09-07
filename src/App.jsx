import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import DashboardLayout from './layouts/DashboardLayout'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import Income from './pages/Income'
import Expense from './pages/Expense'
import Invoices from './pages/Invoices'
import Products from './pages/Products'
import Tools from './pages/Tools'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import ProtectedRoute from './components/ProtectedRoute'
import Payments from "./pages/Payments"
import Purchases from "./pages/Purchases"
import Vendors from "./pages/Vendors"
import Inventory from "./pages/Inventory"
import Banking from "./pages/Banking"
import GST from "./pages/GST"
import Activity from "./pages/Activity"
import Profile from "./pages/Profile"

export default function App() {
  return (
    <BrowserRouter>
    <Toaster
  position="top-right"
  toastOptions={{
    duration: 2500,
  }}
/>

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/income"
              element={<Income />}
            />

            <Route
              path="/expenses"
              element={<Expense />}
            />

            <Route
              path="/invoices"
              element={<Invoices />}
            />
            <Route
  path="/products"
  element={<Products />}
/>
<Route
    path="/customers"
    element={<Customers />}
  />

            <Route
              path="/tools"
              element={<Tools />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
  path="/reports"
  element={<Reports />}
/>
<Route
  path="/customers"
  element={<Customers />}
/>
<Route
  path="/payments"
  element={<Payments />}
/>

<Route
  path="/purchases"
  element={<Purchases />}
/>

<Route
  path="/vendors"
  element={<Vendors />}
/>

<Route
  path="/inventory"
  element={<Inventory />}
/>

<Route
  path="/banking"
  element={<Banking />}
/>

<Route
  path="/gst"
  element={<GST />}
/>

<Route
  path="/activity"
  element={<Activity />}
/>
<Route
  path="/profile"
  element={<Profile />}
/>

<Route
  path="/customers/:customerId"
  element={<CustomerDetails />}
/>
<Route
  path="/analytics"
  element={<Analytics />}
/>
<Route
  path="/orders"
  element={<Orders />}
/>
          </Route>

        </Route>


        {/* =========================
            DEFAULT ROUTE
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =========================
            404 ROUTE
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  )
}