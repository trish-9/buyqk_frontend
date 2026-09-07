import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:5000/api/add'
const CUSTOMERS_API = `${API_BASE}`
const em = localStorage.getItem("userEmail");
console.log(em)
const token = localStorage.getItem("token");
export default function Customers() {

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const emptyForm = {
    name: '',
    type: 'Business',
    gstin: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: '',
    openingBalance: '',
  }

  const [form, setForm] = useState(emptyForm)

  // =========================================
  // FETCH CUSTOMERS (on mount)
  // =========================================

  const fetchCustomers = async () => {

    setLoading(true)
    setError('')

    try {

      const res = await fetch("http://localhost:5000/api/add/get",{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization" : `${token}`,
            },
            body: JSON.stringify({em:em}),
          })
    
      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const result = await res.json()
      console.log(result)

      const rows = Array.isArray(result)
        ? result
        : result?.customers || []

      const data = rows.map((row) => ({
        ...row,
        address: row.add,
        creditLimit: row.creditlimit,
        openingBalance: row.openingbalance,
      }))

      setCustomers(data)

    } catch (err) {

      console.error(err)
      setError('Failed to load customers.')
      setCustomers([])

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // =========================================
  // SEARCH
  // =========================================

  const filteredCustomers = useMemo(() => {

    const value = search.toLowerCase().trim()

    if (!value) {
      return customers
    }

    return customers.filter((customer) => {

      return (
        customer.name?.toLowerCase().includes(value) ||
        customer.phone?.toLowerCase().includes(value) ||
        customer.email?.toLowerCase().includes(value) ||
        customer.gstin?.toLowerCase().includes(value)
      )
    })

  }, [customers, search])

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (e) => {

    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // =========================================
  // OPEN ADD FORM
  // =========================================

  const openAddForm = () => {
    setEditingCustomer(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  // =========================================
  // OPEN EDIT FORM
  // =========================================

  const openEditForm = (customer) => {

    setEditingCustomer(customer)

    setForm({
      name: customer.name || '',
      type: customer.type || 'Business',
      gstin: customer.gstin || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      creditLimit: customer.creditLimit || '',
      openingBalance: customer.openingBalance || '',
     
    })

    setShowForm(true)
  }

  // =========================================
  // SUBMIT (Add -> POST, Edit -> PUT with id)
  // =========================================

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!form.name.trim()) {
      alert('Please enter customer name.')
      return
    }

    setSubmitting(true)
    setError('')

    try {

      let res

      if (editingCustomer) {

        // EDIT -> alag API, id ke saath
        res = await fetch(
          "http://localhost:5000/api/add/edit",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization" : `${token}`,
            },
            body: JSON.stringify({form :form,em:em,id: editingCustomer.id}),
          }
        )

      } else {

        // ADD -> naya customer create karne wali API
        const bear = localStorage.getItem("token");
        
        res = await fetch(
          CUSTOMERS_API,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization" : `${token}`,
            },
            body: JSON.stringify({form,em}),
          }
        )
      }

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      // success ke baad list ko fresh data se refresh karo
      await fetchCustomers()

      setForm(emptyForm)
      setEditingCustomer(null)
      setShowForm(false)

    } catch (err) {

      console.error(err)
      alert('Something went wrong while saving customer.')

    } finally {

      setSubmitting(false)
    }
  }

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (customer) => {

    const confirmed = window.confirm(`Delete ${customer.name}?`)

    if (!confirmed) {
      return
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/add/delete",
        { method: 'POST' ,
        headers: {
            'Content-Type': 'application/json',
            "Authorization" : `${token}`,
          },
          body: JSON.stringify({ id: customer.id, em: em })}
      )

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      await fetchCustomers()

    } catch (err) {

      console.error(err)
      alert('Failed to delete customer.')
    }
  }

  // =========================================
  // FORMAT MONEY
  // =========================================

  const money = (value) => {

    return Number(value || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your customers and receivables</p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Customer
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Customers</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{customers.length}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Outstanding Receivables</p>
          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {money(customers.reduce((total, c) => total + Number(c.outstanding || 0), 0))}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Search Results</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{filteredCustomers.length}</h2>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer by name, phone, email or GSTIN..."
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {loading ? (

          <div className="px-6 py-16 text-center text-slate-500">
            Loading customers...
          </div>

        ) : error ? (

          <div className="px-6 py-16 text-center text-red-600">
            {error}
          </div>

        ) : filteredCustomers.length === 0 ? (

          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              👥
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No data found</h3>
            <p className="mt-1 text-sm text-slate-500">Add your first customer to get started.</p>
            <button
              type="button"
              onClick={openAddForm}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add Customer
            </button>
          </div>

        ) : (

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">GSTIN</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Credit Limit</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Outstanding</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-medium text-slate-500">#{customer.id}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{customer.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{customer.type || 'Business'}</div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">{customer.gstin || 'Not provided'}</td>

                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-700">{customer.phone || 'No phone'}</div>
                      <div className="mt-1 text-xs text-slate-500">{customer.email || 'No email'}</div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">{money(customer.creditLimit)}</td>

                    <td className="px-5 py-4">
                      <span className={Number(customer.outstanding || 0) > 0 ? 'font-semibold text-orange-600' : 'font-semibold text-green-600'}>
                        {money(customer.outstanding)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEditForm(customer)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(customer)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCustomer ? 'Edit Customer' : 'Add Customer'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Enter customer information below.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 hover:bg-slate-100">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Customer Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter customer name" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Customer Type</label>
                  <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                    <option value="Business">Business</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">GSTIN</label>
                <input type="text" name="gstin" value={form.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="w-full rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="customer@example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows="3" placeholder="Enter customer address" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Credit Limit (₹)</label>
                  <input type="number" min="0" name="creditLimit" value={form.creditLimit} onChange={handleChange} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Opening Balance (₹)</label>
                  <input type="number" min="0" name="openingBalance" value={form.openingBalance} onChange={handleChange} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-100">
                  Cancel
                </button>

                <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {submitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}