
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  FileText,
  Wallet,
  Package,
  Users,
  Truck,
  AlertTriangle,
  ShoppingCart,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Bot,
  Send,
  X,
  Sparkles,
  ChevronDown,
  CalendarDays,
  CalendarRange,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CreditCard,
  Bell,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Receipt,
  Percent,
  Activity,
  Lightbulb,
  Target,
} from 'lucide-react'

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

import { useFinance } from '../context/FinanceContext'

const RANGE_OPTIONS = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-30', label: 'Last 30 Days' },
  { value: 'this-year', label: 'This Year' },
  { value: 'all-time', label: 'All Time' },
]

const CHART_OPTIONS = [
  { value: 'income-expense', label: 'Income vs Expenses' },
  { value: 'net-flow', label: 'Net Cash Flow' },
  { value: 'expense-trend', label: 'Expense Trend' },
]

const CHART_TYPES = [
  { value: 'bar', label: 'Bar', icon: BarChart3 },
  { value: 'line', label: 'Line', icon: LineChartIcon },
  { value: 'area', label: 'Area', icon: TrendingUp },
]

const PIE_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#64748b',
]

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function parseDate(value) {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const text = String(value).trim()

  // Supports DD/MM/YYYY and DD-MM-YYYY
  const dayFirst = text.match(
    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
  )

  if (dayFirst) {
    const [, day, month, year] = dayFirst

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    )

    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(text)

  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfDay(date) {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

function getRangeBounds(range) {
  const today = new Date()

  const currentStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )

  const currentEnd = endOfDay(today)

  if (range === 'this-month') {
    return {
      start: currentStart,
      end: currentEnd,
    }
  }

  if (range === 'last-month') {
    return {
      start: new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      ),
      end: new Date(
        today.getFullYear(),
        today.getMonth(),
        0,
        23,
        59,
        59,
        999
      ),
    }
  }

  if (range === 'last-30') {
    const start = new Date(today)
    start.setDate(start.getDate() - 29)

    return {
      start: startOfDay(start),
      end: currentEnd,
    }
  }

  if (range === 'this-year') {
    return {
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(
        today.getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999
      ),
    }
  }

  return {
    start: null,
    end: null,
  }
}

function dateInRange(value, bounds) {
  if (!bounds.start && !bounds.end) return true

  const date = parseDate(value)

  if (!date) return false

  return date >= bounds.start && date <= bounds.end
}

function getItemDate(item, type) {
  if (type === 'invoice') {
    return (
      item?.invoiceDate ||
      item?.date ||
      item?.createdAt
    )
  }

  return item?.date || item?.createdAt
}

