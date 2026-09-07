import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Wallet,
  CircleDollarSign,
} from 'lucide-react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

import { useFinance } from '../context/FinanceContext'


// ======================================================
// PIE CHART COLORS
// ======================================================

const CHART_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
  '#14B8A6',
  '#A855F7',
]


export default function Reports() {

  const {
    incomes = [],
    expenses = [],
    invoices = [],
    payments = [],
    customers = [],
  } = useFinance()


  // ======================================================
  // STATE
  // ======================================================

  const [period, setPeriod] = useState('month')

  const [customFrom, setCustomFrom] =
    useState('')

  const [customTo, setCustomTo] =
    useState('')

  const [activeReport, setActiveReport] =
    useState('overview')

  const [incomeChart, setIncomeChart] =
    useState('bar')

  const [expenseChart, setExpenseChart] =
    useState('bar')

  const [invoiceChart, setInvoiceChart] =
    useState('bar')

  const [categoryChart, setCategoryChart] =
    useState('pie')

  const [customerChart, setCustomerChart] =
    useState('bar')


  // ======================================================
  // HELPERS
  // ======================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`
  }


  const getDate = (item) => {
    return (
      item?.date ||
      item?.invoiceDate ||
      item?.paymentDate ||
      item?.createdAt ||
      ''
    )
  }


  const getAmount = (item) => {
    return Number(
      item?.amount ??
      item?.grandTotal ??
      item?.total ??
      item?.totalAmount ??
      0
    )
  }


  // ======================================================
  // DATE RANGE
  // ======================================================

  const getDateRange = () => {

    const now = new Date()


    if (period === 'today') {

      return {
        start: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ),

        end: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59
        ),
      }
    }


    if (period === 'week') {

      const day =
        now.getDay() === 0
          ? 6
          : now.getDay() - 1

      const start = new Date(now)

      start.setDate(
        now.getDate() - day
      )

      start.setHours(
        0,
        0,
        0,
        0
      )


      const end = new Date(now)

      end.setHours(
        23,
        59,
        59,
        999
      )


      return {
        start,
        end,
      }
    }


    if (period === 'year') {

      return {
        start: new Date(
          now.getFullYear(),
          0,
          1
        ),

        end: new Date(
          now.getFullYear(),
          11,
          31,
          23,
          59,
          59
        ),
      }
    }


    if (period === 'custom') {

      return {
        start: customFrom
          ? new Date(
              `${customFrom}T00:00:00`
            )
          : new Date(
              now.getFullYear(),
              now.getMonth(),
              1
            ),

        end: customTo
          ? new Date(
              `${customTo}T23:59:59`
            )
          : now,
      }
    }


    return {
      start: new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ),

      end: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ),
    }
  }


  const range = useMemo(
    () => getDateRange(),
    [
      period,
      customFrom,
      customTo,
    ]
  )


  const inRange = (item) => {

    const value = getDate(item)

    if (!value) {
      return false
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return false
    }

    return (
      date >= range.start &&
      date <= range.end
    )
  }


  // ======================================================
  // FILTER DATA
  // ======================================================

  const filteredIncomes = useMemo(
    () =>
      incomes.filter(inRange),
    [incomes, range]
  )


  const filteredExpenses = useMemo(
    () =>
      expenses.filter(inRange),
    [expenses, range]
  )


  const filteredInvoices = useMemo(
    () =>
      invoices.filter(inRange),
    [invoices, range]
  )


  const filteredPayments = useMemo(
    () =>
      payments.filter(inRange),
    [payments, range]
  )


  // ======================================================
  // TOTALS
  // ======================================================

  const totalIncome =
    filteredIncomes.reduce(
      (sum, item) =>
        sum + getAmount(item),
      0
    )


  const totalExpense =
    filteredExpenses.reduce(
      (sum, item) =>
        sum + getAmount(item),
      0
    )


  const netProfit =
    totalIncome - totalExpense


  const totalCollected =
    filteredPayments.reduce(
      (sum, item) =>
        sum +
        Number(
          item?.amount || 0
        ),
      0
    )


  const totalReceivables =
    invoices.reduce(
      (sum, invoice) => {

        const total =
          getAmount(invoice)

        const paid =
          Number(
            invoice?.paidAmount ||
            invoice?.amountPaid ||
            invoice?.paid ||
            0
          )


        const balance =
          invoice?.balanceDue !==
          undefined
            ? Number(
                invoice.balanceDue ||
                0
              )
            : Math.max(
                0,
                total - paid
              )


        return sum + balance
      },
      0
    )


  // ======================================================
  // INVOICE STATUS
  // ======================================================

  const invoiceStatus =
    useMemo(() => {

      const result = {
        Paid: 0,
        Partial: 0,
        Pending: 0,
        Overdue: 0,
      }


      filteredInvoices.forEach(
        (invoice) => {

          const total =
            getAmount(invoice)

          const paid =
            Number(
              invoice?.paidAmount ||
              invoice?.amountPaid ||
              invoice?.paid ||
              0
            )


          const balance =
            invoice?.balanceDue !==
            undefined
              ? Number(
                  invoice.balanceDue ||
                  0
                )
              : Math.max(
                  0,
                  total - paid
                )


          if (balance <= 0.005) {

            result.Paid++

          } else if (
            invoice?.dueDate &&
            new Date(
              invoice.dueDate
            ) < new Date()
          ) {

            result.Overdue++

          } else if (
            paid > 0
          ) {

            result.Partial++

          } else {

            result.Pending++
          }
        }
      )


      return result

    }, [filteredInvoices])


  const invoiceStatusData =
    Object.entries(
      invoiceStatus
    ).map(
      ([name, value]) => ({
        name,
        value,
      })
    )


  // ======================================================
  // EXPENSE CATEGORIES
  // ======================================================

  const expenseCategories =
    useMemo(() => {

      const map = {}


      filteredExpenses.forEach(
        (expense) => {

          const category =
            expense?.category ||
            'Other'


          map[category] =
            (map[category] || 0) +
            getAmount(expense)
        }
      )


      return Object.entries(map)
        .map(
          ([name, value]) => ({
            name,
            value,
          })
        )
        .sort(
          (a, b) =>
            b.value - a.value
        )

    }, [filteredExpenses])


  // ======================================================
  // CUSTOMER OUTSTANDING
  // ======================================================

  const customerReport =
    useMemo(() => {

      return customers
        .map((customer) => {

          const customerInvoices =
            invoices.filter(
              (invoice) =>
                String(
                  invoice?.customerId
                ) ===
                  String(
                    customer?.id
                  ) ||
                invoice?.customer
                  ?.trim()
                  .toLowerCase() ===
                  customer?.name
                    ?.trim()
                    .toLowerCase()
            )


          const total =
            customerInvoices.reduce(
              (sum, invoice) =>
                sum +
                getAmount(invoice),
              0
            )


          const outstanding =
            customerInvoices.reduce(
              (sum, invoice) => {

                const invoiceTotal =
                  getAmount(invoice)

                const paid =
                  Number(
                    invoice?.paidAmount ||
                    invoice?.amountPaid ||
                    invoice?.paid ||
                    0
                  )


                const balance =
                  invoice?.balanceDue !==
                  undefined
                    ? Number(
                        invoice.balanceDue ||
                        0
                      )
                    : Math.max(
                        0,
                        invoiceTotal -
                        paid
                      )


                return (
                  sum + balance
                )
              },
              0
            )


          return {
            name:
              customer?.name ||
              'Customer',

            total,

            outstanding,
          }

        })
        .filter(
          (item) =>
            item.total > 0 ||
            item.outstanding > 0
        )
        .sort(
          (a, b) =>
            b.outstanding -
            a.outstanding
        )
        .slice(0, 10)

    }, [
      customers,
      invoices,
    ])


  // ======================================================
  // MONTHLY DATA
  // ======================================================

  const monthlyData = useMemo(() => {

    const now = new Date()

    const result = []


    for (
      let i = 11;
      i >= 0;
      i--
    ) {

      const date =
        new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        )


      const year =
        date.getFullYear()

      const month =
        date.getMonth()


      const income =
        incomes
          .filter((item) => {

            const d =
              new Date(
                getDate(item)
              )

            return (
              d.getFullYear() ===
                year &&
              d.getMonth() ===
                month
            )
          })
          .reduce(
            (sum, item) =>
              sum +
              getAmount(item),
            0
          )


      const expense =
        expenses
          .filter((item) => {

            const d =
              new Date(
                getDate(item)
              )

            return (
              d.getFullYear() ===
                year &&
              d.getMonth() ===
                month
            )
          })
          .reduce(
            (sum, item) =>
              sum +
              getAmount(item),
            0
          )


      result.push({
        month:
          date.toLocaleString(
            'en-IN',
            {
              month: 'short',
            }
          ),

        income,

        expense,

        profit:
          income - expense,
      })
    }


    return result

  }, [
    incomes,
    expenses,
  ])


  // ======================================================
  // CHART BUTTONS
  // ======================================================

  const ChartButtons = ({
    value,
    onChange,
    options,
  }) => {

    return (
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">

        {options.map(
          (option) => (

            <button
              key={option.value}
              type="button"
              onClick={() =>
                onChange(
                  option.value
                )
              }
              className={`
                px-3
                py-1.5
                rounded-lg
                text-xs
                font-medium
                transition
                ${
                  value ===
                  option.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }
              `}
            >
              {option.label}
            </button>

          )
        )}

      </div>
    )
  }


  // ======================================================
  // PIE CHART
  // ======================================================

  const renderPieChart = (
    data,
    dataKey = 'value',
    nameKey = 'name'
  ) => {

    if (!data.length) {

      return (
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          No data available.
        </div>
      )
    }


    return (
      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <PieChart>

          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={105}
            label
          >

            {data.map(
              (item, index) => (

                <Cell
                  key={`${item[nameKey]}-${index}`}
                  fill={
                    CHART_COLORS[
                      index %
                      CHART_COLORS.length
                    ]
                  }
                />

              )
            )}

          </Pie>


          <Tooltip
            formatter={(value) =>
              formatCurrency(value)
            }
          />


          <Legend />

        </PieChart>

      </ResponsiveContainer>
    )
  }


  // ======================================================
  // BAR CHART
  // ======================================================

  const renderBarChart = (
    data,
    dataKey = 'value',
    nameKey = 'name'
  ) => {

    if (!data.length) {

      return (
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          No data available.
        </div>
      )
    }


    return (
      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <BarChart data={data}>

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey={nameKey}
          />

          <YAxis />

          <Tooltip
            formatter={(value) =>
              formatCurrency(value)
            }
          />

          <Bar
            dataKey={dataKey}
            fill="#3B82F6"
            radius={[
              6,
              6,
              0,
              0,
            ]}
          />

        </BarChart>

      </ResponsiveContainer>
    )
  }


  // ======================================================
  // EXPORT CSV
  // ======================================================

  const downloadCSV = (
    filename,
    rows
  ) => {

    if (!rows.length) {
      return
    }


    const headers =
      Object.keys(rows[0])


    const csv = [
      headers.join(','),
      ...rows.map(
        (row) =>
          headers
            .map(
              (header) =>
                `"${String(
                  row[header] ??
                  ''
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(',')
      ),
    ].join('\n')


    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;',
        }
      )


    const url =
      URL.createObjectURL(blob)


    const link =
      document.createElement(
        'a'
      )

    link.href = url
    link.download = filename

    link.click()

    URL.revokeObjectURL(url)
  }


  // ======================================================
  // PERIOD LABEL
  // ======================================================

  const dateLabel =
    period === 'today'
      ? 'Today'
      : period === 'week'
        ? 'This Week'
        : period === 'year'
          ? 'This Year'
          : period === 'custom'
            ? `${customFrom || 'Start'} → ${
                customTo || 'Today'
              }`
            : 'This Month'


  // ======================================================
  // STAT CARD
  // ======================================================

  const Card = ({
    title,
    value,
    icon: Icon,
    className,
  }) => (

    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-2">
            {value}
          </p>

        </div>


        <div
          className={`
            w-11
            h-11
            rounded-xl
            flex
            items-center
            justify-center
            ${className}
          `}
        >

          <Icon size={21} />

        </div>

      </div>

    </div>
  )


  // ======================================================
  // PAGE
  // ======================================================

  return (

    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Financial reports and visual analysis.
          </p>

        </div>


        <button
          onClick={() =>
            window.print()
          }
          className="px-4 py-2.5 bg-slate-900 text-white rounded-xl flex items-center gap-2 text-sm"
        >
          <Printer size={17} />
          Print
        </button>

      </div>


      {/* DATE FILTER */}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

        <div className="flex items-center gap-2 mb-3">

          <CalendarDays
            size={18}
            className="text-blue-600"
          />

          <strong>
            Report Period
          </strong>

        </div>


        <div className="flex flex-wrap gap-2">

          {[
            ['today', 'Today'],
            ['week', 'Week'],
            ['month', 'Month'],
            ['year', 'Year'],
            ['custom', 'Custom'],
          ].map(
            ([value, label]) => (

              <button
                key={value}
                onClick={() =>
                  setPeriod(value)
                }
                className={`
                  px-4
                  py-2
                  rounded-xl
                  text-sm
                  ${
                    period === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }
                `}
              >
                {label}
              </button>

            )
          )}

        </div>


        {period === 'custom' && (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

            <input
              type="date"
              value={customFrom}
              onChange={(e) =>
                setCustomFrom(
                  e.target.value
                )
              }
              className="border rounded-xl px-3 py-2"
            />


            <input
              type="date"
              value={customTo}
              onChange={(e) =>
                setCustomTo(
                  e.target.value
                )
              }
              className="border rounded-xl px-3 py-2"
            />

          </div>

        )}


        <p className="text-xs text-slate-400 mt-3">
          Showing: {dateLabel}
        </p>

      </div>


      {/* REPORT NAVIGATION */}

      <div className="flex flex-wrap gap-2">

        {[
          ['overview', 'Overview'],
          ['income', 'Income'],
          ['expenses', 'Expenses'],
          ['invoices', 'Invoices'],
          ['customers', 'Customers'],
        ].map(
          ([value, label]) => (

            <button
              key={value}
              onClick={() =>
                setActiveReport(
                  value
                )
              }
              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                font-medium
                ${
                  activeReport ===
                  value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200'
                }
              `}
            >
              {label}
            </button>

          )
        )}

      </div>


      {/* SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <Card
          title="Income"
          value={formatCurrency(
            totalIncome
          )}
          icon={TrendingUp}
          className="bg-green-50 text-green-600"
        />


        <Card
          title="Expenses"
          value={formatCurrency(
            totalExpense
          )}
          icon={TrendingDown}
          className="bg-red-50 text-red-600"
        />


        <Card
          title="Net Profit"
          value={formatCurrency(
            netProfit
          )}
          icon={Wallet}
          className="bg-blue-50 text-blue-600"
        />


        <Card
          title="Receivables"
          value={formatCurrency(
            totalReceivables
          )}
          icon={CircleDollarSign}
          className="bg-orange-50 text-orange-600"
        />

      </div>


      {/* ==================================================
          OVERVIEW
      ================================================== */}

      {activeReport === 'overview' && (

        <>

          {/* INCOME VS EXPENSE */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-5">

              <div>

                <h2 className="font-bold text-lg">
                  Income vs Expenses
                </h2>

                <p className="text-sm text-slate-500">
                  Compare business income and spending.
                </p>

              </div>


              <ChartButtons
                value={incomeChart}
                onChange={
                  setIncomeChart
                }
                options={[
                  {
                    value: 'bar',
                    label: 'Bar',
                  },
                  {
                    value: 'line',
                    label: 'Line',
                  },
                ]}
              />

            </div>


            <ResponsiveContainer
              width="100%"
              height={330}
            >

              {incomeChart ===
              'line' ? (

                <LineChart
                  data={monthlyData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#16A34A"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#DC2626"
                    strokeWidth={3}
                  />

                </LineChart>

              ) : (

                <BarChart
                  data={monthlyData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="month"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#16A34A"
                  />

                  <Bar
                    dataKey="expense"
                    name="Expenses"
                    fill="#DC2626"
                  />

                </BarChart>

              )}

            </ResponsiveContainer>

          </div>


          {/* EXPENSE CATEGORIES */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">

              <div>

                <h2 className="font-bold text-lg">
                  Expense Categories
                </h2>

                <p className="text-sm text-slate-500">
                  See where your money is going.
                </p>

              </div>


              <ChartButtons
                value={categoryChart}
                onChange={
                  setCategoryChart
                }
                options={[
                  {
                    value: 'pie',
                    label: 'Pie',
                  },
                  {
                    value: 'bar',
                    label: 'Bar',
                  },
                ]}
              />

            </div>


            {categoryChart ===
            'pie'
              ? renderPieChart(
                  expenseCategories
                )
              : renderBarChart(
                  expenseCategories
                )}

          </div>

        </>

      )}


      {/* ==================================================
          INCOME
      ================================================== */}

      {activeReport === 'income' && (

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex justify-between items-center mb-5">

            <div>

              <h2 className="text-lg font-bold">
                Income Report
              </h2>

              <p className="text-sm text-slate-500">
                {formatCurrency(
                  totalIncome
                )}
              </p>

            </div>


            <div className="flex gap-2">

              <ChartButtons
                value={incomeChart}
                onChange={
                  setIncomeChart
                }
                options={[
                  {
                    value: 'bar',
                    label: 'Bar',
                  },
                  {
                    value: 'line',
                    label: 'Line',
                  },
                ]}
              />


              <button
                onClick={() =>
                  downloadCSV(
                    'income-report.csv',
                    filteredIncomes.map(
                      (item) => ({
                        Date:
                          getDate(
                            item
                          ),

                        Source:
                          item?.source ||
                          '',

                        Category:
                          item?.category ||
                          '',

                        Amount:
                          getAmount(
                            item
                          ),
                      })
                    )
                  )
                }
                className="p-2 bg-blue-600 text-white rounded-xl"
              >

                <Download
                  size={17}
                />

              </button>

            </div>

          </div>


          <ResponsiveContainer
            width="100%"
            height={320}
          >

            {incomeChart ===
            'line' ? (

              <LineChart
                data={monthlyData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#16A34A"
                  strokeWidth={3}
                />

              </LineChart>

            ) : (

              <BarChart
                data={monthlyData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="income"
                  fill="#16A34A"
                />

              </BarChart>

            )}

          </ResponsiveContainer>

        </div>

      )}


      {/* ==================================================
          EXPENSES
      ================================================== */}

      {activeReport === 'expenses' && (

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex justify-between items-center mb-5">

            <div>

              <h2 className="font-bold text-lg">
                Expense Report
              </h2>

              <p className="text-sm text-slate-500">
                {formatCurrency(
                  totalExpense
                )}
              </p>

            </div>


            <div className="flex gap-2">

              <ChartButtons
                value={expenseChart}
                onChange={
                  setExpenseChart
                }
                options={[
                  {
                    value: 'bar',
                    label: 'Bar',
                  },
                  {
                    value: 'line',
                    label: 'Line',
                  },
                ]}
              />


              <button
                onClick={() =>
                  downloadCSV(
                    'expense-report.csv',
                    filteredExpenses.map(
                      (item) => ({
                        Date:
                          getDate(
                            item
                          ),

                        Category:
                          item?.category ||
                          '',

                        Amount:
                          getAmount(
                            item
                          ),
                      })
                    )
                  )
                }
                className="p-2 bg-blue-600 text-white rounded-xl"
              >

                <Download
                  size={17}
                />

              </button>

            </div>

          </div>


          <ResponsiveContainer
            width="100%"
            height={320}
          >

            {expenseChart ===
            'line' ? (

              <LineChart
                data={monthlyData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#DC2626"
                  strokeWidth={3}
                />

              </LineChart>

            ) : (

              <BarChart
                data={monthlyData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="expense"
                  fill="#DC2626"
                />

              </BarChart>

            )}

          </ResponsiveContainer>

        </div>

      )}


      {/* ==================================================
          INVOICES
      ================================================== */}

      {activeReport === 'invoices' && (

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex justify-between items-center mb-5">

            <div>

              <h2 className="font-bold text-lg">
                Invoice Status
              </h2>

              <p className="text-sm text-slate-500">
                Paid, partial, pending and overdue.
              </p>

            </div>


            <ChartButtons
              value={invoiceChart}
              onChange={
                setInvoiceChart
              }
              options={[
                {
                  value: 'bar',
                  label: 'Bar',
                },
                {
                  value: 'pie',
                  label: 'Pie',
                },
              ]}
            />

          </div>


          {invoiceChart ===
          'pie'
            ? renderPieChart(
                invoiceStatusData
              )
            : renderBarChart(
                invoiceStatusData
              )}

        </div>

      )}


      {/* ==================================================
          CUSTOMERS
      ================================================== */}

      {activeReport === 'customers' && (

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex justify-between items-center mb-5">

            <div>

              <h2 className="font-bold text-lg">
                Customer Outstanding
              </h2>

              <p className="text-sm text-slate-500">
                Top customers by outstanding balance.
              </p>

            </div>


            <ChartButtons
              value={customerChart}
              onChange={
                setCustomerChart
              }
              options={[
                {
                  value: 'bar',
                  label: 'Bar',
                },
                {
                  value: 'pie',
                  label: 'Pie',
                },
              ]}
            />

          </div>


          {customerChart ===
          'pie'
            ? renderPieChart(
                customerReport,
                'outstanding'
              )
            : renderBarChart(
                customerReport,
                'outstanding'
              )}


          <div className="overflow-x-auto mt-6">

            <table className="w-full text-sm">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-4 py-3">
                    Customer
                  </th>

                  <th className="text-right px-4 py-3">
                    Invoice Value
                  </th>

                  <th className="text-right px-4 py-3">
                    Outstanding
                  </th>

                </tr>

              </thead>


              <tbody>

                {customerReport.map(
                  (customer) => (

                    <tr
                      key={
                        customer.name
                      }
                      className="border-t"
                    >

                      <td className="px-4 py-3 font-medium">
                        {customer.name}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(
                          customer.total
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-orange-600">
                        {formatCurrency(
                          customer.outstanding
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  )
}