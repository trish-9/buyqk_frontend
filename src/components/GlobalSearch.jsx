import { useEffect, useRef, useState } from "react"
import {
  Search,
  X,
  User,
  Package,
  FileText,
  Store,
  Wallet,
  Receipt,
  BarChart3,
  CreditCard,
  ShoppingCart,
  Boxes,
  Activity,
  Landmark,
  FileBarChart,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useFinance } from "../context/FinanceContext"

export default function GlobalSearch() {
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const {
    customers = [],
    products = [],
    invoices = [],
    vendors = [],
    incomes = [],
    expenses = [],
    notifications = [],
  } = useFinance()

  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  /*
  ==========================================
  KEYBOARD SHORTCUT
  Ctrl + K
  ==========================================
  */

  useEffect(() => {
    const handleShortcut = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault()

        inputRef.current?.focus()
        setOpen(true)
      }

      if (event.key === "Escape") {
        setOpen(false)
        inputRef.current?.blur()
      }
    }

    window.addEventListener(
      "keydown",
      handleShortcut
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut
      )
    }
  }, [])

  /*
  ==========================================
  SEARCH TEXT
  ==========================================
  */

  const searchText =
    query.trim().toLowerCase()

  /*
  ==========================================
  CUSTOMER SEARCH
  ==========================================
  */

  const customerResults =
    searchText
      ? customers.filter((customer) =>
          [
            customer.name,
            customer.email,
            customer.phone,
            customer.gstin,
            customer.address,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(searchText)
            )
        )
      : []

  /*
  ==========================================
  PRODUCT SEARCH
  ==========================================
  */

  const productResults =
    searchText
      ? products.filter((product) =>
          [
            product.name,
            product.sku,
            product.hsnSac,
            product.category,
            product.unit,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(searchText)
            )
        )
      : []

  /*
  ==========================================
  INVOICE SEARCH
  ==========================================
  */

  const invoiceResults =
    searchText
      ? invoices.filter((invoice) =>
          [
            invoice.invoiceNumber,
            invoice.customerName,
            invoice.customer,
            invoice.status,
            invoice.paymentStatus,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(searchText)
            )
        )
      : []

  /*
  ==========================================
  VENDOR SEARCH
  ==========================================
  */

  const vendorResults =
    searchText
      ? vendors.filter((vendor) =>
          [
            vendor.name,
            vendor.email,
            vendor.phone,
            vendor.gstin,
            vendor.address,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(searchText)
            )
        )
      : []

  /*
  ==========================================
  INCOME SEARCH
  ==========================================
  */

  const incomeResults =
    searchText
      ? incomes.filter((income) =>
          [
            income.category,
            income.description,
            income.source,
            income.note,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(searchText)
            )
        )
      : []

  /*
  ==========================================
  EXPENSE SEARCH
  ==========================================
  */

  const expenseResults =
    searchText
      ? expenses.filter((expense) =>
          [
            expense.category,
            expense.description,
            expense.vendor,
            expense.note,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(searchText)
            )
        )
      : []

  /*
  ==========================================
  ACTIVITY SEARCH
  ==========================================
  */

  const activityResults =
    searchText
      ? notifications.filter((notification) =>
          [
            notification.title,
            notification.message,
            notification.type,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(searchText)
            )
        )
      : []

  /*
  ==========================================
  QUICK PAGE SEARCH
  ==========================================
  */

  const pages = [
    {
      name: "Dashboard",
      keywords: "dashboard home overview",
      path: "/dashboard",
      icon: <BarChart3 size={16} />,
    },
    {
      name: "Income",
      keywords: "income revenue sales money received",
      path: "/income",
      icon: <Wallet size={16} />,
    },
    {
      name: "Expenses",
      keywords: "expense expenses spending costs",
      path: "/expenses",
      icon: <Receipt size={16} />,
    },
    {
      name: "Invoices",
      keywords: "invoice invoices billing bill",
      path: "/invoices",
      icon: <FileText size={16} />,
    },
    {
      name: "Customers",
      keywords: "customer customers clients",
      path: "/customers",
      icon: <User size={16} />,
    },
    {
      name: "Products",
      keywords: "product products items catalogue",
      path: "/products",
      icon: <Package size={16} />,
    },
    {
      name: "Inventory",
      keywords: "inventory stock warehouse items",
      path: "/inventory",
      icon: <Boxes size={16} />,
    },
    {
      name: "Vendors",
      keywords: "vendor vendors suppliers",
      path: "/vendors",
      icon: <Store size={16} />,
    },
    {
      name: "Payments",
      keywords: "payment payments collection paid",
      path: "/payments",
      icon: <CreditCard size={16} />,
    },
    {
      name: "Purchases",
      keywords: "purchase purchases buying",
      path: "/purchases",
      icon: <ShoppingCart size={16} />,
    },
    {
      name: "Banking",
      keywords: "bank banking account bank account",
      path: "/banking",
      icon: <Landmark size={16} />,
    },
    {
      name: "GST",
      keywords: "gst tax gst return taxation",
      path: "/gst",
      icon: <FileBarChart size={16} />,
    },
    {
      name: "Reports",
      keywords: "report reports financial report",
      path: "/reports",
      icon: <BarChart3 size={16} />,
    },
    {
      name: "Analytics",
      keywords: "analytics analysis business analytics",
      path: "/analytics",
      icon: <BarChart3 size={16} />,
    },
    {
      name: "Activity",
      keywords: "activity history notifications recent",
      path: "/activity",
      icon: <Activity size={16} />,
    },
    {
      name: "Settings",
      keywords: "settings configuration preferences",
      path: "/settings",
      icon: <Store size={16} />,
    },
  ]

  const pageResults =
    searchText
      ? pages.filter((page) =>
          `${page.name} ${page.keywords}`
            .toLowerCase()
            .includes(searchText)
        )
      : []

  /*
  ==========================================
  TOTAL RESULTS
  ==========================================
  */

  const totalResults =
    customerResults.length +
    productResults.length +
    invoiceResults.length +
    vendorResults.length +
    incomeResults.length +
    expenseResults.length +
    activityResults.length +
    pageResults.length

  /*
  ==========================================
  OPEN RESULT
  ==========================================
  */

  const openResult = (path) => {
    setQuery("")
    setOpen(false)

    navigate(path)
  }

  /*
  ==========================================
  FORMAT AMOUNT
  ==========================================
  */

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-IN"
    )
  }

  return (
    <div className="relative w-full max-w-[560px]">
      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search customers, invoices, products..."
          className="
            h-11
            w-full
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            pl-11
            pr-20
            text-sm
            outline-none
            transition
            focus:border-orange-400
            focus:bg-white
            focus:ring-4
            focus:ring-orange-100
          "
        />

        {!query && (
          <span
            className="
              absolute
              right-3
              top-1/2
              hidden
              -translate-y-1/2
              rounded-md
              border
              border-slate-200
              bg-white
              px-2
              py-1
              text-[10px]
              font-semibold
              text-slate-400
              md:block
            "
          >
            Ctrl K
          </span>
        )}

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              rounded-lg
              p-1.5
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div
          className="
            absolute
            left-0
            right-0
            top-14
            z-[100]
            max-h-[550px]
            overflow-y-auto
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
          "
        >

          {totalResults === 0 ? (
            <div className="p-8 text-center">

              <Search
                size={30}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-semibold text-slate-700">
                No results found
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Try another search term.
              </p>

            </div>
          ) : (
            <>

              {pageResults.length > 0 && (
                <SearchSection
                  title="Pages"
                  icon={<BarChart3 size={16} />}
                  items={pageResults}
                  renderTitle={(item) =>
                    item.name
                  }
                  renderSubtitle={() =>
                    "Open page"
                  }
                  onClick={(item) =>
                    openResult(item.path)
                  }
                />
              )}

              {customerResults.length > 0 && (
                <SearchSection
                  title="Customers"
                  icon={<User size={16} />}
                  items={customerResults}
                  renderTitle={(item) =>
                    item.name
                  }
                  renderSubtitle={(item) =>
                    item.email ||
                    item.phone ||
                    "Customer"
                  }
                  onClick={(item) =>
                    openResult(
                      `/customers/${item.id}`
                    )
                  }
                />
              )}

              {productResults.length > 0 && (
                <SearchSection
                  title="Products"
                  icon={<Package size={16} />}
                  items={productResults}
                  renderTitle={(item) =>
                    item.name
                  }
                  renderSubtitle={(item) =>
                    item.sku
                      ? `SKU: ${item.sku}`
                      : item.category ||
                        "Product"
                  }
                  onClick={() =>
                    openResult("/products")
                  }
                />
              )}

              {invoiceResults.length > 0 && (
                <SearchSection
                  title="Invoices"
                  icon={<FileText size={16} />}
                  items={invoiceResults}
                  renderTitle={(item) =>
                    item.invoiceNumber ||
                    "Invoice"
                  }
                  renderSubtitle={(item) =>
                    `${
                      item.customerName ||
                      item.customer ||
                      "Customer"
                    } • ₹${formatMoney(
                      item.amount ||
                        item.total ||
                        item.totalAmount
                    )}`
                  }
                  onClick={() =>
                    openResult("/invoices")
                  }
                />
              )}

              {vendorResults.length > 0 && (
                <SearchSection
                  title="Vendors"
                  icon={<Store size={16} />}
                  items={vendorResults}
                  renderTitle={(item) =>
                    item.name
                  }
                  renderSubtitle={(item) =>
                    item.email ||
                    item.phone ||
                    "Vendor"
                  }
                  onClick={() =>
                    openResult("/vendors")
                  }
                />
              )}

              {incomeResults.length > 0 && (
                <SearchSection
                  title="Income"
                  icon={<Wallet size={16} />}
                  items={incomeResults}
                  renderTitle={(item) =>
                    item.description ||
                    item.category ||
                    "Income"
                  }
                  renderSubtitle={(item) =>
                    `₹${formatMoney(
                      item.amount
                    )}`
                  }
                  onClick={() =>
                    openResult("/income")
                  }
                />
              )}

              {expenseResults.length > 0 && (
                <SearchSection
                  title="Expenses"
                  icon={<Receipt size={16} />}
                  items={expenseResults}
                  renderTitle={(item) =>
                    item.description ||
                    item.category ||
                    "Expense"
                  }
                  renderSubtitle={(item) =>
                    `₹${formatMoney(
                      item.amount
                    )}`
                  }
                  onClick={() =>
                    openResult("/expenses")
                  }
                />
              )}

              {activityResults.length > 0 && (
                <SearchSection
                  title="Activity"
                  icon={<Activity size={16} />}
                  items={activityResults}
                  renderTitle={(item) =>
                    item.title
                  }
                  renderSubtitle={(item) =>
                    item.message
                  }
                  onClick={() =>
                    openResult("/activity")
                  }
                />
              )}

            </>
          )}
        </div>
      )}
    </div>
  )
}

/*
==========================================
SEARCH SECTION COMPONENT
==========================================
*/

function SearchSection({
  title,
  icon,
  items,
  renderTitle,
  renderSubtitle,
  onClick,
}) {
  return (
    <div>

      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">

        <span className="text-orange-500">
          {icon}
        </span>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>

      </div>

      {items
        .slice(0, 6)
        .map((item, index) => (
          <button
            key={
              item.id ||
              item.path ||
              `${title}-${index}`
            }
            type="button"
            onClick={() => onClick(item)}
            className="
              flex
              w-full
              items-center
              gap-3
              border-b
              border-slate-100
              px-4
              py-3
              text-left
              transition
              hover:bg-orange-50
            "
          >

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold text-slate-800">
                {renderTitle(item)}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                {renderSubtitle(item)}
              </p>

            </div>

          </button>
        ))}
    </div>
  )
}