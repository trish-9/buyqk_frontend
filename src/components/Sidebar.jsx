import { useState } from 'react'

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
  Truck,
  BarChart3,
  Settings,
  Store,
  HelpCircle,
  Mail,
  MessageCircle,
  X,
  ReceiptText,
  Landmark,
  Warehouse,
  Calculator,
  Activity,
} from 'lucide-react'

const menuItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },

  {
    label: 'Orders',
    path: '/orders',
    icon: ShoppingBag,
  },

  {
    label: 'Products',
    path: '/products',
    icon: Package,
  },

  {
    label: 'Customers',
    path: '/customers',
    icon: Users,
  },

  {
    label: 'Income',
    path: '/income',
    icon: TrendingUp,
  },

  {
    label: 'Expenses',
    path: '/expenses',
    icon: TrendingDown,
  },

  {
    label: 'Invoices',
    path: '/invoices',
    icon: FileText,
  },

  {
    label: 'Payments',
    path: '/payments',
    icon: CreditCard,
  },

  // NEW
  {
    label: 'Purchases',
    path: '/purchases',
    icon: ReceiptText,
  },

  // NEW
  {
    label: 'Vendors',
    path: '/vendors',
    icon: Truck,
  },

  // NEW
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Warehouse,
  },

  // NEW
  {
    label: 'Banking',
    path: '/banking',
    icon: Landmark,
  },

  // NEW
  {
    label: 'GST / Taxes',
    path: '/gst',
    icon: Calculator,
  },

  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
  },

  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },

  // NEW
  {
    label: 'Activity',
    path: '/activity',
    icon: Activity,
  },
]

