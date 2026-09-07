import {
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { useFinance } from '../context/FinanceContext'

export default function CustomerDetails() {

  const {
    customers,
    getCustomerInvoices,
    getCustomerPayments,
    recordCustomerPayment,
  } = useFinance()

  const {
    customerId,
  } = useParams()

  const navigate = useNavigate()

  const [showPaymentForm, setShowPaymentForm] =
    useState(false)

  const [selectedInvoice, setSelectedInvoice] =
    useState(null)

  const [paymentForm, setPaymentForm] =
    useState({

      amount: '',
      paymentMethod: 'Cash',
      reference: '',
      notes: '',
      date:
        new Date()
          .toISOString()
          .slice(0, 10),
    })

  // =========================================
  // CUSTOMER
  // =========================================

  const customer =
    customers.find(
      item =>
        String(item.id) ===
        String(customerId)
    )

  // =========================================
  // INVOICES
  // =========================================

  const customerInvoices =
    useMemo(
      () =>
        customer
          ? getCustomerInvoices(
              customer.id
            )
          : [],
      [
        customer,
        getCustomerInvoices,
      ]
    )

  // =========================================
  // PAYMENTS
  // =========================================

  const customerPayments =
    useMemo(
      () =>
        customer
          ? getCustomerPayments(
              customer.id
            )
          : [],
      [
        customer,
        getCustomerPayments,
      ]
    )

  // =========================================
  // MONEY
  // =========================================

  const money = value => {

    return Number(value || 0)
      .toLocaleString(
        'en-IN',
        {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }
      )
  }

  // =========================================
  // TOTAL SALES
  // =========================================

  const totalPurchases =
    customerInvoices.reduce(
      (total, invoice) =>
        total +
        Number(
          invoice.total ||
          invoice.totalAmount ||
          invoice.grandTotal ||
          invoice.amount ||
          0
        ),
      0
    )

  // =========================================
  // TOTAL PAID
  // =========================================

  const totalPaid =
    customerInvoices.reduce(
      (total, invoice) =>
        total +
        Number(
          invoice.paidAmount ||
          invoice.amountPaid ||
          invoice.paid ||
          0
        ),
      0
    )

  // =========================================
  // TOTAL DUE
  // =========================================

  const totalDue =
    customerInvoices.reduce(
      (total, invoice) =>
        total +
        Number(
          invoice.balanceDue ??
          Math.max(
            0,
            Number(
              invoice.total ||
              invoice.totalAmount ||
              invoice.grandTotal ||
              invoice.amount ||
              0
            ) -
            Number(
              invoice.paidAmount ||
              invoice.amountPaid ||
              invoice.paid ||
              0
            )
          )
        ),
      0
    )

  // =========================================
  // WHATSAPP
  // =========================================

  const openWhatsApp = () => {

    const phone =
      customer?.phone
        ?.replace(/\D/g, '')

    if (!phone) {

      alert(
        'Customer phone number is not available.'
      )

      return
    }

    const message =
      `Hello ${customer.name}, your current outstanding balance is ${money(customer.outstanding)}.`

    const url =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // =========================================
  // PAYMENT FORM
  // =========================================

  const openPaymentForm = invoice => {

    const due =
      Number(
        invoice.balanceDue ??
        Math.max(
          0,
          Number(
            invoice.total ||
            invoice.totalAmount ||
            invoice.grandTotal ||
            invoice.amount ||
            0
          ) -
          Number(
            invoice.paidAmount ||
            invoice.amountPaid ||
            invoice.paid ||
            0
          )
        )
      )

    if (due <= 0) {

      alert(
        'This invoice is already fully paid.'
      )

      return
    }

    setSelectedInvoice(invoice)

    setPaymentForm({

      amount: due,

      paymentMethod: 'Cash',

      reference: '',

      notes: '',

      date:
        new Date()
          .toISOString()
          .slice(0, 10),
    })

    setShowPaymentForm(true)
  }

  // =========================================
  // PAYMENT CHANGE
  // =========================================

  const handlePaymentChange = e => {

    const {
      name,
      value,
    } = e.target

    setPaymentForm(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  // =========================================
  // PAYMENT SUBMIT
  // =========================================

  const handlePaymentSubmit = e => {

    e.preventDefault()

    if (!selectedInvoice) {
      return
    }

    const amount =
      Number(
        paymentForm.amount || 0
      )

    if (amount <= 0) {

      alert(
        'Please enter a valid payment amount.'
      )

      return
    }

    const result =
      recordCustomerPayment({

        customerId:
          customer.id,

        invoiceId:
          selectedInvoice.id,

        amount,

        paymentMethod:
          paymentForm.paymentMethod,

        reference:
          paymentForm.reference,

        notes:
          paymentForm.notes,

        date:
          paymentForm.date,
      })

    if (!result) {
      return
    }

    setShowPaymentForm(false)

    setSelectedInvoice(null)

    setPaymentForm({
      amount: '',
      paymentMethod: 'Cash',
      reference: '',
      notes: '',
      date:
        new Date()
          .toISOString()
          .slice(0, 10),
    })
  }

  // =========================================
  // NOT FOUND
  // =========================================

  if (!customer) {

    return (

      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            👤
          </div>

          <h1 className="mt-4 text-2xl font-bold">
            Customer not found
          </h1>

          <p className="mt-2 text-slate-500">
            The customer you're looking for does not exist.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/customers')
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Back to Customers
          </button>

        </div>

      </div>
    )
  }

  // =========================================
  // UI
  // =========================================

  return (

    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <Link
            to="/customers"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Customers
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            {customer.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Customer portal and account history
          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/invoices/new?customerId=${customer.id}`
              )
            }
            className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Create Invoice
          </button>

          <button
            type="button"
            onClick={openWhatsApp}
            className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
          >
            WhatsApp
          </button>

        </div>

      </div>

      {/* CUSTOMER PROFILE */}

      <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
                👤
              </div>

              <div>

                <h2 className="text-xl font-bold">
                  {customer.name}
                </h2>

                <p className="text-sm text-slate-500">
                  {customer.type || 'Business'}
                </p>

              </div>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>

                <p className="text-xs uppercase text-slate-400">
                  GSTIN
                </p>

                <p className="mt-1 text-sm font-medium">
                  {customer.gstin || 'Not provided'}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm font-medium">
                  {customer.phone || 'Not provided'}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Email
                </p>

                <p className="mt-1 text-sm font-medium">
                  {customer.email || 'Not provided'}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Address
                </p>

                <p className="mt-1 text-sm font-medium">
                  {customer.address || 'Not provided'}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total Purchases
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {money(totalPurchases)}
          </h2>

        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total Paid
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {money(totalPaid)}
          </h2>

        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total Due
          </p>

          <h2 className="mt-2 text-2xl font-bold text-orange-600">
            {money(totalDue)}
          </h2>

        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Invoices
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {customerInvoices.length}
          </h2>

        </div>

      </div>

      {/* PURCHASE HISTORY */}

      <div className="mb-6 rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-lg font-bold">
            Purchase History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            All products purchased by this customer
          </p>

        </div>

        {customerInvoices.length === 0 ? (

          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No purchase history available.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>

                <tr className="bg-slate-50 text-left">

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Invoice
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Products
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-right text-xs uppercase text-slate-500">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {customerInvoices.map(invoice => {

                  const items =
                    invoice.items || []

                  const quantity =
                    items.reduce(
                      (total, item) =>
                        total +
                        Number(
                          item.quantity || 0
                        ),
                      0
                    )

                  const productNames =
                    items
                      .map(
                        item =>
                          item.productName ||
                          item.name ||
                          'Product'
                      )
                      .join(', ')

                  const total =
                    invoice.total ??
                    invoice.totalAmount ??
                    invoice.grandTotal ??
                    invoice.amount ??
                    0

                  return (

                    <tr
                      key={invoice.id}
                      className="border-t"
                    >

                      <td className="px-6 py-4 text-sm">
                        {invoice.createdAt
                          ? new Date(
                              invoice.createdAt
                            ).toLocaleDateString('en-IN')
                          : '-'}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        {invoice.invoiceNumber || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {productNames || 'No item details'}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {quantity || '-'}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-semibold">
                        {money(total)}
                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* CUSTOMER INVOICES */}

      <div className="mb-6 rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-lg font-bold">
            Customer-wise Invoices
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            All invoices created for {customer.name}
          </p>

        </div>

        {customerInvoices.length === 0 ? (

          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No invoices found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>

                <tr className="bg-slate-50 text-left">

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Invoice
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Total
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Paid
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Due
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs uppercase text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {customerInvoices.map(invoice => {

                  const total =
                    Number(
                      invoice.total ??
                      invoice.totalAmount ??
                      invoice.grandTotal ??
                      invoice.amount ??
                      0
                    )

                  const paid =
                    Number(
                      invoice.paidAmount ??
                      invoice.amountPaid ??
                      invoice.paid ??
                      0
                    )

                  const due =
                    Number(
                      invoice.balanceDue ??
                      Math.max(
                        0,
                        total - paid
                      )
                    )

                  const status =
                    due === 0
                      ? 'Paid'
                      : paid > 0
                        ? 'Partial'
                        : 'Unpaid'

                  return (

                    <tr
                      key={invoice.id}
                      className="border-t"
                    >

                      <td className="px-6 py-4 font-semibold">
                        {invoice.invoiceNumber || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {invoice.createdAt
                          ? new Date(
                              invoice.createdAt
                            ).toLocaleDateString('en-IN')
                          : '-'}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {money(total)}
                      </td>

                      <td className="px-6 py-4 text-sm text-green-600">
                        {money(paid)}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                        {money(due)}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={
                            status === 'Paid'
                              ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700'
                              : status === 'Partial'
                                ? 'rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700'
                                : 'rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700'
                          }
                        >
                          {status}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          {due > 0 && (

                            <button
                              type="button"
                              onClick={() =>
                                openPaymentForm(
                                  invoice
                                )
                              }
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white"
                            >
                              Receive Payment
                            </button>

                          )}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/invoices/${invoice.id}`
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-xs font-semibold"
                          >
                            View
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* PAYMENT HISTORY */}

      <div className="rounded-2xl border bg-white shadow-sm">

        <div className="border-b px-6 py-5">

          <h2 className="text-lg font-bold">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Payments received from this customer
          </p>

        </div>

        {customerPayments.length === 0 ? (

          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No payment history available.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead>

                <tr className="bg-slate-50 text-left">

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Invoice
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Method
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Reference
                  </th>

                  <th className="px-6 py-4 text-xs uppercase text-slate-500">
                    Notes
                  </th>

                </tr>

              </thead>

              <tbody>

                {customerPayments.map(payment => {

                  const invoice =
                    customerInvoices.find(
                      item =>
                        String(item.id) ===
                        String(payment.invoiceId)
                    )

                  return (

                    <tr
                      key={payment.id}
                      className="border-t"
                    >

                      <td className="px-6 py-4 text-sm">
                        {payment.date
                          ? new Date(
                              payment.date
                            ).toLocaleDateString('en-IN')
                          : '-'}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        {invoice?.invoiceNumber || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        {money(payment.amount)}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {payment.paymentMethod}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {payment.reference || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {payment.notes || '-'}
                      </td>

                    </tr>

                  )
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* PAYMENT MODAL */}

      {showPaymentForm && selectedInvoice && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="border-b px-6 py-5">

              <h2 className="text-xl font-bold">
                Receive Payment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Invoice {selectedInvoice.invoiceNumber || '-'}
              </p>

            </div>

            <form
              onSubmit={handlePaymentSubmit}
              className="space-y-5 p-6"
            >

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Amount (₹) *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="amount"
                  value={paymentForm.amount}
                  onChange={handlePaymentChange}
                  required
                  className="w-full rounded-xl border px-4 py-3"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={
                    paymentForm.paymentMethod
                  }
                  onChange={handlePaymentChange}
                  className="w-full rounded-xl border bg-white px-4 py-3"
                >

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="Cheque">
                    Cheque
                  </option>

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Payment Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={paymentForm.date}
                  onChange={handlePaymentChange}
                  className="w-full rounded-xl border px-4 py-3"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Reference
                </label>

                <input
                  name="reference"
                  value={
                    paymentForm.reference
                  }
                  onChange={handlePaymentChange}
                  placeholder="UPI ID / cheque number / transaction ID"
                  className="w-full rounded-xl border px-4 py-3"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={paymentForm.notes}
                  onChange={handlePaymentChange}
                  rows="3"
                  className="w-full rounded-xl border px-4 py-3"
                />

              </div>

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowPaymentForm(false)
                  }
                  className="rounded-xl border px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
                >
                  Save Payment
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}