function formatCompactCurrency(value) {
  const amount = Math.abs(toNumber(value))

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }

  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const finance = useFinance() || {}

  const {
    incomes = [],
    expenses = [],
    invoices = [],
    products = [],
    customers = [],
    vendors = [],
    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
    totalProducts = products.length,
    totalStockUnits = 0,
    lowStockProducts = [],
    inventoryPurchaseValue = 0,
    inventorySellingValue = 0,
    customerOutstanding = 0,
    vendorOutstanding = 0,
  } = finance

  const [range, setRange] = useState('all-time')
  const [chartMode, setChartMode] = useState(
    'income-expense'
  )
  const [chartType, setChartType] = useState('bar')

  const [chatOpen, setChatOpen] = useState(true)
  const [message, setMessage] = useState('')

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text:
        'Hi! I am your BuyQK business assistant. Ask me about income, expenses, invoices, customers, products, stock, vendors or outstanding payments.',
    },
  ])

  const userName =
    localStorage.getItem('userName') || 'Merchant'

  const formatCurrency = (value) =>
    `₹${toNumber(value).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    })}`

  const selectedRangeLabel =
    RANGE_OPTIONS.find(
      (item) => item.value === range
    )?.label || 'This Month'

  const bounds = useMemo(
    () => getRangeBounds(range),
    [range]
  )

  /* =========================
     FILTERED DATA
  ========================= */

  const filteredIncomes = useMemo(
    () =>
      incomes.filter((item) =>
        dateInRange(
          getItemDate(item, 'income'),
          bounds
        )
      ),
    [incomes, bounds]
  )

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((item) =>
        dateInRange(
          getItemDate(item, 'expense'),
          bounds
        )
      ),
    [expenses, bounds]
  )

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((item) =>
        dateInRange(
          getItemDate(item, 'invoice'),
          bounds
        )
      ),
    [invoices, bounds]
  )

  /* =========================
     INCOME / EXPENSE
  ========================= */

  const periodIncome = useMemo(
    () =>
      filteredIncomes.reduce(
        (sum, item) => sum + toNumber(item.amount),
        0
      ),
    [filteredIncomes]
  )

  const periodExpense = useMemo(
    () =>
      filteredExpenses.reduce(
        (sum, item) => sum + toNumber(item.amount),
        0
      ),
    [filteredExpenses]
  )

  const periodBalance = periodIncome - periodExpense
  const profitLoss = periodBalance

  const profitMargin =
    periodIncome > 0
      ? (profitLoss / periodIncome) * 100
      : 0

  const isProfit = profitLoss >= 0

  /* =========================
     EXPENSE BREAKDOWN
  ========================= */

  const expenseBreakdown = useMemo(() => {
    const totals = {}

    filteredExpenses.forEach((item) => {
      const category =
        item.category ||
        item.type ||
        item.title ||
        item.source ||
        'Other'

      totals[category] =
        (totals[category] || 0) +
        toNumber(item.amount)
    })

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [filteredExpenses])

  /* =========================
     MONTHLY CHART DATA
  ========================= */

  const monthlyChartData = useMemo(() => {
    const now = new Date()
    const months = []

    let count = 12
    let startMonth = now.getMonth() - 11

    if (
      range === 'this-month' ||
      range === 'last-month'
    ) {
      count = 1

      startMonth =
        range === 'this-month'
          ? now.getMonth()
          : now.getMonth() - 1
    } else if (range === 'last-30') {
      count = 2
      startMonth = now.getMonth() - 1
    } else if (range === 'this-year') {
      count = 12
      startMonth = 0
    }

    for (let i = 0; i < count; i += 1) {
      const monthDate = new Date(
        now.getFullYear(),
        startMonth + i,
        1
      )

      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      const income = incomes
        .filter((item) => {
          const date = parseDate(
            getItemDate(item, 'income')
          )

          return (
            date &&
            date.getFullYear() === year &&
            date.getMonth() === month
          )
        })
        .reduce(
          (sum, item) =>
            sum + toNumber(item.amount),
          0
        )

      const expense = expenses
        .filter((item) => {
          const date = parseDate(
            getItemDate(item, 'expense')
          )

          return (
            date &&
            date.getFullYear() === year &&
            date.getMonth() === month
          )
        })
        .reduce(
          (sum, item) =>
            sum + toNumber(item.amount),
          0
        )

      months.push({
        month: monthDate.toLocaleString(
          'en-IN',
          {
            month: 'short',
          }
        ),
        income,
        expense,
        net: income - expense,
      })
    }

    return months
  }, [incomes, expenses, range])

  /* =========================
     EXPENSE TREND
  ========================= */

  const expenseTrendData = useMemo(() => {
    if (
      range === 'this-month' ||
      range === 'last-month'
    ) {
      const date =
        range === 'this-month'
          ? new Date()
          : new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1
            )

      return [
        {
          month: date.toLocaleString('en-IN', {
            month: 'short',
          }),
          expense: periodExpense,
        },
      ]
    }

    return monthlyChartData.map((item) => ({
      month: item.month,
      expense: item.expense,
    }))
  }, [
    monthlyChartData,
    periodExpense,
    range,
  ])

  const chartData =
    chartMode === 'expense-trend'
      ? expenseTrendData
      : monthlyChartData

  /* =========================
     RECENT TRANSACTIONS
  ========================= */

  const recentTransactions = useMemo(() => {
    const incomeItems = filteredIncomes.map(
      (item) => ({
        id: `income-${item.id}`,
        type: 'income',
        title:
          item.source ||
          item.title ||
          'Income',
        amount: toNumber(item.amount),
        date: getItemDate(item, 'income'),
      })
    )

    const expenseItems = filteredExpenses.map(
      (item) => ({
        id: `expense-${item.id}`,
        type: 'expense',
        title:
          item.title ||
          item.source ||
          item.category ||
          'Expense',
        amount: toNumber(item.amount),
        date: getItemDate(item, 'expense'),
      })
    )

    const invoiceItems = filteredInvoices.map(
      (item) => ({
        id: `invoice-${item.id}`,
        type: 'invoice',
        title:
          item.customer ||
          item.invoiceNumber ||
          'Invoice',
        amount: toNumber(
          item.total ??
            item.totalAmount ??
            item.grandTotal ??
            item.amount
        ),
        date: getItemDate(item, 'invoice'),
      })
    )

    return [
      ...incomeItems,
      ...expenseItems,
      ...invoiceItems,
    ]
      .sort(
        (a, b) =>
          (parseDate(b.date)?.getTime() || 0) -
          (parseDate(a.date)?.getTime() || 0)
      )
      .slice(0, 6)
  }, [
    filteredIncomes,
    filteredExpenses,
    filteredInvoices,
  ])

  /* =========================
     INVOICE STATS
  ========================= */

  const pendingInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const total = toNumber(
          invoice.total ??
            invoice.totalAmount ??
            invoice.grandTotal ??
            invoice.amount
        )

        const paid = toNumber(
          invoice.paidAmount ??
            invoice.amountPaid ??
            invoice.paid
        )

        return Math.max(0, total - paid) > 0
      }),
    [invoices]
  )

  const invoiceStats = useMemo(() => {
    let paid = 0
    let pending = 0
    let overdue = 0
    let total = 0

    invoices.forEach((invoice) => {
      const invoiceTotal = toNumber(
        invoice.total ??
          invoice.totalAmount ??
          invoice.grandTotal ??
          invoice.amount
      )

      const paidAmount = toNumber(
        invoice.paidAmount ??
          invoice.amountPaid ??
          invoice.paid
      )

      const remaining = Math.max(
        0,
        invoiceTotal - paidAmount
      )

      total += invoiceTotal

      if (remaining <= 0) {
        paid += 1
      } else {
        pending += 1

        const dueDate = parseDate(
          invoice.dueDate ||
            invoice.paymentDueDate ||
            invoice.invoiceDueDate
        )

        const invoiceDate = parseDate(
          getItemDate(invoice, 'invoice')
        )

        const comparisonDate =
          dueDate || invoiceDate

        if (
          comparisonDate &&
          comparisonDate.getTime() <
            startOfDay(new Date()).getTime()
        ) {
          overdue += 1
        }
      }
    })

    return {
      total,
      paid,
      pending,
      overdue,
    }
  }, [invoices])

  /* =========================
     NOTIFICATIONS
  ========================= */

  const notifications = useMemo(() => {
    const list = []

    if (lowStockProducts.length > 0) {
      list.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts.length} product${
          lowStockProducts.length === 1
            ? ''
            : 's'
        } need restocking.`,
        action: '/inventory',
        icon: Package,
      })
    }

    if (invoiceStats.overdue > 0) {
      list.push({
        id: 'overdue',
        type: 'danger',
        title: 'Overdue Invoices',
        message: `${invoiceStats.overdue} invoice${
          invoiceStats.overdue === 1
            ? ''
            : 's'
        } are overdue.`,
        action: '/invoices',
        icon: CircleAlert,
      })
    }

    if (invoiceStats.pending > 0) {
      list.push({
        id: 'pending',
        type: 'info',
        title: 'Pending Payments',
        message: `${invoiceStats.pending} invoice${
          invoiceStats.pending === 1
            ? ''
            : 's'
        } have an outstanding amount.`,
        action: '/invoices',
        icon: Clock3,
      })
    }

    if (profitLoss < 0) {
      list.push({
        id: 'loss',
        type: 'danger',
        title: 'Loss Detected',
        message: `${selectedRangeLabel} has a net loss of ${formatCurrency(
          Math.abs(profitLoss)
        )}.`,
        action: '/expenses',
        icon: TrendingDown,
      })
    } else if (periodIncome > 0) {
      list.push({
        id: 'profit',
        type: 'success',
        title: 'Business is Profitable',
        message: `Net profit is ${formatCurrency(
          profitLoss
        )}.`,
        action: '/income',
        icon: CheckCircle2,
      })
    }

    return list
  }, [
    lowStockProducts,
    invoiceStats,
    profitLoss,
    periodIncome,
    selectedRangeLabel,
  ])

  /* =========================
     INVENTORY
  ========================= */

  const inventoryValue =
    toNumber(inventoryPurchaseValue)

  const inventorySaleValue =
    toNumber(inventorySellingValue)

  const stockMargin =
    inventorySaleValue - inventoryValue

  const topInventory = useMemo(
    () =>
      [...products]
        .sort(
          (a, b) =>
            toNumber(b.currentStock) *
              toNumber(b.sellingPrice) -
            toNumber(a.currentStock) *
              toNumber(a.sellingPrice)
        )
        .slice(0, 5),
    [products]
  )

  /* =========================
     GOALS
  ========================= */

  const [incomeGoal, setIncomeGoal] =
    useState(
      () =>
        Number(
          localStorage.getItem(
            'buyqk_income_goal'
          )
        ) || 100000
    )

  const [expenseLimit, setExpenseLimit] =
    useState(
      () =>
        Number(
          localStorage.getItem(
            'buyqk_expense_limit'
          )
        ) || 50000
    )

  const [profitGoal, setProfitGoal] =
    useState(
      () =>
        Number(
          localStorage.getItem(
            'buyqk_profit_goal'
          )
        ) || 50000
    )

  /* =========================
     FORECAST
  ========================= */

  const forecastData = useMemo(() => {
    const sample =
      monthlyChartData
        .filter(
          (item) =>
            item.income > 0 ||
            item.expense > 0
        )
        .slice(-3)

    const avgIncome = sample.length
      ? sample.reduce(
          (sum, item) =>
            sum + item.income,
          0
        ) / sample.length
      : periodIncome

    const avgExpense = sample.length
      ? sample.reduce(
          (sum, item) =>
            sum + item.expense,
          0
        ) / sample.length
      : periodExpense

    return {
      avgIncome,
      avgExpense,
      predictedProfit:
        avgIncome - avgExpense,
    }
  }, [
    monthlyChartData,
    periodIncome,
    periodExpense,
  ])

  /* =========================
     PREVIOUS MONTH
  ========================= */

  const previousMonthComparison =
    useMemo(() => {
      const now = new Date()

      const prev = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      )

      const totalForMonth = (
        items,
        type
      ) =>
        items
          .filter((item) => {
            const d = parseDate(
              getItemDate(item, type)
            )

            return (
              d &&
              d.getFullYear() ===
                prev.getFullYear() &&
              d.getMonth() ===
                prev.getMonth()
            )
          })
          .reduce(
            (sum, item) =>
              sum + toNumber(item.amount),
            0
          )

      const income = totalForMonth(
        incomes,
        'income'
      )

      const expense = totalForMonth(
        expenses,
        'expense'
      )

      const profit = income - expense

      const change = (current, old) => {
        if (old === 0) {
          return current === 0 ? 0 : 100
        }

        return (
          ((current - old) /
            Math.abs(old)) *
          100
        )
      }

      return {
        income,
        expense,
        profit,
        incomeChange: change(
          periodIncome,
          income
        ),
        expenseChange: change(
          periodExpense,
          expense
        ),
        profitChange: change(
          profitLoss,
          profit
        ),
      }
    }, [
      incomes,
      expenses,
      periodIncome,
      periodExpense,
      profitLoss,
    ])

  /* =========================
     FINANCIAL HEALTH
  ========================= */

  const financialHealth = useMemo(() => {
    const profitability =
      periodIncome > 0
        ? Math.max(
            0,
            Math.min(
              100,
              profitMargin * 2
            )
          )
        : 0

    const cashFlow =
      periodIncome > 0
        ? Math.max(
            0,
            Math.min(
              100,
              ((periodIncome -
                periodExpense) /
                periodIncome) *
                50 +
                50
            )
          )
        : 50

    const collection = invoices.length
      ? (invoiceStats.paid /
          invoices.length) *
        100
      : 50

    const inventory = totalProducts
      ? Math.max(
          0,
          100 -
            (lowStockProducts.length /
              totalProducts) *
              100
        )
      : 50

    return Math.round(
      (profitability +
        cashFlow +
        collection +
        inventory) /
        4
    )
  }, [
    periodIncome,
    periodExpense,
    profitMargin,
    invoices.length,
    invoiceStats.paid,
    totalProducts,
    lowStockProducts.length,
  ])

  /* =========================
     GOAL PROGRESS
  ========================= */

  const goalProgress = {
    income:
      incomeGoal > 0
        ? Math.min(
            100,
            (periodIncome /
              incomeGoal) *
              100
          )
        : 0,

    expense:
      expenseLimit > 0
        ? Math.min(
            100,
            (periodExpense /
              expenseLimit) *
              100
          )
        : 0,

    profit:
      profitGoal > 0
        ? Math.min(
            100,
            (Math.max(0, profitLoss) /
              profitGoal) *
              100
          )
        : 0,
  }

  const saveGoals = () => {
    localStorage.setItem(
      'buyqk_income_goal',
      String(incomeGoal)
    )

    localStorage.setItem(
      'buyqk_expense_limit',
      String(expenseLimit)
    )

    localStorage.setItem(
      'buyqk_profit_goal',
      String(profitGoal)
    )
  }

  /* =========================
     AI INSIGHTS
  ========================= */

  const insights = useMemo(() => {
    const list = []

    if (profitLoss < 0) {
      list.push(
        `You have a net loss of ${formatCurrency(
          Math.abs(profitLoss)
        )}. Review your largest expenses.`
      )
    } else if (profitMargin >= 25) {
      list.push(
        `Strong profit margin of ${profitMargin.toFixed(
          1
        )}%. Keep your expense control consistent.`
      )
    } else if (periodIncome > 0) {
      list.push(
        `Profit margin is ${profitMargin.toFixed(
          1
        )}%. Look for ways to increase income or reduce major costs.`
      )
    }

    if (invoiceStats.overdue > 0) {
      list.push(
        `${invoiceStats.overdue} invoice(s) are overdue. Follow up to improve cash flow.`
      )
    }

    if (lowStockProducts.length > 0) {
      list.push(
        `${lowStockProducts.length} product(s) need restocking.`
      )
    }

    if (
      previousMonthComparison.incomeChange <
      -10
    ) {
      list.push(
        `Income is down ${Math.abs(
          previousMonthComparison.incomeChange
        ).toFixed(
          1
        )}% from last month.`
      )
    }

    if (
      previousMonthComparison.expenseChange >
      15
    ) {
      list.push(
        `Expenses are up ${previousMonthComparison.expenseChange.toFixed(
          1
        )}% from last month.`
      )
    }

    if (!list.length) {
      list.push(
        'No major warning signals were detected. Keep monitoring profit, collections and stock.'
      )
    }

    return list.slice(0, 4)
  }, [
    profitLoss,
    profitMargin,
    periodIncome,
    invoiceStats.overdue,
    lowStockProducts.length,
    previousMonthComparison,
  ])

  /* =========================
     CHATBOT
  ========================= */

  const addBotMessage = (text) => {
    setMessages((previous) => [
      ...previous,
      {
        id: Date.now() + Math.random(),
        type: 'bot',
        text,
      },
    ])
  }

  const answerQuestion = (text) => {
    const lower = text.toLowerCase()

    if (
      lower.includes('summary') ||
      lower.includes('overview')
    ) {
      return `For ${selectedRangeLabel}: income is ${formatCurrency(
        periodIncome
      )}, expenses are ${formatCurrency(
        periodExpense
      )}, and net balance is ${formatCurrency(
        periodBalance
      )}. You have ${
        filteredInvoices.length
      } invoices in this period.`
    }

    if (
      lower.includes('income') ||
      lower.includes('revenue')
    ) {
      return `${selectedRangeLabel} income is ${formatCurrency(
        periodIncome
      )}. Overall recorded income is ${formatCurrency(
        totalIncome
      )}.`
    }

    if (
      lower.includes('expense') ||
      lower.includes('spend')
    ) {
      return `${selectedRangeLabel} expenses are ${formatCurrency(
        periodExpense
      )}. The biggest categories are ${
        expenseBreakdown
          .slice(0, 3)
          .map((item) => item.name)
          .join(', ') ||
        'not available yet'
      }.`
    }

    if (lower.includes('invoice')) {
      return `There are ${
        invoices.length
      } invoices in total, ${
        invoiceStats.paid
      } paid, ${
        invoiceStats.pending
      } pending, and ${
        invoiceStats.overdue
      } overdue. Total invoice value is ${formatCurrency(
        invoiceStats.total
      )}.`
    }

    if (lower.includes('customer')) {
      return `You have ${customers.length} customers. Total customer outstanding is ${formatCurrency(
        customerOutstanding
      )}.`
    }

    if (
      lower.includes('product') ||
      lower.includes('stock') ||
      lower.includes('inventory')
    ) {
      return `You have ${totalProducts} products and ${toNumber(
        totalStockUnits
      ).toLocaleString(
        'en-IN'
      )} stock units. ${
        lowStockProducts.length
      } products are at or below their reorder point.`
    }

    if (lower.includes('vendor')) {
      return `You have ${vendors.length} vendors. Total vendor outstanding is ${formatCurrency(
        vendorOutstanding
      )}.`
    }

    if (
      lower.includes('loss') ||
      lower.includes('profit')
    ) {
      return `For ${selectedRangeLabel}, income is ${formatCurrency(
        periodIncome
      )}, expenses are ${formatCurrency(
        periodExpense
      )}, and your ${
        isProfit
          ? 'net profit'
          : 'net loss'
      } is ${formatCurrency(
        Math.abs(profitLoss)
      )}. Profit margin is ${profitMargin.toFixed(
        1
      )}%.`
    }

    if (
      lower.includes('balance') ||
      lower.includes('cash flow')
    ) {
      return `For ${selectedRangeLabel}, your net balance is ${formatCurrency(
        periodBalance
      )}. Overall dashboard balance is ${formatCurrency(
        balance
      )}.`
    }

    if (
      lower.includes('payment') ||
      lower.includes('receivable') ||
      lower.includes('outstanding')
    ) {
      return `Customer outstanding is ${formatCurrency(
        customerOutstanding
      )}, vendor outstanding is ${formatCurrency(
        vendorOutstanding
      )}, and ${
        pendingInvoices.length
      } invoices currently have a balance due.`
    }

    if (
      lower.includes('low stock') ||
      lower.includes('reorder')
    ) {
      return lowStockProducts.length
        ? `You have ${lowStockProducts.length} low-stock products. Check the Low Stock Alerts section or open Inventory for the exact items.`
        : 'You currently have no products below their reorder point.'
    }

    if (
      lower.includes('notification') ||
      lower.includes('alert')
    ) {
      return notifications.length
        ? `You have ${
            notifications.length
          } active notification${
            notifications.length === 1
              ? ''
              : 's'
          }: ${notifications
            .map((item) => item.title)
            .join(', ')}.`
        : 'You have no active business notifications right now.'
    }

    if (
      lower.includes('forecast') ||
      lower.includes('predict')
    ) {
      return `Forecast: income ${formatCurrency(
        forecastData.avgIncome
      )}, expenses ${formatCurrency(
        forecastData.avgExpense
      )}, predicted profit ${formatCurrency(
        forecastData.predictedProfit
      )}.`
    }

    if (
      lower.includes('financial health') ||
      lower.includes('health score')
    ) {
      return `Your financial health score is ${financialHealth}/100, based on profitability, cash flow, invoice collection and inventory health.`
    }

    if (
      lower.includes('compare') ||
      lower.includes('last month')
    ) {
      return `Compared with last month: income ${
        previousMonthComparison.incomeChange >=
        0
          ? 'increased'
          : 'decreased'
      } ${Math.abs(
        previousMonthComparison.incomeChange
      ).toFixed(
        1
      )}%, expenses ${
        previousMonthComparison.expenseChange >=
        0
          ? 'increased'
          : 'decreased'
      } ${Math.abs(
        previousMonthComparison.expenseChange
      ).toFixed(
        1
      )}%, and profit ${
        previousMonthComparison.profitChange >=
        0
          ? 'increased'
          : 'decreased'
      } ${Math.abs(
        previousMonthComparison.profitChange
      ).toFixed(1)}%.`
    }

    if (
      lower.includes('recommend') ||
      lower.includes('improve') ||
      lower.includes('suggestion')
    ) {
      return insights.join(' ')
    }

    if (
      lower.includes('goal') ||
      lower.includes('target')
    ) {
      return `Goals: income ${formatCurrency(
        incomeGoal
      )}, expense limit ${formatCurrency(
        expenseLimit
      )}, profit ${formatCurrency(
        profitGoal
      )}. Progress: income ${goalProgress.income.toFixed(
        0
      )}%, expense limit used ${goalProgress.expense.toFixed(
        0
      )}%, profit ${goalProgress.profit.toFixed(
        0
      )}%.`
    }

    if (
      lower.includes('help') ||
      lower.includes('what can you do')
    ) {
      return 'I can show income, expenses, balance, invoice status, customer/vendor outstanding, product count, stock, low-stock alerts, and your dashboard summary. Try “show my expenses” or “how many invoices are pending?”.'
    }

    return 'I can help with your accounting data. Try asking: “show my income”, “show my expenses”, “pending invoices”, “customer outstanding”, “low stock”, “product count”, or “business summary”.'
  }

  const sendMessage = () => {
    const text = message.trim()

    if (!text) return

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        type: 'user',
        text,
      },
    ])

    setMessage('')

    window.setTimeout(() => {
      addBotMessage(answerQuestion(text))
    }, 250)
  }

  const runQuickQuestion = (text) => {
    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        type: 'user',
        text,
      },
    ])

    window.setTimeout(
      () => addBotMessage(answerQuestion(text)),
      200
    )
  }

  /* =========================
     CHART RENDER
  ========================= */

  const renderChart = () => {
    if (chartMode === 'income-expense') {
      if (chartType === 'line') {
        return (
          <LineChart data={monthlyChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={
                formatCompactCurrency
              }
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(value)
              }
            />

            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3 }}
            />

            <Line
              type="monotone"
              dataKey="expense"
              name="Expenses"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        )
      }

      if (chartType === 'area') {
        return (
          <AreaChart data={monthlyChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={
                formatCompactCurrency
              }
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(value)
              }
            />

            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.16}
            />

            <Area
              type="monotone"
              dataKey="expense"
              name="Expenses"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.12}
            />
          </AreaChart>
        )
      }

      return (
        <BarChart
          data={monthlyChartData}
          barGap={6}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={
              formatCompactCurrency
            }
          />

          <Tooltip
            formatter={(value) =>
              formatCurrency(value)
            }
          />

          <Bar
            dataKey="income"
            name="Income"
            fill="#10b981"
            radius={[5, 5, 0, 0]}
          />

          <Bar
            dataKey="expense"
            name="Expenses"
            fill="#ef4444"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      )
    }

    if (chartMode === 'net-flow') {
      if (chartType === 'line') {
        return (
          <LineChart data={monthlyChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={
                formatCompactCurrency
              }
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(value)
              }
            />

            <Line
              type="monotone"
              dataKey="net"
              name="Net Cash Flow"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        )
      }

      if (chartType === 'area') {
        return (
          <AreaChart data={monthlyChartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={
                formatCompactCurrency
              }
            />

            <Tooltip
              formatter={(value) =>
                formatCurrency(value)
              }
            />

            <Area
              type="monotone"
              dataKey="net"
              name="Net Cash Flow"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.14}
            />
          </AreaChart>
        )
      }

      return (
        <BarChart data={monthlyChartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={
              formatCompactCurrency
            }
          />

          <Tooltip
            formatter={(value) =>
              formatCurrency(value)
            }
          />

          <Bar
            dataKey="net"
            name="Net Cash Flow"
            fill="#f97316"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      )
    }

    if (chartType === 'line') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={
              formatCompactCurrency
            }
          />

          <Tooltip
            formatter={(value) =>
              formatCurrency(value)
            }
          />

          <Line
            type="monotone"
            dataKey="expense"
            name="Expenses"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 3 }}
          />
        </LineChart>
      )
    }

    if (chartType === 'area') {
      return (
        <AreaChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={
              formatCompactCurrency
            }
          />

          <Tooltip
            formatter={(value) =>
              formatCurrency(value)
            }
          />

          <Area
            type="monotone"
            dataKey="expense"
            name="Expenses"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.14}
          />
        </AreaChart>
      )
    }

    return (
      <BarChart data={chartData}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={
            formatCompactCurrency
          }
        />

        <Tooltip
          formatter={(value) =>
            formatCurrency(value)
          }
        />

        <Bar
          dataKey="expense"
          name="Expenses"
          fill="#ef4444"
          radius={[5, 5, 0, 0]}
        />
      </BarChart>
    )
  }

  return (
    <div className="space-y-5 pb-8">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Welcome, {userName} 👋
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Your business overview, cash flow and accounting activity in one place.
          </p>
        </div>

        <div className="relative">
          <select
            value={range}
            onChange={(event) =>
              setRange(event.target.value)
            }
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-orange-400"
          >
            {RANGE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <CalendarDays
            size={17}
            className="absolute left-3 top-3 text-slate-400 pointer-events-none"
          />

          <ChevronDown
            size={15}
            className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Income
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(periodIncome)}
              </h2>

              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <ArrowUpRight size={14} />
                {selectedRangeLabel}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp
                size={21}
                className="text-green-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Expenses
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(periodExpense)}
              </h2>

              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <ArrowDownRight size={14} />
                {selectedRangeLabel}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown
                size={21}
                className="text-red-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Invoices
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                {filteredInvoices.length}
              </h2>

              <p className="text-xs text-orange-500 mt-2">
                {pendingInvoices.length} pending overall
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
              <FileText
                size={21}
                className="text-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Net Balance
              </p>

              <h2
                className={`text-2xl font-bold mt-2 ${
                  periodBalance >= 0
                    ? 'text-slate-900'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(periodBalance)}
              </h2>

              <p className="text-xs text-blue-500 mt-2">
                Overall: {formatCurrency(balance)}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <Wallet
                size={21}
                className="text-blue-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* =========================
          NOTIFICATIONS
      ========================= */}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Bell
                size={20}
                className="text-orange-500"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Notifications
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Important updates from your business
              </p>
            </div>

          </div>

          <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
            {notifications.length} alert
            {notifications.length === 1
              ? ''
              : 's'}
          </span>

        </div>

        {notifications.length === 0 ? (
          <div className="mt-5 p-5 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">

            <CheckCircle2
              size={22}
              className="text-green-600"
            />

            <div>
              <p className="text-sm font-semibold text-green-700">
                Everything looks good
              </p>

              <p className="text-xs text-green-600 mt-1">
                No important alerts right now.
              </p>
            </div>

          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

            {notifications.map(
              (notification) => {
                const Icon =
                  notification.icon

                const styles = {
                  warning: {
                    box: 'bg-orange-50 border-orange-100',
                    icon: 'bg-white text-orange-500',
                    title: 'text-orange-700',
                    text: 'text-orange-600',
                  },

                  danger: {
                    box: 'bg-red-50 border-red-100',
                    icon: 'bg-white text-red-500',
                    title: 'text-red-700',
                    text: 'text-red-600',
                  },

                  info: {
                    box: 'bg-blue-50 border-blue-100',
                    icon: 'bg-white text-blue-500',
                    title: 'text-blue-700',
                    text: 'text-blue-600',
                  },

                  success: {
                    box: 'bg-green-50 border-green-100',
                    icon: 'bg-white text-green-500',
                    title: 'text-green-700',
                    text: 'text-green-600',
                  },
                }

                const style =
                  styles[
                    notification.type
                  ] || styles.info

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        notification.action
                      )
                    }
                    className={`text-left p-4 rounded-xl border ${style.box} hover:shadow-sm transition`}
                  >
                    <div className="flex items-start gap-3">

                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.icon}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">

                        <p
                          className={`text-sm font-semibold ${style.title}`}
                        >
                          {notification.title}
                        </p>

                        <p
                          className={`text-xs mt-1 ${style.text}`}
                        >
                          {notification.message}
                        </p>

                        <p
                          className={`text-[10px] font-semibold mt-2 ${style.text}`}
                        >
                          Open →
                        </p>

                      </div>

                    </div>
                  </button>
                )
              }
            )}

          </div>
        )}

      </div>

      {/* =========================
          PROFIT & LOSS + INVOICE STATUS
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Profit & Loss
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {selectedRangeLabel}
              </p>
            </div>

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isProfit
                  ? 'bg-green-50'
                  : 'bg-red-50'
              }`}
            >
              {isProfit ? (
                <TrendingUp
                  size={20}
                  className="text-green-600"
                />
              ) : (
                <TrendingDown
                  size={20}
                  className="text-red-500"
                />
              )}
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">

            <div className="p-4 rounded-xl bg-green-50">
              <p className="text-xs text-slate-500">
                Total Income
              </p>

              <p className="text-lg font-bold text-green-700 mt-1">
                {formatCurrency(periodIncome)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-red-50">
              <p className="text-xs text-slate-500">
                Total Expenses
              </p>

              <p className="text-lg font-bold text-red-600 mt-1">
                {formatCurrency(periodExpense)}
              </p>
            </div>

          </div>

          <div
            className={`mt-3 p-4 rounded-xl border ${
              isProfit
                ? 'bg-green-50 border-green-100'
                : 'bg-red-50 border-red-100'
            }`}
          >

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-600">
                {isProfit
                  ? 'Net Profit'
                  : 'Net Loss'}
              </span>

              <span
                className={`text-xl font-bold ${
                  isProfit
                    ? 'text-green-700'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(
                  Math.abs(profitLoss)
                )}
              </span>

            </div>

            <div className="flex items-center justify-between mt-3">

              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Percent size={13} />
                Profit Margin
              </span>

              <span
                className={`text-sm font-bold ${
                  profitMargin >= 0
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {profitMargin.toFixed(1)}%
              </span>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Invoice Status
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Payment collection overview
              </p>
            </div>

            <Receipt
              size={20}
              className="text-orange-500"
            />

          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">

            <button
              type="button"
              onClick={() =>
                navigate('/invoices')
              }
              className="p-4 rounded-xl bg-green-50 hover:bg-green-100 transition text-left"
            >
              <CheckCircle2
                size={18}
                className="text-green-600"
              />

              <p className="text-xs text-slate-500 mt-2">
                Paid
              </p>

              <p className="text-xl font-bold text-green-700 mt-1">
                {invoiceStats.paid}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/invoices')
              }
              className="p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition text-left"
            >
              <Clock3
                size={18}
                className="text-orange-500"
              />

              <p className="text-xs text-slate-500 mt-2">
                Pending
              </p>

              <p className="text-xl font-bold text-orange-600 mt-1">
                {invoiceStats.pending}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/invoices')
              }
              className="p-4 rounded-xl bg-red-50 hover:bg-red-100 transition text-left"
            >
              <CircleAlert
                size={18}
                className="text-red-500"
              />

              <p className="text-xs text-slate-500 mt-2">
                Overdue
              </p>

              <p className="text-xl font-bold text-red-600 mt-1">
                {invoiceStats.overdue}
              </p>
            </button>

          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 flex items-center justify-between">

            <span className="text-xs text-slate-500">
              Total Invoice Value
            </span>

            <span className="font-bold text-slate-900">
              {formatCurrency(
                invoiceStats.total
              )}
            </span>

          </div>

        </div>

      </div>

      {/* =========================
          LOW STOCK ALERTS
      ========================= */}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Package
                size={20}
                className="text-red-500"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Low Stock Alerts
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Products that need attention
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/inventory')
            }
            className="text-xs font-semibold text-orange-500 hover:text-orange-600"
          >
            View Inventory →
          </button>

        </div>

        {lowStockProducts.length ===
        0 ? (
          <div className="mt-5 p-5 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">

            <CheckCircle2
              size={22}
              className="text-green-600"
            />

            <div>
              <p className="text-sm font-semibold text-green-700">
                Stock levels are healthy
              </p>

              <p className="text-xs text-green-600 mt-1">
                No products currently need restocking.
              </p>
            </div>

          </div>
        ) : (
          <div className="mt-4 space-y-2">

            {lowStockProducts
              .slice(0, 6)
              .map(
                (product, index) => {
                  const stock =
                    toNumber(
                      product.currentStock
                    )

                  const reorderPoint =
                    toNumber(
                      product.reorderPoint ??
                        product.reorderLevel ??
                        product.minimumStock ??
                        0
                    )

                  return (
                    <button
                      key={
                        product.id ?? index
                      }
                      type="button"
                      onClick={() =>
                        navigate(
                          '/inventory'
                        )
                      }
                      className="w-full p-3 rounded-xl bg-red-50 hover:bg-red-100 transition flex items-center justify-between gap-3 text-left"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <AlertTriangle
                            size={17}
                            className="text-red-500"
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {product.name ||
                              product.title ||
                              'Product'}
                          </p>

                          <p className="text-[11px] text-slate-500 mt-1">
                            Reorder point:{' '}
                            {reorderPoint}
                          </p>

                        </div>

                      </div>

                      <div className="text-right flex-shrink-0">

                        <p className="text-xs text-slate-500">
                          Current Stock
                        </p>

                        <p className="font-bold text-red-600">
                          {stock}
                        </p>

                      </div>

                    </button>
                  )
                }
              )}

            {lowStockProducts.length >
              6 && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/inventory'
                  )
                }
                className="w-full py-3 text-xs font-semibold text-orange-500 hover:text-orange-600"
              >
                +{' '}
                {lowStockProducts.length -
                  6}{' '}
                more products →
              </button>
            )}

          </div>
        )}

      </div>

      {/* =========================
          CHARTS
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,1fr)] gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

            <div>

              <h2 className="font-semibold text-slate-900">
                {
                  CHART_OPTIONS.find(
                    (item) =>
                      item.value ===
                      chartMode
                  )?.label
                }
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Real data from your accounting records ·{' '}
                {selectedRangeLabel}
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <select
                value={chartMode}
                onChange={(event) =>
                  setChartMode(
                    event.target.value
                  )
                }
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
              >
                {CHART_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

              <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1">

                {CHART_TYPES.map(
                  (type) => {
                    const Icon =
                      type.icon

                    return (
                      <button
                        key={
                          type.value
                        }
                        type="button"
                        title={`${type.label} chart`}
                        onClick={() =>
                          setChartType(
                            type.value
                          )
                        }
                        className={`w-8 h-8 rounded-md flex items-center justify-center ${
                          chartType ===
                          type.value
                            ? 'bg-white shadow-sm text-orange-500'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <Icon size={15} />
                      </button>
                    )
                  }
                )}

              </div>

            </div>

          </div>

          <div className="h-[285px] mt-4">

            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                {renderChart()}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">

                <BarChart3 size={30} />

                <p className="text-sm font-medium mt-3">
                  No records for{' '}
                  {selectedRangeLabel.toLowerCase()}
                </p>

                <p className="text-xs mt-1">
                  Choose another period to see your project data.
                </p>

              </div>
            )}

          </div>

        </div>

        {/* EXPENSE BREAKDOWN */}

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Expense Breakdown
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {selectedRangeLabel}
              </p>
            </div>

            <PieChartIcon
              size={19}
              className="text-slate-400"
            />

          </div>

          {expenseBreakdown.length >
          0 ? (
            <div className="h-[285px] flex items-center">

              <div className="w-[52%] h-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={
                        expenseBreakdown
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={57}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {expenseBreakdown.map(
                        (
                          item,
                          index
                        ) => (
                          <Cell
                            key={
                              item.name
                            }
                            fill={
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(
                          value
                        )
                      }
                    />

                  </PieChart>
                </ResponsiveContainer>

              </div>

              <div className="w-[48%] space-y-3">

                {expenseBreakdown.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.name
                      }
                      className="flex items-center justify-between gap-2 text-xs"
                    >

                      <div className="flex items-center gap-2 min-w-0">

                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ],
                          }}
                        />

                        <span className="text-slate-600 truncate">
                          {item.name}
                        </span>

                      </div>

                      <span className="font-semibold text-slate-700 whitespace-nowrap">
                        {formatCurrency(
                          item.value
                        )}
                      </span>

                    </div>
                  )
                )}

              </div>

            </div>
          ) : (
            <div className="h-[285px] flex items-center justify-center text-center text-slate-400 text-sm">
              No expense categories for this period.
            </div>
          )}

        </div>

      </div>

      {/* =========================
          RECENT TRANSACTIONS
          + BUSINESS SNAPSHOT
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="font-semibold text-slate-900">
              Recent Transactions
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate('/activity')
              }
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              View All
            </button>

          </div>

          {recentTransactions.length ===
          0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No transactions in this period.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">

              {recentTransactions.map(
                (item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          item.type ===
                          'income'
                            ? 'bg-green-50'
                            : item.type ===
                              'expense'
                            ? 'bg-red-50'
                            : 'bg-orange-50'
                        }`}
                      >
                        {item.type ===
                        'income' ? (
                          <TrendingUp
                            size={17}
                            className="text-green-600"
                          />
                        ) : item.type ===
                          'expense' ? (
                          <TrendingDown
                            size={17}
                            className="text-red-500"
                          />
                        ) : (
                          <FileText
                            size={17}
                            className="text-orange-500"
                          />
                        )}
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-medium text-slate-800 truncate">
                          {item.title}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {item.type ===
                          'income'
                            ? 'Income'
                            : item.type ===
                              'expense'
                            ? 'Expense'
                            : 'Invoice'}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`text-sm font-semibold whitespace-nowrap ${
                        item.type ===
                        'expense'
                          ? 'text-red-500'
                          : 'text-green-600'
                      }`}
                    >
                      {item.type ===
                      'expense'
                        ? '-'
                        : '+'}
                      {formatCurrency(
                        item.amount
                      )}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="font-semibold text-slate-900">
              Business Snapshot
            </h2>

            <Sparkles
              size={18}
              className="text-orange-500"
            />

          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">

            <button
              type="button"
              onClick={() =>
                navigate('/customers')
              }
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
            >
              <Users
                size={17}
                className="text-blue-500"
              />

              <p className="text-xs text-slate-500 mt-2">
                Customers
              </p>

              <p className="font-bold text-slate-900 mt-1">
                {customers.length}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/vendors')
              }
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
            >
              <Truck
                size={17}
                className="text-orange-500"
              />

              <p className="text-xs text-slate-500 mt-2">
                Vendors
              </p>

              <p className="font-bold text-slate-900 mt-1">
                {vendors.length}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/inventory')
              }
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
            >
              <Package
                size={17}
                className="text-green-600"
              />

              <p className="text-xs text-slate-500 mt-2">
                Low Stock
              </p>

              <p
                className={`font-bold mt-1 ${
                  lowStockProducts.length
                    ? 'text-red-500'
                    : 'text-slate-900'
                }`}
              >
                {lowStockProducts.length}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/invoices')
              }
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
            >
              <CreditCard
                size={17}
                className="text-purple-500"
              />

              <p className="text-xs text-slate-500 mt-2">
                Receivable
              </p>

              <p className="font-bold text-slate-900 mt-1">
                {formatCompactCurrency(
                  customerOutstanding
                )}
              </p>
            </button>

          </div>

        </div>

      </div>

      {/* =========================
          INVENTORY VALUE
          + TOP STOCK
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Inventory Value
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Based on current stock
              </p>
            </div>

            <Package
              size={19}
              className="text-green-600"
            />

          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">

            <div className="p-4 rounded-xl bg-slate-50">

              <p className="text-xs text-slate-500">
                Purchase Value
              </p>

              <p className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(
                  inventoryValue
                )}
              </p>

            </div>

            <div className="p-4 rounded-xl bg-green-50">

              <p className="text-xs text-slate-500">
                Selling Value
              </p>

              <p className="text-lg font-bold text-green-700 mt-1">
                {formatCurrency(
                  inventorySaleValue
                )}
              </p>

            </div>

          </div>

          <div className="mt-3 p-3 rounded-xl border border-slate-100 flex justify-between text-sm">

            <span className="text-slate-500">
              Potential stock margin
            </span>

            <span
              className={`font-semibold ${
                stockMargin >= 0
                  ? 'text-green-600'
                  : 'text-red-500'
              }`}
            >
              {formatCurrency(
                stockMargin
              )}
            </span>

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Top Stock Value
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Highest current inventory value
              </p>
            </div>

            <ShoppingCart
              size={19}
              className="text-orange-500"
            />

          </div>

          {topInventory.length ===
          0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No products added yet.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">

              {topInventory.map(
                (product, index) => {
                  const value =
                    toNumber(
                      product.currentStock
                    ) *
                    toNumber(
                      product.sellingPrice
                    )

                  return (
                    <div
                      key={
                        product.id ??
                        index
                      }
                      className="py-2.5 flex items-center justify-between gap-3"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>

                        <div className="min-w-0">

                          <p className="text-sm font-medium text-slate-800 truncate">
                            {product.name ||
                              product.title ||
                              'Product'}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            Stock:{' '}
                            {toNumber(
                              product.currentStock
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </p>

                        </div>

                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        {formatCurrency(
                          value
                        )}
                      </span>

                    </div>
                  )
                }
              )}

            </div>
          )}

        </div>

      </div>

      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

        <h2 className="font-semibold text-slate-900">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">

          <button
            type="button"
            onClick={() =>
              navigate('/income')
            }
            className="p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition text-left"
          >
            <IndianRupee
              size={20}
              className="text-green-600 mb-2"
            />

            <p className="text-sm font-semibold text-slate-800">
              Add Income
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Record income
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/expenses')
            }
            className="p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition text-left"
          >
            <TrendingDown
              size={20}
              className="text-red-500 mb-2"
            />

            <p className="text-sm font-semibold text-slate-800">
              Add Expense
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Record expense
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/invoices')
            }
            className="p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition text-left"
          >
            <FileText
              size={20}
              className="text-orange-500 mb-2"
            />

            <p className="text-sm font-semibold text-slate-800">
              Create Invoice
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Create invoice
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/products')
            }
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left"
          >
            <Package
              size={20}
              className="text-blue-500 mb-2"
            />

            <p className="text-sm font-semibold text-slate-800">
              Add Product
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Manage products
            </p>
          </button>

        </div>

      </div>

      {/* =========================
          FORECAST + FINANCIAL HEALTH
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Activity
                  size={18}
                  className="text-orange-500"
                />
                Revenue & Profit Forecast
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Based on the latest available monthly records
              </p>
            </div>

            <TrendingUp
              size={19}
              className="text-green-600"
            />

          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">

            <div className="p-3 rounded-xl bg-green-50">

              <p className="text-[11px] text-slate-500">
                Forecast Income
              </p>

              <p className="text-lg font-bold text-green-700 mt-1">
                {formatCurrency(
                  forecastData.avgIncome
                )}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-red-50">

              <p className="text-[11px] text-slate-500">
                Forecast Expense
              </p>

              <p className="text-lg font-bold text-red-600 mt-1">
                {formatCurrency(
                  forecastData.avgExpense
                )}
              </p>

            </div>

            <div className="p-3 rounded-xl bg-orange-50">

              <p className="text-[11px] text-slate-500">
                Forecast Profit
              </p>

              <p className="text-lg font-bold text-orange-700 mt-1">
                {formatCurrency(
                  forecastData.predictedProfit
                )}
              </p>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Activity
                  size={18}
                  className="text-blue-500"
                />
                Financial Health
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Profitability, cash flow, collections and stock
              </p>
            </div>

            <span
              className={`text-xl font-bold ${
                financialHealth >= 70
                  ? 'text-green-600'
                  : financialHealth >= 45
                  ? 'text-orange-500'
                  : 'text-red-500'
              }`}
            >
              {financialHealth}/100
            </span>

          </div>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-5">

            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{
                width: `${financialHealth}%`,
              }}
            />

          </div>

          <p className="text-xs text-slate-500 mt-3">
            Higher scores indicate healthier business performance.
          </p>

        </div>

      </div>

      {/* =========================
          MONTHLY COMPARISON
          + AI INSIGHTS
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <CalendarRange
                  size={18}
                  className="text-purple-500"
                />
                Monthly Comparison
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Current selected period vs previous month
              </p>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">

            {[
              [
                'Income',
                previousMonthComparison.incomeChange,
                'text-green-600',
              ],
              [
                'Expenses',
                previousMonthComparison.expenseChange,
                'text-red-500',
              ],
              [
                'Profit',
                previousMonthComparison.profitChange,
                previousMonthComparison
                  .profitChange >= 0
                  ? 'text-green-600'
                  : 'text-red-500',
              ],
            ].map(
              ([label, value, cls]) => (
                <div
                  key={label}
                  className="p-3 rounded-xl bg-slate-50"
                >

                  <p className="text-[11px] text-slate-500">
                    {label}
                  </p>

                  <p
                    className={`text-lg font-bold mt-1 ${cls}`}
                  >
                    {value >= 0
                      ? '+'
                      : ''}
                    {value.toFixed(1)}%
                  </p>

                </div>
              )
            )}

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Lightbulb
                  size={18}
                  className="text-orange-500"
                />
                AI Business Insights
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Actionable recommendations from your data
              </p>
            </div>

          </div>

          <div className="mt-4 space-y-2">

            {insights.map(
              (item, index) => (
                <div
                  key={index}
                  className="flex gap-2 p-3 rounded-xl bg-orange-50"
                >

                  <Lightbulb
                    size={15}
                    className="text-orange-500 mt-0.5 flex-shrink-0"
                  />

                  <p className="text-xs text-orange-700">
                    {item}
                  </p>

                </div>
              )
            )}

          </div>

        </div>

      </div>

      {/* =========================
          GOALS + ACTION CENTER
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Target
                  size={18}
                  className="text-blue-500"
                />
                Business Goals
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Set targets for this dashboard
              </p>
            </div>

            <button
              type="button"
              onClick={saveGoals}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600"
            >
              Save Goals
            </button>

          </div>

          <div className="mt-4 space-y-4">

            {[
              [
                'Income Goal',
                incomeGoal,
                setIncomeGoal,
                goalProgress.income,
                'green',
              ],
              [
                'Expense Limit',
                expenseLimit,
                setExpenseLimit,
                goalProgress.expense,
                'red',
              ],
              [
                'Profit Goal',
                profitGoal,
                setProfitGoal,
                goalProgress.profit,
                'orange',
              ],
            ].map(
              ([
                label,
                value,
                setter,
                progress,
                tone,
              ]) => (
                <div key={label}>

                  <div className="flex justify-between items-center gap-3">

                    <span className="text-xs font-medium text-slate-600">
                      {label}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={value}
                      onChange={(e) =>
                        setter(
                          Number(
                            e.target.value
                          ) || 0
                        )
                      }
                      className="w-28 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-orange-400"
                    />

                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">

                    <div
                      className={`h-full rounded-full ${
                        tone === 'green'
                          ? 'bg-green-500'
                          : tone === 'red'
                          ? 'bg-red-500'
                          : 'bg-orange-500'
                      }`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                  <p className="text-[10px] text-slate-400 mt-1">
                    {progress.toFixed(0)}%
                    complete
                  </p>

                </div>
              )
            )}

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-slate-900">
                Action Center
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Items that may need attention
              </p>
            </div>

            <ArrowRight
              size={18}
              className="text-slate-400"
            />

          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">

            <button
              type="button"
              onClick={() =>
                navigate('/invoices')
              }
              className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-left"
            >
              <p className="text-xs text-red-600">
                Overdue invoices
              </p>

              <p className="text-xl font-bold text-red-700 mt-1">
                {invoiceStats.overdue}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/inventory')
              }
              className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-left"
            >
              <p className="text-xs text-orange-600">
                Low stock
              </p>

              <p className="text-xl font-bold text-orange-700 mt-1">
                {lowStockProducts.length}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/customers')
              }
              className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-left"
            >
              <p className="text-xs text-blue-600">
                Receivable
              </p>

              <p className="text-lg font-bold text-blue-700 mt-1">
                {formatCompactCurrency(
                  customerOutstanding
                )}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/expenses')
              }
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-left"
            >
              <p className="text-xs text-slate-500">
                Profit margin
              </p>

              <p
                className={`text-lg font-bold mt-1 ${
                  profitMargin >= 0
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {profitMargin.toFixed(1)}%
              </p>
            </button>

          </div>

        </div>

      </div>

      {/* =========================
          AI ASSISTANT
      ========================= */}

      {chatOpen ? (
        <div className="fixed right-5 bottom-5 z-[100] w-[380px] max-w-[calc(100vw-24px)]">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

            <div className="p-4 border-b border-slate-100 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Bot
                    size={21}
                    className="text-white"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    AI Assistant
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    Connected to your dashboard data
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setChatOpen(false)
                }
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={17} />
              </button>

            </div>

            <div className="px-4 py-2 flex items-center justify-between">

              <span className="inline-flex items-center gap-1.5 text-[10px] text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Online
              </span>

              <span className="text-[10px] text-slate-400">
                {selectedRangeLabel}
              </span>

            </div>

            <div className="h-[430px] overflow-y-auto px-4 py-3 space-y-3">

              {messages.map(
                (item) => (
                  <div
                    key={item.id}
                    className={`flex ${
                      item.type ===
                      'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                        item.type ===
                        'user'
                          ? 'bg-slate-900 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-700 rounded-bl-md'
                      }`}
                    >
                      {item.text}
                    </div>

                  </div>
                )
              )}

            </div>

            <div className="px-3 pb-3 flex items-center gap-2 overflow-x-auto">

              {[
                'Business summary',
                'Show income',
                'Show expenses',
                'Pending invoices',
                'Low stock',
                'Customer outstanding',
                'Product count',
                'Vendor outstanding',
                'Profit and loss',
                'Invoice status',
                'Notifications',
                'Low stock alerts',
              ].map(
                (question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() =>
                      runQuickQuestion(
                        question
                      )
                    }
                    className="flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100"
                  >
                    {question}
                  </button>
                )
              )}

            </div>

            <div className="p-3 border-t border-slate-100">

              <div className="flex items-center gap-2">

                <input
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      'Enter'
                    ) {
                      sendMessage()
                    }
                  }}
                  placeholder="Ask about your business..."
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-orange-400"
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                >
                  <Send size={16} />
                </button>

              </div>

              <p className="text-[9px] text-center text-slate-400 mt-2">
                Answers are based on your saved dashboard data.
              </p>

            </div>

          </div>

        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            setChatOpen(true)
          }
          className="fixed right-6 bottom-6 z-[100] w-14 h-14 rounded-full bg-orange-500 text-white shadow-xl flex items-center justify-center hover:scale-105 transition"
          title="Open AI Assistant"
        >
          <Sparkles size={23} />
        </button>
      )}

      {/* =========================
          FINAL LOW STOCK ALERT
      ========================= */}

      {lowStockProducts.length > 0 && (
        <button
          type="button"
          onClick={() =>
            navigate('/inventory')
          }
          className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-red-100 transition"
        >

          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <AlertTriangle
              size={20}
              className="text-red-500"
            />
          </div>

          <div className="flex-1">

            <p className="text-sm font-semibold text-red-700">
              Low stock alert
            </p>

            <p className="text-xs text-red-600/80 mt-1">
              {lowStockProducts.length}{' '}
              product
              {lowStockProducts.length ===
              1
                ? ''
                : 's'} reached the reorder point. Open Inventory to review.
            </p>

          </div>

          <span className="text-red-500 text-sm font-semibold">
            View →
          </span>

        </button>
      )}

    </div>
  )
}