const configurationItems = [
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },

  {
    label: 'My Store',
    path: '/store',
    icon: Store,
  },
]

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen = () => {},
}) {
  const [showHelp, setShowHelp] = useState(false)

  const currentPath = window.location.pathname

  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/'
    }

    return currentPath.startsWith(path)
  }

  const handleNavigation = (path) => {
    setMobileOpen(false)

    window.history.pushState({}, '', path)

    window.dispatchEvent(
      new PopStateEvent('popstate')
    )
  }

  const handleEmailSupport = () => {
    const subject = 'Accounting Dashboard Support'
    const body = `Hello,\n\nI need help with my Accounting Dashboard.\n\nPlease assist me.\n\nThank you.`

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setShowHelp(false)
  }

  const handleWhatsAppSupport = () => {
    const message = 'Hello, I need help with my Accounting Dashboard. Please assist me.'

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    )
    setShowHelp(false)
  }

  const MenuItem = ({ item }) => {
    const Icon = item.icon
    const active = isActive(item.path)

    return (
      <button
        type="button"
        onClick={() => handleNavigation(item.path)}
        className={`
          w-full
          flex
          items-center
          gap-3
          px-4
          py-2.5
          rounded-xl
          text-left
          transition-all
          duration-200
          group

          ${
            active
              ? 'bg-orange-50 text-orange-600 border-l-2 border-orange-500'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }
        `}
      >
        <Icon
          size={19}
          strokeWidth={active ? 2.3 : 2}
          className={`
            flex-shrink-0

            ${
              active
                ? 'text-orange-500'
                : 'text-slate-500 group-hover:text-slate-700'
            }
          `}
        />

        <span
          className={`
            text-sm
            font-medium

            ${active ? 'font-semibold' : ''}
          `}
        >
          {item.label}
        </span>

        {/* INVOICE COUNT */}
        {item.label === 'Invoices' && (
          <span
            className={`
              ml-auto
              min-w-5
              h-5
              px-1.5
              rounded-full
              flex
              items-center
              justify-center
              text-[11px]
              font-bold

              ${
                active
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 text-orange-600'
              }
            `}
          >
            5
          </span>
        )}

        {/* LOW STOCK INDICATOR */}
        {item.label === 'Inventory' && (
          <span
            className="
              ml-auto
              min-w-5
              h-5
              px-1.5
              rounded-full
              flex
              items-center
              justify-center
              text-[11px]
              font-bold
              bg-red-100
              text-red-600
            "
          >
            3
          </span>
        )}
      </button>
    )
  }

  return (
    <>
      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            bg-black/30
            z-40
            lg:hidden
          "
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          top-0
          left-0
          bottom-0
          z-50
          w-[260px]
          bg-white
          border-r
          border-slate-200
          flex
          flex-col
          transition-transform
          duration-300
          lg:translate-x-0

          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >

        {/* BRAND */}

        <div
          className="
            px-5
            py-5
            border-b
            border-slate-100
          "
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              {/* LOGO */}

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-orange-500
                  flex
                  items-center
                  justify-center
                  shadow-sm
                "
              >
                <ShoppingBag
                  size={24}
                  className="text-white"
                  strokeWidth={2.3}
                />
              </div>

              {/* BRAND NAME */}

              <div>

                <h1
                  className="
                    text-2xl
                    leading-none
                    font-extrabold
                    tracking-tight
                    text-slate-900
                  "
                >
                  Buy
                  <span className="text-orange-500">
                    QK
                  </span>
                </h1>

                <p
                  className="
                    text-[10px]
                    text-slate-400
                    mt-1
                  "
                >
                  Local. Quick. Reliable.
                </p>

              </div>

            </div>

            {/* MOBILE CLOSE */}

            <button
              type="button"
              onClick={() =>
                setMobileOpen(false)
              }
              className="
                lg:hidden
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
                hover:bg-slate-100
              "
            >
              <X size={19} />
            </button>

          </div>
        </div>

        {/* MERCHANT CARD */}

        <div className="px-4 py-4">

          <div
            className="
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              bg-white
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-full
                bg-orange-500
                flex
                items-center
                justify-center
              "
            >
              <Store
                size={20}
                className="text-white"
              />
            </div>

            <div className="min-w-0">

              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                  truncate
                "
              >
                Mehta Enterprises
              </p>

              <p
                className="
                  text-[11px]
                  text-slate-400
                "
              >
                Merchant ID: BQK-27845
              </p>

              <span
                className="
                  inline-flex
                  mt-1
                  px-2
                  py-0.5
                  rounded-full
                  bg-green-50
                  text-green-600
                  text-[10px]
                  font-semibold
                "
              >
                Verified Merchant
              </span>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            pb-4
            scrollbar-thin
          "
        >

          {/* MAIN MENU */}

          <p
            className="
              px-3
              mb-2
              text-[10px]
              uppercase
              tracking-wider
              font-bold
              text-slate-400
            "
          >
            Main Menu
          </p>

          <nav className="space-y-1">

            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                item={item}
              />
            ))}

          </nav>

          {/* CONFIGURATION */}

          <div className="mt-7">

            <p
              className="
                px-3
                mb-2
                text-[10px]
                uppercase
                tracking-wider
                font-bold
                text-slate-400
              "
            >
              Configuration
            </p>

            <nav className="space-y-1">

              {configurationItems.map(
                (item) => (
                  <MenuItem
                    key={item.label}
                    item={item}
                  />
                )
              )}

            </nav>

          </div>

        </div>

        {/* HELP */}

        <div
          className="
            p-4
            border-t
            border-slate-100
          "
        >

          <button
            type="button"
            onClick={() => setShowHelp(true)}
            aria-label="Open Help and Support"
            className="
              w-full
              text-left
              rounded-xl
              bg-orange-50
              p-3.5
              hover:bg-orange-100
              transition-all
              duration-200
              cursor-pointer
              group
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-orange-100
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                "
              >
                <HelpCircle
                  size={19}
                  className="text-orange-500"
                />
              </div>

              <div className="flex-1">

                <p
                  className="
                    text-xs
                    font-semibold
                    text-orange-700
                  "
                >
                  Need Help?
                </p>

                <p
                  className="
                    text-[11px]
                    text-slate-500
                    mt-0.5
                  "
                >
                  Our support team is here
                  24/7 for you.
                </p>

              </div>

              <span
                className="
                  text-orange-500
                  text-lg
                "
              >
                ›
              </span>

            </div>

          </button>

        </div>

      </aside>

      {/* HELP & SUPPORT MODAL */}
      {showHelp && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                  <HelpCircle size={24} className="text-orange-500" />
                </div>
                <div>
                  <h2 id="help-title" className="text-lg font-bold text-slate-900">
                    Help &amp; Support
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We&apos;re here to help you
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                aria-label="Close Help and Support"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-5">
                Need assistance with your Accounting Dashboard? Choose an option below.
              </p>

              <button
                type="button"
                onClick={handleEmailSupport}
                className="w-full flex items-center gap-4 p-4 mb-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Mail size={21} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Email Support</p>
                  <p className="text-xs text-slate-500 mt-1">Open your email app</p>
                </div>
                <span className="text-slate-400 text-lg">›</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppSupport}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                  <MessageCircle size={21} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">WhatsApp Support</p>
                  <p className="text-xs text-slate-500 mt-1">Open WhatsApp</p>
                </div>
                <span className="text-slate-400 text-lg">›</span>
              </button>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Our support team is available 24/7
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}