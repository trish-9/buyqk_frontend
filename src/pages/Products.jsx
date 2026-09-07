import { useEffect, useMemo, useState } from 'react'

import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Boxes,
  AlertTriangle,
  IndianRupee,
  RefreshCw,
} from 'lucide-react'

import toast from 'react-hot-toast'

const API_BASE = 'http://localhost:5000/api/products'

export default function Products() {

  // =========================================
  // AUTH / USER
  // =========================================

  const em = localStorage.getItem("userEmail")
  const token = localStorage.getItem("token")

  // =========================================
  // PRODUCTS DATA (from backend)
  // =========================================

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================
  // SEARCH
  // =========================================

  const [search, setSearch] =
    useState('')

  // =========================================
  // CATEGORY FILTER
  // =========================================

  const [categoryFilter, setCategoryFilter] =
    useState('All')

  // =========================================
  // MODAL
  // =========================================

  const [showModal, setShowModal] =
    useState(false)

  // =========================================
  // EDITING
  // =========================================

  const [editingId, setEditingId] =
    useState(null)

  const [submitting, setSubmitting] =
    useState(false)

  // =========================================
  // STOCK MODAL
  // =========================================

  const [stockProduct, setStockProduct] =
    useState(null)

  const [stockQuantity, setStockQuantity] =
    useState('')

  const [stockReason, setStockReason] =
    useState('Stock adjustment')

  const [stockSubmitting, setStockSubmitting] =
    useState(false)

  // =========================================
  // FORM
  // =========================================

  const emptyForm = {
    name: '',
    sku: '',
    hsnSac: '',
    category: '',
    unit: 'Piece',
    purchasePrice: '',
    sellingPrice: '',
    gstRate: '18',
    currentStock: '',
    reorderPoint: '',
  }

  const [form, setForm] =
    useState(emptyForm)

  // =========================================
  // FETCH PRODUCTS (on mount)
  // =========================================

  const fetchProducts = async () => {

    setLoading(true)
    setError('')

    try {

      const res = await fetch("http://localhost:5000/api/product/add/get", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization" : `${token}`,

        },
        body: JSON.stringify({ em: em }),
      })

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const result = await res.json()
      console.log(result)

      const rows = Array.isArray(result)
        ? result
        : result?.products || []

      // Backend field names -> frontend field names
      const data = rows.map((row) => ({
        id: row.id,
        name: row.product_name,
        sku: row.sku,
        hsnSac: row.hsn,
        category: row.categ,
        unit: row.unit,
        purchasePrice: row.purc_price,
        sellingPrice: row.seeling_price,
        gstRate: row.gstin,
        currentStock: row.cur_s,
        reorderPoint: row.reo_point,
        lastStockReason: row.last_reason,
      }))

      setProducts(data)

    } catch (err) {

      console.error(err)
      setError('Failed to load products.')
      setProducts([])

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // =========================================
  // CATEGORIES
  // =========================================

  const categories = useMemo(() => {

    const values =
      products
        .map(
          (product) =>
            product.category
        )
        .filter(Boolean)

    return [
      ...new Set(values),
    ]

  }, [products])

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts =
    useMemo(() => {

      const searchText =
        search
          .trim()
          .toLowerCase()

      return products.filter(
        (product) => {

          const matchesSearch =
            !searchText ||
            product.name
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            product.sku
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            product.hsnSac
              ?.toLowerCase()
              .includes(
                searchText
              )

          const matchesCategory =
            categoryFilter ===
              'All' ||
            product.category ===
              categoryFilter

          return (
            matchesSearch &&
            matchesCategory
          )
        }
      )

    }, [
      products,
      search,
      categoryFilter,
    ])

  // =========================================
  // DERIVED STATS
  // =========================================

  const totalProducts =
    products.length

  const totalStockUnits = useMemo(() => {

    return products.reduce(
      (total, product) =>
        total + Number(product.currentStock || 0),
      0
    )

  }, [products])

  const lowStockProducts = useMemo(() => {

    return products.filter(
      (product) =>
        Number(product.reorderPoint || 0) > 0 &&
        Number(product.currentStock || 0) <=
          Number(product.reorderPoint || 0)
    )

  }, [products])

  const inventoryPurchaseValue = useMemo(() => {

    return products.reduce(
      (total, product) =>
        total +
        Number(product.purchasePrice || 0) *
          Number(product.currentStock || 0),
      0
    )

  }, [products])

  const inventorySellingValue = useMemo(() => {

    return products.reduce(
      (total, product) =>
        total +
        Number(product.sellingPrice || 0) *
          Number(product.currentStock || 0),
      0
    )

  }, [products])

  // =========================================
  // CURRENCY
  // =========================================

  const formatCurrency = (
    value
  ) => {

    return `₹${Number(
      value || 0
    ).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2,
      }
    )}`

  }

  // =========================================
  // OPEN ADD
  // =========================================

  const openAddModal = () => {

    setEditingId(null)

    setForm(emptyForm)

    setShowModal(true)
  }

  // =========================================
  // OPEN EDIT
  // =========================================

  const openEditModal = (
    product
  ) => {

    setEditingId(
      product.id
    )

    setForm({
      name:
        product.name || '',

      sku:
        product.sku || '',

      hsnSac:
        product.hsnSac || '',

      category:
        product.category || '',

      unit:
        product.unit || 'Piece',

      purchasePrice:
        product.purchasePrice ?? '',

      sellingPrice:
        product.sellingPrice ?? '',

      gstRate:
        product.gstRate ?? 18,

      currentStock:
        product.currentStock ?? '',

      reorderPoint:
        product.reorderPoint ?? '',
    })

    setShowModal(true)
  }

  // =========================================
  // CLOSE MODAL
  // =========================================

  const closeModal = () => {

    setShowModal(false)

    setEditingId(null)

    setForm(emptyForm)
  }

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    )
  }

  // =========================================
  // VALIDATION
  // =========================================

  const validateForm = () => {

    if (!form.name.trim()) {

      toast.error(
        'Please enter product name'
      )

      return false
    }

    if (!form.sku.trim()) {

      toast.error(
        'Please enter SKU'
      )

      return false
    }

    if (
      Number(
        form.purchasePrice
      ) < 0
    ) {

      toast.error(
        'Purchase price cannot be negative'
      )

      return false
    }

    if (
      Number(
        form.sellingPrice
      ) < 0
    ) {

      toast.error(
        'Selling price cannot be negative'
      )

      return false
    }

    if (
      Number(
        form.currentStock
      ) < 0
    ) {

      toast.error(
        'Stock cannot be negative'
      )

      return false
    }

    if (
      Number(
        form.reorderPoint
      ) < 0
    ) {

      toast.error(
        'Reorder point cannot be negative'
      )

      return false
    }

    // Check duplicate SKU
    const duplicateSKU =
      products.find(
        (product) =>
          product.sku
            ?.toLowerCase() ===
            form.sku
              .trim()
              .toLowerCase() &&
          product.id !==
            editingId
      )

    if (duplicateSKU) {

      toast.error(
        'SKU already exists'
      )

      return false
    }

    return true
  }

  // =========================================
  // SUBMIT (Add -> POST, Edit -> POST with id)
  // =========================================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const productData = {

      name:
        form.name.trim(),

      sku:
        form.sku.trim(),

      hsnSac:
        form.hsnSac.trim(),

      category:
        form.category.trim() ||
        'General',

      unit:
        form.unit,

      purchasePrice:
        Number(
          form.purchasePrice || 0
        ),

      sellingPrice:
        Number(
          form.sellingPrice || 0
        ),

      gstRate:
        Number(
          form.gstRate || 0
        ),

      currentStock:
        Number(
          form.currentStock || 0
        ),

      reorderPoint:
        Number(
          form.reorderPoint || 0
        ),
    }

    setSubmitting(true)

    try {

      let res

      if (editingId) {

        // EDIT -> alag API, id ke saath
        res = await fetch(
          "http://localhost:5000/api/product/add/edit",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization" : `${token}`,

            },
            body: JSON.stringify({
              form: productData,
              em: em,
              id: editingId,
            }),
          }
        )

      } else {

        // ADD -> naya product create karne wali API
        res = await fetch(
          "http://localhost:5000/api/product/add",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization" : `${token}`,

            },
            body: JSON.stringify({
              form: productData,
              em: em,
            }),
          }
        )
      }

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      // success ke baad list ko fresh data se refresh karo
      await fetchProducts()

      toast.success(
        editingId
          ? 'Product updated successfully'
          : 'Product added successfully'
      )

      closeModal()

    } catch (err) {

      console.error(err)
      toast.error('Something went wrong while saving product.')

    } finally {

      setSubmitting(false)
    }
  }

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (
    product
  ) => {

    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`
      )

    if (!confirmed) {
      return
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/product/add/edit/delete",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization" : `${token}`,
           
          },
          body: JSON.stringify({
            id: product.id,
            em: em,
          }),
        }
      )

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      await fetchProducts()

      toast.success(
        'Product deleted'
      )

    } catch (err) {

      console.error(err)
      toast.error('Failed to delete product.')
    }
  }

  // =========================================
  // OPEN STOCK MODAL
  // =========================================

  const openStockModal = (
    product
  ) => {

    setStockProduct(product)

    setStockQuantity('')

    setStockReason(
      'Stock adjustment'
    )
  }

  // =========================================
  // CLOSE STOCK MODAL
  // =========================================

  const closeStockModal = () => {

    setStockProduct(null)

    setStockQuantity('')

    setStockReason(
      'Stock adjustment'
    )
  }

  // =========================================
  // UPDATE STOCK
  // =========================================

  const handleStockUpdate = async (
    e
  ) => {

    e.preventDefault()

    const quantity =
      Number(stockQuantity)

    if (
      !Number.isFinite(
        quantity
      ) ||
      quantity === 0
    ) {

      toast.error(
        'Enter a valid stock quantity'
      )

      return
    }

    if (
      quantity < 0 &&
      Math.abs(quantity) >
        Number(
          stockProduct.currentStock ||
            0
        )
    ) {

      toast.error(
        'Stock cannot become negative'
      )

      return
    }

    setStockSubmitting(true)

    try {

      const res = await fetch(
        "http://localhost:5000/api/product/updatestock",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization" : `${token}`,
            
          },
          body: JSON.stringify({
            id: stockProduct.id,
            em: em,
            quantity: quantity,
            reason: stockReason,
          }),
        }
      )

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      await fetchProducts()

      toast.success(
        'Stock updated successfully'
      )

      closeStockModal()

    } catch (err) {

      console.error(err)
      toast.error('Failed to update stock.')

    } finally {

      setStockSubmitting(false)
    }
  }

  // =========================================
  // LOW STOCK CHECK
  // =========================================

  const isLowStock = (
    product
  ) => {

    return (
      Number(
        product.reorderPoint || 0
      ) > 0 &&
      Number(
        product.currentStock || 0
      ) <=
        Number(
          product.reorderPoint || 0
        )
    )
  }

  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="space-y-6">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Products
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage your product catalogue,
            pricing and stock.
          </p>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="buyqk-button flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium"
        >
          <Plus size={18} />

          Add Product
        </button>

      </div>

      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* PRODUCTS */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Total Products
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                {totalProducts}
              </h2>

            </div>

            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">

              <Package
                size={21}
                className="text-orange-500"
              />

            </div>

          </div>

        </div>

        {/* STOCK */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Total Stock Units
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                {totalStockUnits.toLocaleString(
                  'en-IN'
                )}
              </h2>

            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">

              <Boxes
                size={21}
                className="text-blue-500"
              />

            </div>

          </div>

        </div>

        {/* LOW STOCK */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Low Stock
              </p>

              <h2 className="text-2xl font-bold text-red-600 mt-2">
                {lowStockProducts.length}
              </h2>

            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">

              <AlertTriangle
                size={21}
                className="text-red-500"
              />

            </div>

          </div>

        </div>

        {/* INVENTORY VALUE */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Inventory Value
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(
                  inventoryPurchaseValue
                )}
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Purchase value
              </p>

            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">

              <IndianRupee
                size={21}
                className="text-green-600"
              />

            </div>

          </div>

        </div>

      </div>

      {/* =====================================
          SEARCH / FILTER
      ===================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 p-4">

        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search product, SKU or HSN/SAC..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
            />

          </div>

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-orange-400"
          >

            <option value="All">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {/* =====================================
          LOW STOCK ALERT
      ===================================== */}

      {lowStockProducts.length >
        0 && (

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">

          <div className="flex items-start gap-3">

            <AlertTriangle
              size={20}
              className="text-red-500 mt-0.5"
            />

            <div>

              <p className="font-semibold text-red-700">
                Low Stock Alert
              </p>

              <p className="text-sm text-red-600 mt-1">

                {lowStockProducts
                  .slice(0, 5)
                  .map(
                    (product) =>
                      `${product.name} (${product.currentStock} ${product.unit})`
                  )
                  .join(', ')}

                {lowStockProducts.length >
                  5 &&
                  ` and ${lowStockProducts.length - 5} more.`}

              </p>

            </div>

          </div>

        </div>

      )}

      {/* =====================================
          PRODUCT TABLE
      ===================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1180px]">

            <thead className="bg-slate-50">

              <tr>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  ID
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Product
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  SKU
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  HSN/SAC
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Category
                </th>

                <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Purchase
                </th>

                <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Selling
                </th>

                <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  GST
                </th>

                <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Stock
                </th>

                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Last Reason
                </th>

                <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (

                <tr>

                  <td
                    colSpan="11"
                    className="px-5 py-16 text-center text-slate-500"
                  >
                    Loading products...
                  </td>

                </tr>

              ) : error ? (

                <tr>

                  <td
                    colSpan="11"
                    className="px-5 py-16 text-center text-red-600"
                  >
                    {error}
                  </td>

                </tr>

              ) : filteredProducts.length ===
                0 ? (

                <tr>

                  <td
                    colSpan="11"
                    className="px-5 py-16 text-center"
                  >

                    <Package
                      size={42}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-slate-600 font-medium mt-4">
                      No products found
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      Add your first product
                      to start managing inventory.
                    </p>

                    <button
                      type="button"
                      onClick={openAddModal}
                      className="buyqk-button inline-flex items-center gap-2 px-4 py-2.5 rounded-xl mt-5 text-sm font-medium"
                    >

                      <Plus size={16} />

                      Add Product

                    </button>

                  </td>

                </tr>

              ) : (

                filteredProducts.map(
                  (product) => (

                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 transition"
                    >

                      {/* ID */}

                      <td className="px-5 py-4 text-sm font-medium text-slate-500">
                        #{product.id}
                      </td>

                      {/* PRODUCT */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">

                            <Package
                              size={18}
                              className="text-orange-500"
                            />

                          </div>

                          <div>

                            <p className="font-medium text-slate-800">
                              {product.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {product.unit}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* SKU */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {product.sku}
                      </td>

                      {/* HSN */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {product.hsnSac ||
                          '-'}
                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4">

                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                          {product.category}
                        </span>

                      </td>

                      {/* PURCHASE */}

                      <td className="px-5 py-4 text-right text-sm text-slate-700">
                        {formatCurrency(
                          product.purchasePrice
                        )}
                      </td>

                      {/* SELLING */}

                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                        {formatCurrency(
                          product.sellingPrice
                        )}
                      </td>

                      {/* GST */}

                      <td className="px-5 py-4 text-center text-sm text-slate-600">
                        {product.gstRate}%
                      </td>

                      {/* STOCK */}

                      <td className="px-5 py-4 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            openStockModal(
                              product
                            )
                          }
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            isLowStock(
                              product
                            )
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                          title="Adjust stock"
                        >

                          {isLowStock(
                            product
                          ) && (
                            <AlertTriangle
                              size={13}
                            />
                          )}

                          {product.currentStock}

                        </button>

                        {product.reorderPoint >
                          0 && (

                          <p className="text-[10px] text-slate-400 mt-1">
                            Reorder:{" "}
                            {
                              product.reorderPoint
                            }
                          </p>

                        )}

                      </td>

                      {/* LAST REASON */}

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {product.lastStockReason || '-'}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openStockModal(
                                product
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                            title="Adjust stock"
                          >

                            <RefreshCw
                              size={16}
                            />

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                product
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100"
                            title="Edit"
                          >

                            <Pencil
                              size={16}
                            />

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                            title="Delete"
                          >

                            <Trash2
                              size={16}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================
          ADD / EDIT PRODUCT MODAL
      ===================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">

          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">

              <div>

                <h2 className="text-xl font-bold text-slate-900">

                  {editingId
                    ? 'Edit Product'
                    : 'Add Product'}

                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Enter product and inventory details.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >

                <X size={18} />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* PRODUCT NAME */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Product Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Example: A4 Notebook"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

                {/* SKU */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    SKU *
                  </label>

                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="Example: NB-A4-001"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

                {/* HSN */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    HSN / SAC
                  </label>

                  <input
                    name="hsnSac"
                    value={form.hsnSac}
                    onChange={handleChange}
                    placeholder="Example: 4820"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>

                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Example: Stationery"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

                {/* UNIT */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit
                  </label>

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-orange-400"
                  >

                    <option value="Piece">
                      Piece
                    </option>

                    <option value="Box">
                      Box
                    </option>

                    <option value="Kg">
                      Kg
                    </option>

                    <option value="Gram">
                      Gram
                    </option>

                    <option value="Litre">
                      Litre
                    </option>

                    <option value="Meter">
                      Meter
                    </option>

                    <option value="Dozen">
                      Dozen
                    </option>

                  </select>

                </div>

                {/* PURCHASE PRICE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purchase Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="purchasePrice"
                    value={
                      form.purchasePrice
                    }
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

                {/* SELLING PRICE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Selling Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="sellingPrice"
                    value={
                      form.sellingPrice
                    }
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

                {/* GST */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    GST Rate
                  </label>

                  <select
                    name="gstRate"
                    value={form.gstRate}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-orange-400"
                  >

                    <option value="0">
                      0%
                    </option>

                    <option value="5">
                      5%
                    </option>

                    <option value="12">
                      12%
                    </option>

                    <option value="18">
                      18%
                    </option>

                    <option value="28">
                      28%
                    </option>

                  </select>

                </div>

                {/* CURRENT STOCK */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="currentStock"
                    value={
                      form.currentStock
                    }
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                </div>

                {/* REORDER POINT */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reorder Point
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="reorderPoint"
                    value={
                      form.reorderPoint
                    }
                    onChange={handleChange}
                    placeholder="Example: 10"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                  />

                  <p className="text-xs text-slate-400 mt-1">
                    You will receive a low-stock
                    notification at this level.
                  </p>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="buyqk-button px-5 py-2.5 rounded-xl font-medium disabled:opacity-60"
                >

                  {submitting
                    ? 'Saving...'
                    : editingId
                    ? 'Update Product'
                    : 'Add Product'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================
          STOCK ADJUSTMENT MODAL
      ===================================== */}

      {stockProduct && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">

            {/* HEADER */}

            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Adjust Stock
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {stockProduct.name}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeStockModal
                }
                className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"
              >

                <X size={18} />

              </button>

            </div>

            <form
              onSubmit={
                handleStockUpdate
              }
              className="p-6 space-y-5"
            >

              {/* CURRENT STOCK */}

              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Current Stock
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">

                  {
                    stockProduct.currentStock
                  }{" "}

                  <span className="text-sm font-normal text-slate-500">
                    {stockProduct.unit}
                  </span>

                </p>

              </div>

              {/* QUANTITY */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>

                <input
                  type="number"
                  step="1"
                  value={stockQuantity}
                  onChange={(e) =>
                    setStockQuantity(
                      e.target.value
                    )
                  }
                  placeholder="+10 or -5"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                />

                <p className="text-xs text-slate-400 mt-1">
                  Use positive number to add stock
                  and negative number to remove stock.
                </p>

              </div>

              {/* REASON */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason
                </label>

                <select
                  value={stockReason}
                  onChange={(e) =>
                    setStockReason(
                      e.target.value
                    )
                  }
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-orange-400"
                >

                  <option>
                    Stock adjustment
                  </option>

                  <option>
                    New purchase
                  </option>

                  <option>
                    Damaged stock
                  </option>

                  <option>
                    Expired stock
                  </option>

                  <option>
                    Stock count correction
                  </option>

                  <option>
                    Return
                  </option>

                </select>

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={
                    closeStockModal
                  }
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={stockSubmitting}
                  className="buyqk-button px-5 py-2.5 rounded-xl font-medium disabled:opacity-60"
                >
                  {stockSubmitting ? 'Updating...' : 'Update Stock'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}