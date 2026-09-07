import { useEffect, useMemo, useState } from 'react'

import {
  Plus,
  FileText,
  X,
  Pencil,
  Trash2,
  Search,
  Eye,
  Printer,
} from 'lucide-react'

import {
  motion,
  AnimatePresence,
} from 'framer-motion'

import toast from 'react-hot-toast'

const API_BASE = 'https://buyqk-bakend.onrender.com/api/invoice'

export default function Invoices() {

  /* =====================================================
     AUTH / USER
  ===================================================== */

  const em = localStorage.getItem('userEmail')
  const token = localStorage.getItem('token')

  /* =====================================================
     BUSINESS PROFILE
  ===================================================== */

  const getBusinessProfile = () => {

    try {

      const storedUser =
        JSON.parse(
          localStorage.getItem('user') || 'null'
        ) || {}

      return {

        name:
          storedUser.businessName ||
          localStorage.getItem('businessName') ||
          'My Business',

        gstin:
          storedUser.gstin ||
          localStorage.getItem('gstin') ||
          '',

        phone:
          storedUser.phone ||
          localStorage.getItem('userPhone') ||
          '',

        email:
          storedUser.email ||
          localStorage.getItem('userEmail') ||
          '',

        address:
          storedUser.address ||
          localStorage.getItem('userAddress') ||
          '',

      }

    } catch {

      return {

        name:
          localStorage.getItem('businessName') ||
          'My Business',

        gstin:
          localStorage.getItem('gstin') ||
          '',

        phone:
          localStorage.getItem('userPhone') ||
          '',

        email:
          localStorage.getItem('userEmail') ||
          '',

        address:
          localStorage.getItem('userAddress') ||
          '',

      }

    }

  }


  const businessProfile =
    getBusinessProfile()


  /* =====================================================
     STATES
  ===================================================== */

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] =
    useState(false)

  const [viewInvoice, setViewInvoice] =
    useState(null)

  const [editingId, setEditingId] =
    useState(null)

  const [search, setSearch] =
    useState('')

  const [submitting, setSubmitting] =
    useState(false)


  const emptyForm = {

    invoiceNumber: '',
    customer: '',
    email: '',
    invoiceDate: '',
    dueDate: '',
    amount: '',
    gstRate: '18',
    status: 'Pending',
    notes: '',

  }


  const [form, setForm] =
    useState(emptyForm)


  /* =====================================================
     FETCH INVOICES (on mount)
  ===================================================== */

  const fetchInvoices = async () => {

    setLoading(true)
    setError('')

    try {

      const res = await fetch("https://buyqk-bakend.onrender.com/api/invoice/get", {
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

      const rows = Array.isArray(result)
        ? result
        : result?.invoices || []

      const normalized = rows.map((item) => ({
        id: item.id,
        invoiceNumber: item.invoiceNumber ?? item.in_num ?? '',
        customer: item.cus_name ?? '',
        email: item.cus_email ?? '',
        invoiceDate: item.in_date ?? item.invoice_date ?? '',
        dueDate: item.due_date ?? item.dueDate ?? '',
        amount: item.amount,
        gstRate: item.gst ?? item.gst_rate ?? 0,
        cgst: item.cgst,
        sgst: item.sgst,
        totalGST: item.totalGST ?? item.totalgst,
        grandTotal: item.grandTotal ?? item.grandtotal,
        status: item.status ?? 'Pending',
        notes: item.notes ?? '',
      }))

      setInvoices(normalized)

    } catch (err) {

      console.error(err)
      setError('Failed to load invoices.')
      setInvoices([])

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])


  /* =====================================================
     MONEY FORMAT
  ===================================================== */

  const formatMoney = (amount) => {

    return `₹${Number(
      amount || 0
    ).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`

  }


  /* =====================================================
     GST CALCULATION
  ===================================================== */

  const calculateGST = (
    amount,
    gstRate
  ) => {

    const taxableAmount =
      Number(amount || 0)

    const rate =
      Number(gstRate || 0)

    const totalGST =
      (
        taxableAmount *
        rate
      ) / 100

    const cgst =
      totalGST / 2

    const sgst =
      totalGST / 2

    const grandTotal =
      taxableAmount +
      totalGST

    return {

      taxableAmount,

      rate,

      cgst,

      sgst,

      totalGST,

      grandTotal,

    }

  }


  const currentGST =
    calculateGST(
      form.amount,
      form.gstRate
    )


  /* =====================================================
     STATUS
  ===================================================== */

  const getStatusClass = (
    status
  ) => {

    if (
      status === 'Paid'
    ) {

      return 'bg-green-100 text-green-700'

    }

    if (
      status === 'Overdue'
    ) {

      return 'bg-red-100 text-red-700'

    }

    return 'bg-orange-100 text-orange-700'

  }


  /* =====================================================
     OPEN ADD
  ===================================================== */

  const openAddModal = () => {

    setEditingId(null)

    setForm({

      ...emptyForm,

      invoiceDate:
        new Date()
          .toISOString()
          .split('T')[0],

    })

    setShowModal(true)

  }


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {

    setShowModal(false)

    setEditingId(null)

    setForm(emptyForm)

  }


  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target

    setForm(
      previous => ({
        ...previous,
        [name]: value,
      })
    )

  }


  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {

    if (
      !form.invoiceNumber.trim()
    ) {

      toast.error(
        'Please enter invoice number'
      )

      return false

    }


    if (
      !form.customer.trim()
    ) {

      toast.error(
        'Please enter customer name'
      )

      return false

    }


    if (
      !form.invoiceDate
    ) {

      toast.error(
        'Please select invoice date'
      )

      return false

    }


    if (
      !form.dueDate
    ) {

      toast.error(
        'Please select due date'
      )

      return false

    }


    if (
      form.dueDate < form.invoiceDate
    ) {

      toast.error(
        'Due date cannot be before invoice date'
      )

      return false

    }


    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {

      toast.error(
        'Please enter a valid taxable amount'
      )

      return false

    }


    if (
      Number(form.gstRate) < 0 ||
      Number(form.gstRate) > 100
    ) {

      toast.error(
        'GST rate must be between 0% and 100%'
      )

      return false

    }


    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {

      toast.error(
        'Please enter a valid email'
      )

      return false

    }


    return true

  }


  /* =====================================================
     SAVE INVOICE (ADD / UPDATE via API)
  ===================================================== */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault()


    if (
      !validateForm()
    ) {

      return

    }


    const gst =
      calculateGST(
        form.amount,
        form.gstRate
      )


    const invoiceData = {

      ...form,

      amount:
        Number(form.amount),

      gstRate:
        Number(form.gstRate),

      cgst:
        Number(
          gst.cgst.toFixed(2)
        ),

      sgst:
        Number(
          gst.sgst.toFixed(2)
        ),

      totalGST:
        Number(
          gst.totalGST.toFixed(2)
        ),

      grandTotal:
        Number(
          gst.grandTotal.toFixed(2)
        ),

    }


    setSubmitting(true)

    try {

      if (editingId) {

        const res = await fetch(
          "https://buyqk-bakend.onrender.com/api/invoice/update",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization" : `${token}`,
            },
            body: JSON.stringify({
              id: editingId,
              form: invoiceData,
              em: em,
            }),
          }
        )

        if (res.status != 200) {
          throw new Error(`Request failed with status ${res.status}`)
        }

        toast.success(
          'Invoice updated successfully'
        )

      } else {

        const res = await fetch(
          "https://buyqk-bakend.onrender.com/api/invoice/add",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "Authorization" : `${token}`,
            },
            body: JSON.stringify({
              form: invoiceData,
              em: em,
            }),
          }
        )

        if (res.status != 200) {
          throw new Error(`Request failed with status ${res.status}`)
        }

        toast.success(
          'Invoice added successfully'
        )

      }

      await fetchInvoices()

      closeModal()

    } catch (err) {

      console.error(err)
      toast.error('Something went wrong while saving invoice.')

    } finally {

      setSubmitting(false)

    }

  }


  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = (
    invoice
  ) => {

    setEditingId(
      invoice.id
    )


    setForm({

      invoiceNumber:
        invoice.invoiceNumber ||
        '',

      customer:
        invoice.customer ||
        '',

      email:
        invoice.email ||
        '',

      invoiceDate:
        invoice.invoiceDate ||
        '',

      dueDate:
        invoice.dueDate ||
        '',

      amount:
        invoice.amount ||
        '',

      gstRate:
        invoice.gstRate ??
        '18',

      status:
        invoice.status ||
        'Pending',

      notes:
        invoice.notes ||
        '',

    })


    setShowModal(true)

  }


  /* =====================================================
     DELETE (via API)
  ===================================================== */

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this invoice?'
      )


    if (
      !confirmed
    ) {

      return

    }


    try {

      const res = await fetch(
        "https://buyqk-bakend.onrender.com/api/invoice/delete",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization" : `${token}`,
          },
          body: JSON.stringify({
            id: id,
            em: em,
          }),
        }
      )

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      await fetchInvoices()

      toast.success(
        'Invoice deleted successfully'
      )

    } catch (err) {

      console.error(err)
      toast.error('Failed to delete invoice.')

    }

  }


  /* =====================================================
     VIEW
  ===================================================== */

  const handleView = (
    invoice
  ) => {

    setViewInvoice(
      invoice
    )

  }


  /* =====================================================
     PRINT
  ===================================================== */

  const handlePrint = () => {

    if (
      !viewInvoice
    ) {

      return

    }

    window.print()

  }


  /* =====================================================
     SEARCH
  ===================================================== */

  const searchText =
    search
      .toLowerCase()
      .trim()


  const filteredInvoices = useMemo(() => (

    invoices.filter(
      invoice => {

        if (
          !searchText
        ) {

          return true

        }


        return (

          String(
            invoice.invoiceNumber ||
            ''
          )
            .toLowerCase()
            .includes(
              searchText
            )

          ||

          String(
            invoice.customer ||
            ''
          )
            .toLowerCase()
            .includes(
              searchText
            )

          ||

          String(
            invoice.status ||
            ''
          )
            .toLowerCase()
            .includes(
              searchText
            )

          ||

          String(
            invoice.email ||
            ''
          )
            .toLowerCase()
            .includes(
              searchText
            )

        )

      }
    )

  ), [invoices, searchText])


  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalInvoices =
    invoices.length


  const paidAmount = useMemo(() => (

    invoices
      .filter(
        item =>
          item.status ===
          'Paid'
      )
      .reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.grandTotal ??
            item.amount ??
            0
          ),
        0
      )

  ), [invoices])


  const pendingAmount = useMemo(() => (

    invoices
      .filter(
        item =>
          item.status ===
          'Pending'
      )
      .reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.grandTotal ??
            item.amount ??
            0
          ),
        0
      )

  ), [invoices])


  const overdueAmount = useMemo(() => (

    invoices
      .filter(
        item =>
          item.status ===
          'Overdue'
      )
      .reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.grandTotal ??
            item.amount ??
            0
          ),
        0
      )

  ), [invoices])


  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <div className="p-4 md:p-6 space-y-6">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Invoices
          </h1>

          <p className="text-slate-500 mt-1">
            Create and manage your invoices.
          </p>

        </div>


        <button
          type="button"
          onClick={
            openAddModal
          }
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        >

          <Plus size={18} />

          Add Invoice

        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <SummaryCard
          title="Total Invoices"
          value={
            totalInvoices
          }
          subtitle="All invoices"
        />


        <SummaryCard
          title="Paid"
          value={
            formatMoney(
              paidAmount
            )
          }
          subtitle="Paid invoices"
          valueClass="text-green-600"
        />


        <SummaryCard
          title="Pending"
          value={
            formatMoney(
              pendingAmount
            )
          }
          subtitle="Pending payments"
          valueClass="text-orange-500"
        />


        <SummaryCard
          title="Overdue"
          value={
            formatMoney(
              overdueAmount
            )
          }
          subtitle="Overdue payments"
          valueClass="text-red-600"
        />

      </div>


      {/* =================================================
          INVOICE LIST
      ================================================= */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

          <div>

            <h2 className="font-semibold text-lg text-slate-800">
              Invoice List
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {filteredInvoices.length}{' '}
              invoice
              {filteredInvoices.length !== 1
                ? 's'
                : ''}
            </p>

          </div>


          {/* SEARCH */}

          <div className="relative w-full md:w-80">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Search invoice, customer, email..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1150px]">

            <thead>

              <tr className="border-b border-slate-200">

                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  ID
                </th>

                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  Invoice
                </th>

                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  Customer
                </th>

                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  Date
                </th>

                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  Due Date
                </th>

                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                  Taxable
                </th>

                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                  GST
                </th>

                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                  Total
                </th>

                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  Status
                </th>

                <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="10" className="py-16 text-center text-slate-500">
                    Loading invoices...
                  </td>
                </tr>

              ) : error ? (

                <tr>
                  <td colSpan="10" className="py-16 text-center text-red-600">
                    {error}
                  </td>
                </tr>

              ) : filteredInvoices.length === 0 ? (

                <tr>

                  <td
                    colSpan="10"
                    className="py-16 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">

                        <FileText
                          size={28}
                        />

                      </div>

                      <h3 className="font-semibold text-slate-800 mt-4">
                        No invoices found
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Add your first invoice to get started.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredInvoices.map(
                  invoice => {

                    const gstData =
                      calculateGST(
                        invoice.amount,
                        invoice.gstRate ??
                        0
                      )


                    return (

                      <motion.tr
                        key={
                          invoice.id
                        }
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        <td className="py-4 px-4 text-sm text-slate-500">
                          {
                            invoice.id
                          }
                        </td>


                        <td className="py-4 px-4">

                          <p className="font-semibold text-slate-800">
                            {
                              invoice.invoiceNumber
                            }
                          </p>

                        </td>


                        <td className="py-4 px-4">

                          <p className="font-medium text-slate-700">
                            {
                              invoice.customer
                            }
                          </p>

                          {invoice.email && (

                            <p className="text-xs text-slate-400 mt-1">
                              {
                                invoice.email
                              }
                            </p>

                          )}

                        </td>


                        <td className="py-4 px-4 text-sm text-slate-600">
                          {
                            invoice.invoiceDate
                          }
                        </td>


                        <td className="py-4 px-4 text-sm text-slate-600">
                          {
                            invoice.dueDate
                          }
                        </td>


                        <td className="py-4 px-4 text-right font-medium text-slate-700">
                          {formatMoney(
                            invoice.amount
                          )}
                        </td>


                        <td className="py-4 px-4 text-right">

                          <p className="font-medium text-slate-700">
                            {formatMoney(
                              invoice.totalGST ??
                              gstData.totalGST
                            )}
                          </p>

                          <p className="text-xs text-slate-400">
                            {invoice.gstRate ??
                              0}
                            %
                          </p>

                        </td>


                        <td className="py-4 px-4 text-right font-bold text-slate-800">
                          {formatMoney(
                            invoice.grandTotal ??
                            gstData.grandTotal
                          )}
                        </td>


                        <td className="py-4 px-4">

                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                              invoice.status
                            )}`}
                          >
                            {
                              invoice.status
                            }
                          </span>

                        </td>


                        <td className="py-4 px-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleView(
                                  invoice
                                )
                              }
                              title="View and Print Bill"
                              className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                            >

                              <Eye
                                size={16}
                              />

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  invoice
                                )
                              }
                              title="Edit Invoice"
                              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            >

                              <Pencil
                                size={16}
                              />

                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  invoice.id
                                )
                              }
                              title="Delete Invoice"
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

                          </div>

                        </td>

                      </motion.tr>

                    )

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      <AnimatePresence>

        {showModal && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          >

            <motion.div
              initial={{
                scale: 0.95,
                y: 20,
              }}
              animate={{
                scale: 1,
                y: 0,
              }}
              exit={{
                scale: 0.95,
                y: 20,
              }}
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl"
            >

              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-slate-800">

                    {editingId
                      ? 'Edit Invoice'
                      : 'Add Invoice'}

                  </h2>

                  <p className="text-sm text-slate-500 mt-1">

                    {editingId
                      ? 'Update invoice details.'
                      : 'Create a new invoice.'}

                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                >

                  <X
                    size={20}
                  />

                </button>

              </div>


              <form
                onSubmit={
                  handleSubmit
                }
                className="p-6 space-y-5"
              >

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <FormInput
                    label="Invoice Number *"
                    name="invoiceNumber"
                    value={
                      form.invoiceNumber
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="INV-0001"
                  />


                  <FormInput
                    label="Customer Name *"
                    name="customer"
                    value={
                      form.customer
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Customer name"
                  />

                </div>


                <FormInput
                  label="Customer Email"
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="customer@example.com"
                />


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <FormInput
                    label="Invoice Date *"
                    type="date"
                    name="invoiceDate"
                    value={
                      form.invoiceDate
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <FormInput
                    label="Due Date *"
                    type="date"
                    name="dueDate"
                    value={
                      form.dueDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* TAXABLE AMOUNT */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Taxable Amount *
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="amount"
                      value={
                        form.amount
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                </div>


                {/* GST RATE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    GST Rate
                  </label>

                  <input
                    type="number"
                    name="gstRate"
                    min="0"
                    max="100"
                    step="0.01"
                    value={
                      form.gstRate
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter GST rate"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />


                  <div className="flex flex-wrap gap-2 mt-2">

                    {[0, 5, 12, 18, 28].map(
                      rate => (

                        <button
                          key={
                            rate
                          }
                          type="button"
                          onClick={() =>
                            setForm(
                              previous => ({
                                ...previous,
                                gstRate:
                                  String(
                                    rate
                                  ),
                              })
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            String(
                              form.gstRate
                            ) ===
                            String(rate)
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >

                          {rate}%

                        </button>

                      )
                    )}

                  </div>

                </div>


                {/* GST PREVIEW */}

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">

                  <div className="flex items-center justify-between mb-4">

                    <h3 className="font-semibold text-slate-800">
                      GST Summary
                    </h3>

                    <span className="text-sm font-medium text-blue-600">
                      {form.gstRate}%
                    </span>

                  </div>


                  <div className="space-y-3">

                    <PreviewRow
                      label="Taxable Amount"
                      value={
                        currentGST.taxableAmount
                      }
                    />


                    <PreviewRow
                      label={`CGST (${Number(
                        form.gstRate || 0
                      ) / 2}%)`}
                      value={
                        currentGST.cgst
                      }
                    />


                    <PreviewRow
                      label={`SGST (${Number(
                        form.gstRate || 0
                      ) / 2}%)`}
                      value={
                        currentGST.sgst
                      }
                    />


                    <PreviewRow
                      label="Total GST"
                      value={
                        currentGST.totalGST
                      }
                      strong
                    />


                    <div className="border-t border-slate-200 pt-3 flex justify-between">

                      <span className="font-bold text-slate-800">
                        Grand Total
                      </span>

                      <span className="text-xl font-bold text-blue-600">
                        {formatMoney(
                          currentGST.grandTotal
                        )}
                      </span>

                    </div>

                  </div>

                </div>


                {/* STATUS */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Paid">
                      Paid
                    </option>

                    <option value="Overdue">
                      Overdue
                    </option>

                  </select>

                </div>


                {/* NOTES */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={
                      form.notes
                    }
                    onChange={
                      handleChange
                    }
                    rows="3"
                    placeholder="Additional notes..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />

                </div>


                {/* BUTTONS */}

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">

                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-60"
                  >

                    {submitting
                      ? 'Saving...'
                      : editingId
                      ? 'Update Invoice'
                      : 'Save Invoice'}

                  </button>

                </div>

              </form>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* =================================================
          VIEW / PRINT BILL
      ================================================= */}

      <AnimatePresence>

        {viewInvoice && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 print:static print:bg-white print:p-0"
          >

            <motion.div
              initial={{
                scale: 0.96,
                y: 20,
              }}
              animate={{
                scale: 1,
                y: 0,
              }}
              exit={{
                scale: 0.96,
                y: 20,
              }}
              className="bg-white w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-2xl shadow-2xl print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:rounded-none"
            >


              {/* TOOLBAR */}

              <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between print:hidden">

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Bill Preview
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    {
                      viewInvoice.invoiceNumber
                    }
                  </p>

                </div>


                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      handlePrint
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold"
                  >

                    <Printer
                      size={17}
                    />

                    Print Bill

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setViewInvoice(
                        null
                      )
                    }
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                  >

                    <X
                      size={20}
                    />

                  </button>

                </div>

              </div>


              {/* =================================================
                  PRINTABLE INVOICE
              ================================================= */}

              <div
                id="printable-invoice"
                className="bg-white p-6 md:p-10"
              >


                {/* BUSINESS HEADER */}

                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">


                  {/* BUSINESS */}

                  <div>

                    <div className="flex items-center gap-3">

                      <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg print:bg-black">
                        {businessProfile.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>


                      <div>

                        <h1 className="text-2xl font-bold text-slate-900">
                          {
                            businessProfile.name
                          }
                        </h1>

                        <p className="text-sm text-slate-500">
                          Tax Invoice
                        </p>

                      </div>

                    </div>


                    <div className="mt-4 space-y-1 text-sm text-slate-500">


                      {businessProfile.address && (

                        <p className="whitespace-pre-wrap">
                          {
                            businessProfile.address
                          }
                        </p>

                      )}


                      {businessProfile.gstin && (

                        <p>
                          GSTIN:{' '}
                          {
                            businessProfile.gstin
                          }
                        </p>

                      )}


                      {businessProfile.email && (

                        <p>
                          Email:{' '}
                          {
                            businessProfile.email
                          }
                        </p>

                      )}


                      {businessProfile.phone && (

                        <p>
                          Phone:{' '}
                          {
                            businessProfile.phone
                          }
                        </p>

                      )}


                    </div>

                  </div>


                  {/* INVOICE TITLE */}

                  <div className="sm:text-right">

                    <h2 className="text-4xl font-bold tracking-wide text-slate-900">
                      TAX INVOICE
                    </h2>


                    <p className="mt-2 text-lg font-semibold text-slate-700">
                      {
                        viewInvoice.invoiceNumber
                      }
                    </p>


                    <span
                      className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                        viewInvoice.status
                      )} print:bg-white print:border print:border-slate-300`}
                    >

                      {
                        viewInvoice.status
                      }

                    </span>

                  </div>

                </div>


                <div className="mt-8 border-t-2 border-slate-900" />


                {/* CUSTOMER DETAILS */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">


                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bill To
                    </p>


                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {
                        viewInvoice.customer
                      }
                    </h3>


                    {viewInvoice.email && (

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          viewInvoice.email
                        }
                      </p>

                    )}

                  </div>


                  <div className="md:text-right">

                    <InvoiceInfo
                      label="Invoice Date"
                      value={
                        viewInvoice.invoiceDate
                      }
                    />


                    <InvoiceInfo
                      label="Due Date"
                      value={
                        viewInvoice.dueDate
                      }
                    />

                  </div>

                </div>


                {/* =================================================
                    TAX TABLE
                ================================================= */}

                <div className="mt-10 overflow-hidden rounded-xl border border-slate-300">


                  <div className="grid grid-cols-[1fr_auto] bg-slate-100 px-5 py-4 print:bg-slate-100">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Description
                    </p>


                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                      Amount
                    </p>

                  </div>


                  {/* TAXABLE */}

                  <div className="grid grid-cols-[1fr_auto] px-5 py-5 border-t border-slate-200">

                    <div>

                      <p className="font-semibold text-slate-800">
                        Taxable Amount
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Goods / Services
                      </p>

                    </div>


                    <p className="font-semibold text-slate-800 text-right">
                      {formatMoney(
                        viewInvoice.amount
                      )}
                    </p>

                  </div>


                  {/* GST RATE */}

                  <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">

                    <div className="flex justify-between">

                      <span className="text-sm font-medium text-slate-600">
                        GST Rate
                      </span>


                      <span className="text-sm font-bold text-slate-700">
                        {viewInvoice.gstRate ??
                          0}
                        %
                      </span>

                    </div>

                  </div>


                  {/* CGST */}

                  <div className="grid grid-cols-[1fr_auto] px-5 py-4 border-t border-slate-200">

                    <p className="text-slate-600">

                      CGST (
                      {Number(
                        viewInvoice.gstRate ??
                        0
                      ) / 2}
                      %)

                    </p>


                    <p className="font-medium text-slate-800 text-right">

                      {formatMoney(
                        viewInvoice.cgst ??
                        calculateGST(
                          viewInvoice.amount,
                          viewInvoice.gstRate
                        ).cgst
                      )}

                    </p>

                  </div>


                  {/* SGST */}

                  <div className="grid grid-cols-[1fr_auto] px-5 py-4 border-t border-slate-200">

                    <p className="text-slate-600">

                      SGST (
                      {Number(
                        viewInvoice.gstRate ??
                        0
                      ) / 2}
                      %)

                    </p>


                    <p className="font-medium text-slate-800 text-right">

                      {formatMoney(
                        viewInvoice.sgst ??
                        calculateGST(
                          viewInvoice.amount,
                          viewInvoice.gstRate
                        ).sgst
                      )}

                    </p>

                  </div>


                  {/* TOTAL GST */}

                  <div className="grid grid-cols-[1fr_auto] px-5 py-4 border-t border-slate-200">

                    <p className="font-semibold text-slate-700">
                      Total GST
                    </p>


                    <p className="font-bold text-slate-800 text-right">

                      {formatMoney(
                        viewInvoice.totalGST ??
                        calculateGST(
                          viewInvoice.amount,
                          viewInvoice.gstRate
                        ).totalGST
                      )}

                    </p>

                  </div>


                  {/* GRAND TOTAL */}

                  <div className="grid grid-cols-[1fr_auto] px-5 py-5 border-t-2 border-slate-900 bg-slate-50 print:bg-slate-50">

                    <p className="text-lg font-bold text-slate-900">
                      Grand Total
                    </p>


                    <p className="text-xl font-bold text-blue-600 print:text-black">

                      {formatMoney(
                        viewInvoice.grandTotal ??
                        calculateGST(
                          viewInvoice.amount,
                          viewInvoice.gstRate
                        ).grandTotal
                      )}

                    </p>

                  </div>

                </div>


                {/* PAYMENT */}

                <div className="mt-6 rounded-xl border border-slate-200 p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Amount Payable
                  </p>


                  <p className="mt-1 font-semibold text-slate-800">

                    {formatMoney(
                      viewInvoice.grandTotal ??
                      calculateGST(
                        viewInvoice.amount,
                        viewInvoice.gstRate
                      ).grandTotal
                    )}

                  </p>

                </div>


                {/* NOTES */}

                {viewInvoice.notes && (

                  <div className="mt-8">

                    <p className="text-sm font-bold text-slate-700">
                      Notes
                    </p>


                    <p className="mt-2 text-sm text-slate-500 whitespace-pre-wrap">
                      {
                        viewInvoice.notes
                      }
                    </p>

                  </div>

                )}


                {/* SIGNATURE */}

                <div className="mt-12 grid grid-cols-2 gap-10">

                  <div>

                    <div className="border-b border-slate-300 h-10" />

                    <p className="mt-2 text-xs text-slate-500">
                      Customer Signature
                    </p>

                  </div>


                  <div>

                    <div className="border-b border-slate-300 h-10" />

                    <p className="mt-2 text-xs text-slate-500 text-right">
                      Authorized Signature
                    </p>

                  </div>

                </div>


                {/* FOOTER */}

                <div className="mt-12 border-t border-slate-200 pt-6 text-center">

                  <p className="font-semibold text-slate-700">
                    Thank you for your business!
                  </p>


                  <p className="mt-2 text-xs text-slate-400">
                    This is a computer-generated invoice.
                  </p>

                </div>


              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* =================================================
          PRINT CSS
      ================================================= */}

      <style>{`

        @media print {

          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }

          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
          }

          #printable-invoice {
            color: #111827 !important;
          }

          button,
          input,
          textarea,
          select {
            display: none !important;
          }

        }

      `}</style>

    </div>

  )

}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  subtitle,
  valueClass = 'text-slate-800',
}) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>


      <h2
        className={`text-3xl font-bold mt-1 ${valueClass}`}
      >
        {value}
      </h2>


      <p className="text-xs text-slate-400 mt-1">
        {subtitle}
      </p>

    </div>

  )

}


/* =====================================================
   FORM INPUT
===================================================== */

function FormInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
}) {

  return (

    <div>

      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>


      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
      />

    </div>

  )

}


/* =====================================================
   PREVIEW ROW
===================================================== */

function PreviewRow({
  label,
  value,
  strong = false,
}) {

  return (

    <div className="flex justify-between">

      <span
        className={
          strong
            ? 'font-semibold text-slate-700'
            : 'text-sm text-slate-500'
        }
      >
        {label}
      </span>


      <span
        className={
          strong
            ? 'font-bold text-slate-800'
            : 'font-medium text-slate-800'
        }
      >

        {`₹${Number(
          value || 0
        ).toLocaleString(
          'en-IN',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}`}

      </span>

    </div>

  )

}


/* =====================================================
   INVOICE INFO
===================================================== */

function InvoiceInfo({
  label,
  value,
}) {

  return (

    <div className="flex justify-between md:justify-end md:gap-8 mt-2 first:mt-0">

      <span className="text-sm text-slate-500">
        {label}:
      </span>


      <span className="text-sm font-semibold text-slate-800">
        {value || '—'}
      </span>

    </div>

  )

}
