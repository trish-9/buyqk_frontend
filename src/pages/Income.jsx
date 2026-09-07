import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  ArrowUpRight,
  X,
} from 'lucide-react'

import IncomeChart from '../components/IncomeChart'

const API_BASE = 'http://localhost:5000/api/income'

export default function Income() {
  // =====================================================
  // AUTH / USER
  // =====================================================

  const em = localStorage.getItem("userEmail")
  const token = localStorage.getItem("token")

  // =====================================================
  // STATE
  // =====================================================

  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [source, setSource] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [paymentMethod, setPaymentMethod] =
    useState('Cash')

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // =====================================================
  // FETCH INCOMES (on mount)
  // =====================================================

  const fetchIncomes = async () => {

    setLoading(true)
    setError('')

    try {

      const res = await fetch(`${API_BASE}/get`, {
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
        : result?.incomes || []
      const normalized = rows.map((item) => ({
      id: item.id,
      source: item.source ?? item.income_s ?? '',
      amount: item.amount,
      date: item.date,
      paymentMethod: item.paymentMethod ?? item.pay_m ?? '',
      }))

      setIncomes(normalized)

    } catch (err) {

      console.error(err)
      setError('Failed to load income.')
      setIncomes([])

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncomes()
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
  // TOTAL INCOME
  // =====================================================

  const totalIncome = useMemo(() => {
    return incomes.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    )
  }, [incomes])

  // =====================================================
  // CURRENT MONTH
  // =====================================================

  const currentDate = new Date()

  const currentMonthKey =
    `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}`

  // =====================================================
  // CURRENT MONTH INCOME
  // =====================================================

  const currentMonthIncome = useMemo(() => {
    return incomes
      .filter((item) =>
        item.date?.startsWith(
          currentMonthKey
        )
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      )
  }, [incomes, currentMonthKey])

  // =====================================================
  // PREVIOUS MONTH
  // =====================================================

  const previousMonthKey = useMemo(() => {
    const previousDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    )

    return `${previousDate.getFullYear()}-${String(
      previousDate.getMonth() + 1
    ).padStart(2, '0')}`
  }, [])

  // =====================================================
  // PREVIOUS MONTH INCOME
  // =====================================================

  const previousMonthIncome = useMemo(() => {
    return incomes
      .filter((item) =>
        item.date?.startsWith(
          previousMonthKey
        )
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      )
  }, [incomes, previousMonthKey])

  // =====================================================
  // INCOME CHANGE %
  // =====================================================

  const incomeChange = useMemo(() => {
    if (previousMonthIncome === 0) {
      if (currentMonthIncome > 0) {
        return 100
      }

      return 0
    }

    return (
      ((currentMonthIncome -
        previousMonthIncome) /
        previousMonthIncome) *
      100
    )
  }, [
    currentMonthIncome,
    previousMonthIncome,
  ])

  // =====================================================
  // CHART DATA
  // LAST 6 MONTHS
  // =====================================================

  const chartData = useMemo(() => {
    const months = []

    for (let i = 5; i >= 0; i--) {
      const chartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      )

      const year =
        chartDate.getFullYear()

      const month =
        chartDate.getMonth()

      const monthKey =
        `${year}-${String(
          month + 1
        ).padStart(2, '0')}`

      const amount = incomes
        .filter((item) =>
          item.date?.startsWith(
            monthKey
          )
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(item.amount || 0),
          0
        )

      months.push({
        month:
          chartDate.toLocaleString(
            'en-US',
            {
              month: 'short',
            }
          ),
        amount,
      })
    }

    return months
  }, [incomes])

  // =====================================================
  // ADD INCOME
  // =====================================================

  const handleAddIncome = async (event) => {
    event.preventDefault()

    if (!source.trim()) {
      alert('Please enter income source.')
      return
    }

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      alert(
        'Please enter a valid amount.'
      )
      return
    }

    if (!date) {
      alert('Please select a date.')
      return
    }

    const incomeData = {
      source: source.trim(),
      amount: Number(amount),
      date,
      paymentMethod,
    }

    setSubmitting(true)

    try {

      const res = await fetch(
        "http://localhost:5000/api/income/add",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization" : `${token}`,
            
          },
          body: JSON.stringify({
            form: incomeData,
            em: em,
          }),
        }
      )

      if (res.status != 200) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      await fetchIncomes()

      // RESET FORM
      setSource('')
      setAmount('')
      setDate(
        new Date()
          .toISOString()
          .split('T')[0]
      )
      setPaymentMethod('Cash')
      setShowForm(false)

    } catch (err) {

      console.error(err)
      alert('Something went wrong while saving income.')

    } finally {

      setSubmitting(false)
    }
  }

  // =====================================================
  // DELETE INCOME
  // =====================================================

  const handleDeleteIncome = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this income?'
    )

    if (!confirmed) {
      return
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/income/delete",
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

      await fetchIncomes()

    } catch (err) {

      console.error(err)
      alert('Failed to delete income.')
    }
  }

  // =====================================================
  // RECENT INCOME
  // =====================================================

  const recentIncomes = useMemo(() => {
    return [...incomes]
      .sort((a, b) => {
        return (
          new Date(b.date) -
          new Date(a.date)
        )
      })
      .slice(0, 10)
  }, [incomes])

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Income
          </h1>

          <p className="text-slate-500 mt-1">
            Track and manage all your income.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(true)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
        >
          <Plus size={18} />

          Add Income
        </button>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* TOTAL */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Income
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-2">
                {formatCurrency(
                  totalIncome
                )}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={22} />
            </div>

          </div>

          <p className="text-xs text-slate-500 mt-3">
            {incomes.length} total entries
          </p>

        </div>

        {/* MONTH */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                This Month
              </p>

              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(
                  currentMonthIncome
                )}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CalendarDays size={22} />
            </div>

          </div>

          <p className="text-xs text-slate-500 mt-3">
            {currentDate.toLocaleString(
              'en-US',
              {
                month: 'long',
                year: 'numeric',
              }
            )}
          </p>

        </div>

        {/* PREVIOUS */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Previous Month
              </p>

              <p className="text-2xl font-bold text-slate-800 mt-2">
                {formatCurrency(
                  previousMonthIncome
                )}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>

          </div>

          <p className="text-xs text-slate-500 mt-3">
            Previous month income
          </p>

        </div>

        {/* CHANGE */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Monthly Change
              </p>

              <p
                className={`text-2xl font-bold mt-2 ${
                  incomeChange >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {incomeChange >= 0
                  ? '+'
                  : ''}
                {incomeChange.toFixed(
                  1
                )}
                %
              </p>
            </div>

            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                incomeChange >= 0
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {incomeChange >= 0 ? (
                <TrendingUp
                  size={22}
                />
              ) : (
                <TrendingDown
                  size={22}
                />
              )}
            </div>

          </div>

          <p className="text-xs text-slate-500 mt-3">
            Compared with previous month
          </p>

        </div>

      </div>

      {/* =================================================
          CHART
      ================================================= */}

      <IncomeChart
        data={chartData}
      />

      {/* =================================================
          ADD INCOME FORM
      ================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">

            {/* FORM HEADER */}

            <div className="flex items-center justify-between p-5 border-b border-slate-200">

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Add Income
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add a new income transaction.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleAddIncome}
              className="p-5 space-y-4"
            >

              {/* SOURCE */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Income Source
                </label>

                <input
                  type="text"
                  value={source}
                  onChange={(e) =>
                    setSource(
                      e.target.value
                    )
                  }
                  placeholder="Salary, Freelance, Business..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* AMOUNT */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value
                    )
                  }
                  placeholder="Enter amount"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DATE */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* PAYMENT METHOD */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Method
                </label>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
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

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Add Income'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          INCOME TABLE
      ================================================= */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-200">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Recent Income
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your latest income transactions.
              </p>
            </div>

            <ArrowUpRight
              className="text-green-500"
              size={22}
            />

          </div>

        </div>

        {loading ? (

          <div className="p-10 text-center text-slate-500">
            Loading income...
          </div>

        ) : error ? (

          <div className="p-10 text-center text-red-600">
            {error}
          </div>

        ) : recentIncomes.length === 0 ? (

          <div className="p-10 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <Wallet size={28} />
            </div>

            <h3 className="font-semibold text-lg text-slate-800 mt-4">
              No income yet
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Add your first income transaction.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowForm(true)
              }
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl"
            >
              Add Income
            </button>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    ID
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Source
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Date
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Payment
                  </th>

                  <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Amount
                  </th>

                  <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {recentIncomes.map(
                  (item) => (

                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition"
                    >

                      <td className="px-5 py-4 text-sm font-medium text-slate-500">
                        #{item.id}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                            <ArrowUpRight
                              size={18}
                            />
                          </div>

                          <span className="font-medium text-slate-800">
                            {item.source ||
                              'Income'}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {item.date
                          ? new Date(
                              `${item.date}T00:00:00`
                            ).toLocaleDateString(
                              'en-IN'
                            )
                          : '-'}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {item.paymentMethod ||
                          '-'}
                      </td>

                      <td className="px-5 py-4 text-right">

                        <span className="font-semibold text-green-600">
                          +
                          {formatCurrency(
                            item.amount
                          )}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteIncome(
                              item.id
                            )
                          }
                          className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                          title="Delete income"
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

    </div>
  )
}