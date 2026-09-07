import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Truck,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

const API_BASE = 'http://localhost:5000/api/vendor'

export default function Vendors() {
  // =====================================================
  // AUTH / USER
  // =====================================================

  const em = localStorage.getItem('userEmail')
  const token = localStorage.getItem('token')

  // =====================================================
  // STATE
  // =====================================================

  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [editingVendor, setEditingVendor] = useState(null)
  const [selectedVendor, setSelectedVendor] = useState(null)

  // =====================================================
  // FETCH VENDORS
  // =====================================================

  const fetchVendors = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch("http://localhost:5000/api/ven/get", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({
          em: em,
        }),
      })

      console.log('Vendor email:', em)

      if (res.status !== 200) {
        throw new Error(
          `Request failed with status ${res.status}`
        )
      }

      const result = await res.json()

      console.log('Vendor API response:', result)

      const rows = Array.isArray(result)
        ? result
        : result?.vendors || result?.data || []

      // Normalize backend fields
      const normalized = rows.map((item) => ({
        id: item.id ?? item.vendor_id,

        name:
          item.name ??
          item.vendor_name ??
          item.v_name ??
          '',

        companyName:
          item.companyName ??
          item.com_name ??
          item.company ??
          '',

        phone:
          item.phone ??
          item.mobile ??
          item.vendor_phone ??
          '',

        email:
          item.c_email ??
          item.vendor_email ??
          '',

        gstin:
          item.gstin ??
          item.gst ??
          item.gst_number ??
          '',

        address:
          item.address ??
          item.add ??
          '',

        openingBalance:
          item.openingBalance ??
          item.opeingbal ??
          item.balance ??
          0,

        status:
          item.status ??
          'active',
      }))

      setVendors(normalized)
    } catch (err) {
      console.error('Fetch vendors error:', err)
      setError('Failed to load vendors.')
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // FETCH ON MOUNT
  // =====================================================

  useEffect(() => {
    fetchVendors()
  }, [])

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredVendors = useMemo(() => {
    const text = search.trim().toLowerCase()

    return vendors.filter((vendor) => {
      const matchesSearch =
        !text ||
        [
          vendor.id,
          vendor.name,
          vendor.companyName,
          vendor.phone,
          vendor.email,
          vendor.gstin,
          vendor.address,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(text)
          )

      const matchesStatus =
        statusFilter === 'all' ||
        vendor.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [vendors, search, statusFilter])

  // =====================================================
  // ADD VENDOR
  // =====================================================

  const handleAddVendor = async (form) => {
    setSubmitting(true)

    try {
      const res = await fetch(" http://localhost:5000/api/ven/add", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({
          form: {
            ...form,
            name: form.name.trim(),
            openingBalance: Number(
              form.openingBalance || 0
            ),
          },
          em: em,
        }),
      })

      console.log('Add vendor status:', res.status)

      if (res.status !== 200) {
        throw new Error(
          `Request failed with status ${res.status}`
        )
      }

      await fetchVendors()

      setShowForm(false)
      setEditingVendor(null)
    } catch (err) {
      console.error('Add vendor error:', err)
      alert('Something went wrong while saving vendor.')
    } finally {
      setSubmitting(false)
    }
  }

  // =====================================================
  // UPDATE VENDOR
  // =====================================================

  const handleUpdateVendor = async (form) => {
    if (!editingVendor) return

    setSubmitting(true)

    try {
      const res = await fetch("http://localhost:5000/api/vendor/update", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({
          id: editingVendor.id,

          form: {
            ...form,
            name: form.name.trim(),
            openingBalance: Number(
              form.openingBalance || 0
            ),
          },

          em: em,
        }),
      })

      console.log('Update vendor status:', res.status)

      if (res.status !== 200) {
        throw new Error(
          `Request failed with status ${res.status}`
        )
      }

      await fetchVendors()

      setShowForm(false)
      setEditingVendor(null)
    } catch (err) {
      console.error('Update vendor error:', err)
      alert('Failed to update vendor.')
    } finally {
      setSubmitting(false)
    }
  }

  // =====================================================
  // SAVE VENDOR
  // =====================================================

  const handleSave = async (form) => {
    if (editingVendor) {
      await handleUpdateVendor(form)
    } else {
      await handleAddVendor(form)
    }
  }

  // =====================================================
  // DELETE VENDOR
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this vendor?'
    )

    if (!confirmed) return

    try {
      const res = await fetch("http://localhost:5000/api/vendor/delete", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({
          id: id,
          em: em,
        }),
      })

      console.log('Delete vendor status:', res.status)

      if (res.status !== 200) {
        throw new Error(
          `Request failed with status ${res.status}`
        )
      }

      await fetchVendors()
    } catch (err) {
      console.error('Delete vendor error:', err)
      alert('Failed to delete vendor.')
    }
  }

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vendors
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage suppliers and vendor accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingVendor(null)
            setShowForm(true)
          }}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-orange-500
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-orange-600
          "
        >
          <Plus size={18} />
          Add Vendor
        </button>

      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-3">

        <StatCard
          title="Total Vendors"
          value={vendors.length}
        />

        <StatCard
          title="Active Vendors"
          value={
            vendors.filter(
              (vendor) => vendor.status === 'active'
            ).length
          }
        />

        <StatCard
          title="Inactive Vendors"
          value={
            vendors.filter(
              (vendor) => vendor.status === 'inactive'
            ).length
          }
        />

      </div>

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">

        <div className="flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search vendors..."
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
              "
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="
              h-11
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              outline-none
            "
          >
            <option value="all">
              All Vendors
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

        </div>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {loading ? (

          <div className="p-12 text-center text-slate-500">
            Loading vendors...
          </div>

        ) : error ? (

          <div className="p-12 text-center text-red-600">
            {error}
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Vendor
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    GSTIN
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Balance
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredVendors.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="p-12 text-center"
                    >

                      <Truck
                        size={35}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="font-semibold text-slate-600">
                        No vendors found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first vendor.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredVendors.map((vendor) => (

                    <tr
                      key={vendor.id}
                      className="hover:bg-slate-50"
                    >

                      {/* ID */}

                      <td className="px-5 py-4 text-sm font-medium text-slate-500">
                        {vendor.id ?? '—'}
                      </td>

                      {/* VENDOR */}

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedVendor(vendor)
                          }
                          className="text-left"
                        >

                          <p className="font-semibold text-slate-800">
                            {vendor.name || 'Unnamed Vendor'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {vendor.companyName || '—'}
                          </p>

                        </button>

                      </td>

                      {/* CONTACT */}

                      <td className="px-5 py-4">

                        <p className="flex items-center gap-2 text-sm text-slate-600">

                          <Phone size={14} />

                          {vendor.phone || '—'}

                        </p>

                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">

                          <Mail size={13} />

                          {vendor.email || '—'}

                        </p>

                      </td>

                      {/* GSTIN */}

                      <td className="px-5 py-4 text-sm text-slate-600">

                        {vendor.gstin || '—'}

                      </td>

                      {/* BALANCE */}

                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">

                        {formatCurrency(
                          vendor.openingBalance
                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            ${
                              vendor.status === 'active'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-slate-100 text-slate-500'
                            }
                          `}
                        >
                          {vendor.status === 'active'
                            ? 'Active'
                            : 'Inactive'}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingVendor(vendor)
                              setShowForm(true)
                            }}
                            className="
                              rounded-lg
                              p-2
                              text-slate-400
                              hover:bg-orange-50
                              hover:text-orange-500
                            "
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(vendor.id)
                            }
                            className="
                              rounded-lg
                              p-2
                              text-slate-400
                              hover:bg-red-50
                              hover:text-red-500
                            "
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =================================================
          FORM MODAL
      ================================================= */}

      {showForm && (

        <VendorForm
          vendor={editingVendor}
          submitting={submitting}

          onClose={() => {
            setShowForm(false)
            setEditingVendor(null)
          }}

          onSave={handleSave}
        />

      )}

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedVendor && (

        <VendorDetails
          vendor={selectedVendor}
          onClose={() =>
            setSelectedVendor(null)
          }
        />

      )}

    </div>
  )
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}


// =====================================================
// VENDOR FORM
// =====================================================

function VendorForm({
  vendor,
  submitting,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    name: vendor?.name || '',
    companyName: vendor?.companyName || '',
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    gstin: vendor?.gstin || '',
    address: vendor?.address || '',
    openingBalance:
      vendor?.openingBalance || 0,
    status: vendor?.status || 'active',
  })

  // ===================================================
  // UPDATE FIELD
  // ===================================================

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  // ===================================================
  // SUBMIT
  // ===================================================

  const submit = async (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      alert('Vendor name is required.')
      return
    }

    if (
      form.openingBalance !== '' &&
      Number(form.openingBalance) < 0
    ) {
      alert('Opening balance cannot be negative.')
      return
    }

    await onSave({
      ...form,
      name: form.name.trim(),
      openingBalance: Number(
        form.openingBalance || 0
      ),
    })
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">

      <form
        onSubmit={submit}
        className="
          max-h-[90vh]
          w-full
          max-w-2xl
          overflow-y-auto
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              {vendor
                ? 'Edit Vendor'
                : 'Add Vendor'}
            </h2>

            <p className="text-xs text-slate-400">
              {vendor
                ? `Vendor ID: ${vendor.id ?? '—'}`
                : 'Vendor information'}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-slate-400
              hover:bg-slate-100
            "
          >
            <X size={18} />
          </button>

        </div>

        {/* FORM BODY */}

        <div className="grid gap-4 p-6 md:grid-cols-2">

          <Input
            label="Vendor Name *"
            value={form.name}
            onChange={(value) =>
              update('name', value)
            }
          />

          <Input
            label="Company Name"
            value={form.companyName}
            onChange={(value) =>
              update('companyName', value)
            }
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={(value) =>
              update('phone', value)
            }
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) =>
              update('email', value)
            }
          />

          <Input
            label="GSTIN"
            value={form.gstin}
            onChange={(value) =>
              update('gstin', value)
            }
          />

          <Input
            label="Opening Balance"
            type="number"
            value={form.openingBalance}
            onChange={(value) =>
              update(
                'openingBalance',
                value
              )
            }
          />

          {/* ADDRESS */}

          <div className="md:col-span-2">

            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Address
            </label>

            <textarea
              value={form.address}
              onChange={(event) =>
                update(
                  'address',
                  event.target.value
                )
              }
              rows={3}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                px-3
                py-2.5
                text-sm
                outline-none
                focus:border-orange-400
              "
            />

          </div>

          {/* STATUS */}

          <div>

            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                update(
                  'status',
                  event.target.value
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                px-3
                text-sm
                outline-none
              "
            >

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="
              rounded-xl
              border
              border-slate-200
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              hover:bg-slate-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="
              rounded-xl
              bg-orange-500
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              hover:bg-orange-600
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {submitting
              ? 'Saving...'
              : vendor
                ? 'Update Vendor'
                : 'Save Vendor'}
          </button>

        </div>

      </form>

    </div>
  )
}


// =====================================================
// INPUT COMPONENT
// =====================================================

function Input({
  label,
  value,
  onChange,
  type = 'text',
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          h-11
          w-full
          rounded-xl
          border
          border-slate-200
          px-3
          text-sm
          outline-none
          focus:border-orange-400
        "
      />

    </div>
  )
}


// =====================================================
// VENDOR DETAILS
// =====================================================

function VendorDetails({
  vendor,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <h2 className="font-bold text-slate-900">
            Vendor Details
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              hover:bg-slate-100
            "
          >
            <X size={18} />
          </button>

        </div>

        {/* DETAILS */}

        <div className="space-y-5 p-6">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-orange-100
              text-orange-500
            ">
              <Truck size={23} />
            </div>

            <div>

              <p className="font-bold text-slate-900">
                {vendor.name}
              </p>

              <p className="text-sm text-slate-400">
                {vendor.companyName || '—'}
              </p>

            </div>

          </div>

          <div>

            <p className="text-xs text-slate-400">
              Vendor ID
            </p>

            <p className="mt-1 font-semibold text-slate-700">
              {vendor.id ?? 'Not provided'}
            </p>

          </div>

          <Info
            icon={Phone}
            label="Phone"
            value={vendor.phone}
          />

          <Info
            icon={Mail}
            label="Email"
            value={vendor.email}
          />

          <Info
            icon={MapPin}
            label="Address"
            value={vendor.address}
          />

          <div>

            <p className="text-xs text-slate-400">
              GSTIN
            </p>

            <p className="mt-1 font-semibold text-slate-700">
              {vendor.gstin || 'Not provided'}
            </p>

          </div>

          <div>

            <p className="text-xs text-slate-400">
              Opening Balance
            </p>

            <p className="mt-1 font-semibold text-slate-700">
              ₹
              {Number(
                vendor.openingBalance || 0
              ).toLocaleString('en-IN')}
            </p>

          </div>

          <div>

            <p className="text-xs text-slate-400">
              Status
            </p>

            <p className="mt-1 font-semibold text-slate-700">
              {vendor.status === 'active'
                ? 'Active'
                : 'Inactive'}
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}


// =====================================================
// INFO COMPONENT
// =====================================================

function Info({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <Icon
        size={17}
        className="mt-0.5 text-orange-500"
      />

      <div>

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {value || 'Not provided'}
        </p>

      </div>

    </div>
  )
}