import { useMemo, useState } from "react"
import {
  Boxes,
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react"

import { useFinance } from "../context/FinanceContext"

export default function Inventory() {
  const {
    products = [],
    totalProducts = 0,
    totalStockUnits = 0,
    lowStockProducts = [],
    inventoryPurchaseValue = 0,
    inventorySellingValue = 0,
    adjustStock,
  } = useFinance()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [quantities, setQuantities] = useState({})

  /*
  ==========================================
  SEARCH + FILTER
  ==========================================
  */

  const filteredProducts = useMemo(() => {
    const searchText =
      search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !searchText ||
        [
          product.name,
          product.sku,
          product.category,
          product.hsnSac,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchText)
          )

      const stock =
        Number(product.currentStock || 0)

      const reorder =
        Number(product.reorderPoint || 0)

      let matchesFilter = true

      if (filter === "low") {
        matchesFilter =
          reorder > 0 &&
          stock <= reorder &&
          stock > 0
      }

      if (filter === "out") {
        matchesFilter = stock <= 0
      }

      if (filter === "healthy") {
        matchesFilter =
          stock > 0 &&
          (reorder <= 0 ||
            stock > reorder)
      }

      return (
        matchesSearch &&
        matchesFilter
      )
    })
  }, [
    products,
    search,
    filter,
  ])

  /*
  ==========================================
  QUANTITY
  ==========================================
  */

  const getQuantity = (id) => {
    const value = quantities[id]

    if (
      value === undefined ||
      value === ""
    ) {
      return 1
    }

    const number = Number(value)

    if (
      !Number.isFinite(number) ||
      number <= 0
    ) {
      return 1
    }

    return number
  }

  /*
  ==========================================
  RECEIVE STOCK
  ==========================================
  */

  const handleReceive = (product) => {
    const quantity =
      getQuantity(product.id)

    adjustStock(
      product.id,
      quantity,
      "Stock received"
    )

    setQuantities((current) => ({
      ...current,
      [product.id]: "",
    }))
  }

  /*
  ==========================================
  ISSUE STOCK
  ==========================================
  */

  const handleIssue = (product) => {
    const quantity =
      getQuantity(product.id)

    const currentStock =
      Number(
        product.currentStock || 0
      )

    if (quantity > currentStock) {
      window.alert(
        `Only ${currentStock} ${product.unit || "units"} available.`
      )

      return
    }

    adjustStock(
      product.id,
      -quantity,
      "Stock issued"
    )

    setQuantities((current) => ({
      ...current,
      [product.id]: "",
    }))
  }

  /*
  ==========================================
  STOCK STATUS
  ==========================================
  */

  const getStockStatus = (product) => {
    const stock =
      Number(product.currentStock || 0)

    const reorder =
      Number(product.reorderPoint || 0)

    if (stock <= 0) {
      return {
        label: "Out of stock",
        className:
          "bg-red-50 text-red-700",
      }
    }

    if (
      reorder > 0 &&
      stock <= reorder
    ) {
      return {
        label: "Low stock",
        className:
          "bg-amber-50 text-amber-700",
      }
    }

    return {
      label: "Healthy",
      className:
        "bg-green-50 text-green-700",
    }
  }

  /*
  ==========================================
  MONEY
  ==========================================
  */

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`

  return (
    <div className="space-y-6">

      {/* ==================================
          HEADER
      ================================== */}

      <div>
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
            <Boxes
              size={22}
              className="text-orange-500"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Inventory
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track stock levels, inventory value
              and stock movements.
            </p>
          </div>

        </div>
      </div>

      {/* ==================================
          SUMMARY CARDS
      ================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <SummaryCard
          icon={<Package size={20} />}
          title="Products"
          value={totalProducts}
        />

        <SummaryCard
          icon={<Boxes size={20} />}
          title="Stock Units"
          value={totalStockUnits}
        />

        <SummaryCard
          icon={<AlertTriangle size={20} />}
          title="Low Stock"
          value={lowStockProducts.length}
        />

        <SummaryCard
          icon={<TrendingDown size={20} />}
          title="Purchase Value"
          value={money(
            inventoryPurchaseValue
          )}
        />

        <SummaryCard
          icon={<TrendingUp size={20} />}
          title="Selling Value"
          value={money(
            inventorySellingValue
          )}
        />

      </div>

      {/* ==================================
          INVENTORY TABLE
      ================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* TOOLBAR */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search product, SKU, category..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-4
                text-sm
                outline-none
                focus:border-orange-400
                focus:bg-white
                focus:ring-4
                focus:ring-orange-100
              "
            />

          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap gap-2">

            <FilterButton
              active={filter === "all"}
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </FilterButton>

            <FilterButton
              active={filter === "low"}
              onClick={() =>
                setFilter("low")
              }
            >
              Low Stock
            </FilterButton>

            <FilterButton
              active={filter === "out"}
              onClick={() =>
                setFilter("out")
              }
            >
              Out of Stock
            </FilterButton>

            <FilterButton
              active={filter === "healthy"}
              onClick={() =>
                setFilter("healthy")
              }
            >
              Healthy
            </FilterButton>

          </div>

        </div>

        {/* TABLE */}

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">

            <Package
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <h3 className="font-semibold text-slate-700">
              No products found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Try another search or add products
              from the Products page.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Reorder
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Value
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Adjust Stock
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => {
                    const status =
                      getStockStatus(
                        product
                      )

                    const stock =
                      Number(
                        product.currentStock ||
                          0
                      )

                    const sellingPrice =
                      Number(
                        product.sellingPrice ||
                          0
                      )

                    const stockValue =
                      stock *
                      sellingPrice

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        {/* PRODUCT */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-800">
                            {product.name ||
                              "Unnamed Product"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {product.unit ||
                              "units"}
                          </p>

                        </td>

                        {/* SKU */}

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {product.sku ||
                            "—"}
                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {product.category ||
                            "—"}
                        </td>

                        {/* STOCK */}

                        <td className="px-5 py-4 text-right">

                          <span className="text-lg font-bold text-slate-800">
                            {stock}
                          </span>

                        </td>

                        {/* REORDER */}

                        <td className="px-5 py-4 text-right text-sm text-slate-600">
                          {Number(
                            product.reorderPoint ||
                              0
                          )}
                        </td>

                        {/* VALUE */}

                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
                          {money(
                            stockValue
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4 text-center">

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-semibold
                              ${status.className}
                            `}
                          >
                            {status.label}
                          </span>

                        </td>

                        {/* ADJUST */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <input
                              type="number"
                              min="1"
                              value={
                                quantities[
                                  product.id
                                ] ?? ""
                              }
                              onChange={(
                                event
                              ) =>
                                setQuantities(
                                  (current) => ({
                                    ...current,
                                    [product.id]:
                                      event.target
                                        .value,
                                  })
                                )
                              }
                              placeholder="Qty"
                              className="
                                h-9
                                w-20
                                rounded-lg
                                border
                                border-slate-200
                                px-2
                                text-sm
                                outline-none
                                focus:border-orange-400
                              "
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handleReceive(
                                  product
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                items-center
                                gap-1
                                rounded-lg
                                bg-green-50
                                px-3
                                text-xs
                                font-semibold
                                text-green-700
                                hover:bg-green-100
                              "
                              title="Receive stock"
                            >
                              <Plus size={14} />
                              Receive
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleIssue(
                                  product
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                items-center
                                gap-1
                                rounded-lg
                                bg-red-50
                                px-3
                                text-xs
                                font-semibold
                                text-red-700
                                hover:bg-red-100
                              "
                              title="Issue stock"
                            >
                              <Minus size={14} />
                              Issue
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==================================
          INVENTORY INFORMATION
      ================================== */}

      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">

        <div className="flex items-start gap-3">

          <RefreshCw
            size={20}
            className="mt-0.5 text-orange-500"
          />

          <div>

            <h3 className="font-semibold text-orange-900">
              Inventory Activity
            </h3>

            <p className="mt-1 text-sm text-orange-800">
              Every stock receive and issue action
              is automatically recorded in the
              Activity page.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

/*
==========================================
SUMMARY CARD
==========================================
*/

function SummaryCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          {icon}
        </div>

      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}

/*
==========================================
FILTER BUTTON
==========================================
*/

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg
        px-3
        py-2
        text-xs
        font-semibold
        transition
        ${
          active
            ? "bg-orange-500 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }
      `}
    >
      {children}
    </button>
  )
}