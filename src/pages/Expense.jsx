import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Receipt,
  Trash2,
  X,
} from 'lucide-react'

const API_BASE = 'http://localhost:5000/api/expense'

export default function Expense() {
  // =====================================================
  // AUTH / USER
  // =====================================================

  const em = localStorage.getItem("userEmail")
  const token = localStorage.getItem("token")

  // =====================================================
  // STATE
  // =====================================================

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [paymentMethod, setPaymentMethod] =
    useState('Cash')

  // =====================================================
  // FETCH EXPENSES (on mount)
  // =====================================================

  const fetchExpenses = async () => {

    setLoading(true)
    setError('')

    try {
     
      const res = await fetch("http://localhost:5000/api/ex/get", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization" : `${token}`,
        },
        body: JSON.stringify({ em: em }),
      })
      console.log(em)

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const result = await res.json()

      const rows = Array.isArray(result)
        ? result
        : result?.expenses || []

      // Normalize backend field names to what the UI expects
      // backend fields: ex_title, cate, pay_m
      const normalized = rows.map((item) => ({
        id: item.id,
        title: item.title ?? item.ex_title ?? item.source ?? '',
        source: item.source ?? item.ex_title ?? item.title ?? '',
        amount: item.amount,
        category: item.category ?? item.cate ?? 'Other',
        date: item.date,
        paymentMethod: item.paymentMethod ?? item.pay_m ?? '',
      }))

      setExpenses(normalized)

    } catch (err) {

      console.error(err)
      setError('Failed to load expenses.')
      setExpenses([])

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

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
  // TOTAL EXPENSE
  // =====================================================

  const totalExpense = useMemo(() => {
    return expenses.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    )
  }, [expenses])

  // =====================================================
  // ADD EXPENSE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Please enter expense title')
      return
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      alert('Please enter a valid amount')
      return
    }

    if (!date) {
      alert('Please select a date.')
      return
    }

    const expenseData = {
      title: title.trim(),
      source: title.trim(),
      amount: Number(amount),
      category,
      date,
      paymentMethod,
    }

    setSubmitting(true)

    try {

      const res = await fetch(
        "http://localhost:5000/api/ex/add",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization" : `${token}`,
          },
          body: JSON.stringify({
            form: expenseData,
            em: em,
          }),
        }
      )

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      await fetchExpenses()

      // Reset
      setTitle('')
      setAmount('')
      setCategory('Food')
      setDate(
        new Date()
          .toISOString()
          .split('T')[0]
      )
      setPaymentMethod('Cash')
      setShowForm(false)

    } catch (err) {

      console.error(err)
      alert('Something went wrong while saving expense.')

    } finally {

      setSubmitting(false)
    }
  }

  // =====================================================
  // DELETE EXPENSE
  // =====================================================

  const deleteExpense = async (id) => {
    const confirmDelete =
      window.confirm(
        'Are you sure you want to delete this expense?'
      )

    if (!confirmDelete) return

    try {

      const res = await fetch(
        "http://localhost:5000/api/ex/delete",
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

      await fetchExpenses();

    } catch (err) {

      console.error(err)
      alert('Failed to delete expense.')
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Expenses
          </h1>

          <p className="text-slate-500 mt-1">
            Track and manage your expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(true)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />

          Add Expense
        </button>

      </div>

      {/* TOTAL EXPENSE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500">
              Total Expenses
            </p>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              {formatCurrency(
                totalExpense
              )}
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {expenses.length} total entries
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
            <Receipt size={28} />
          </div>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-200">

          <h2 className="text-lg font-semibold text-slate-800">
            Expense Entries
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Your expense records will appear here.
          </p>

        </div>

        {loading ? (

          <div className="p-10 text-center text-slate-500">
            Loading expenses...
          </div>

        ) : error ? (

          <div className="p-10 text-center text-red-600">
            {error}
          </div>

        ) : expenses.length === 0 ? (

          <div className="py-16 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <Receipt size={28} />
            </div>

            <h3 className="font-semibold text-slate-700 mt-4">
              No expenses yet
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Start by adding your first expense.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl"
            >
              Add Expense
            </button>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                    ID
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                    EXPENSE
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                    CATEGORY
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                    DATE
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500">
                    PAYMENT
                  </th>

                  <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500">
                    AMOUNT
                  </th>

                  <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500">
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {expenses.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 text-sm font-medium text-slate-500">
                        #{item.id}
                      </td>

                      <td className="px-5 py-4">

                        <p className="font-medium text-slate-800">
                          {item.title ||
                            item.source ||
                            'Expense'}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs">
                          {item.category ||
                            'Other'}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.date
                          ? new Date(
                              `${item.date}T00:00:00`
                            ).toLocaleDateString(
                              'en-IN'
                            )
                          : '-'}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.paymentMethod ||
                          '-'}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-red-600">
                        -
                        {formatCurrency(
                          item.amount
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            deleteExpense(
                              item.id
                            )
                          }
                          className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ADD EXPENSE MODAL */}
      {showForm && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Add Expense
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Enter your expense details.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >

              {/* TITLE */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expense Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Example: Grocery"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* AMOUNT */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="₹0"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* CATEGORY */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                >

                  <option value="Food">
                    Food
                  </option>

                  <option value="Travel">
                    Travel
                  </option>

                  <option value="Shopping">
                    Shopping
                  </option>

                  <option value="Bills">
                    Bills
                  </option>

                  <option value="Rent">
                    Rent
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Health">
                    Health
                  </option>

                  <option value="Entertainment">
                    Entertainment
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* DATE */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              {/* PAYMENT */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                >

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Debit Card">
                    Debit Card
                  </option>

                  <option value="Credit Card">
                    Credit Card
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                </select>

              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="flex-1 border border-slate-200 rounded-xl py-3 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}