import { useMemo, useState } from 'react'

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  CircleDollarSign,
  Package,
  AlertTriangle,
  Activity,
} from 'lucide-react'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
// PIE COLORS
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


export default function Analytics() {

  const {
    incomes = [],
    expenses = [],
    invoices = [],
    payments = [],
    customers = [],
    products = [],

    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
    customerOutstanding = 0,

    inventorySellingValue = 0,

    lowStockProducts = [],
  } = useFinance()


  // ======================================================
  // CHART STATES
  // ======================================================

  const [
    financialChart,
    setFinancialChart,
  ] = useState('area')


  const [
    expenseChart,
    setExpenseChart,
  ] = useState('pie')


  const [
    incomeChart,
    setIncomeChart,
  ] = useState('bar')


  const [
    customerChart,
    setCustomerChart,
  ] = useState('bar')


  const [
    collectionChart,
    setCollectionChart,
  ] = useState('line')


  // ======================================================
  // HELPERS
  // ======================================================

  const formatCurrency = (value) => {

    return `₹${Number(
      value || 0
    ).toLocaleString(
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
  // MONTHLY DATA
  // ======================================================

  const monthlyData = useMemo(() => {

    const now = new Date()

    const data = []


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


      const collected =
        payments
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
              Number(
                item?.amount || 0
              ),
            0
          )


      data.push({

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

        collected,

      })
    }


    return data

  }, [
    incomes,
    expenses,
    payments,
  ])


  // ======================================================
  // EXPENSE CATEGORY
  // ======================================================

  const expenseCategoryData =
    useMemo(() => {

      const map = {}


      expenses.forEach(
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

    }, [expenses])


  // ======================================================
  // INCOME SOURCES
  // ======================================================

  const incomeSourceData =
    useMemo(() => {

      const map = {}


      incomes.forEach(
        (income) => {

          const source =
            income?.source ||
            income?.category ||
            'Other'


          map[source] =
            (map[source] || 0) +
            getAmount(income)
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
        .slice(0, 10)

    }, [incomes])


  // ======================================================
  // TOP CUSTOMERS
  // ======================================================

  const topCustomers =
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
            item.total > 0
        )
        .sort(
          (a, b) =>
            b.total - a.total
        )
        .slice(0, 10)

    }, [
      customers,
      invoices,
    ])


  // ======================================================
  // COLLECTION DATA
  // ======================================================

  const collectionData =
    useMemo(() => {

      return monthlyData.map(
        (item) => ({

          month: item.month,

          collected:
            item.collected,

          invoiceValue:
            item.income,

        })
      )

    }, [monthlyData])


  // ======================================================
  // INVOICE STATUS
  // ======================================================

  const invoiceAnalytics =
    useMemo(() => {

      const result = {

        Paid: 0,

        Partial: 0,

        Pending: 0,

        Overdue: 0,

      }


      invoices.forEach(
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


          if (
            balance <= 0.005
          ) {

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

    }, [invoices])


  const invoiceStatusData =
    Object.entries(
      invoiceAnalytics
    ).map(
      ([name, value]) => ({
        name,
        value,
      })
    )


  // ======================================================
  // KPI
  // ======================================================

  const invoiceTotal =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        getAmount(invoice),
      0
    )


  const totalCollected =
    payments.reduce(
      (sum, payment) =>
        sum +
        Number(
          payment?.amount || 0
        ),
      0
    )


  const collectionRate =
    invoiceTotal > 0
      ? Math.min(
          100,
          (
            totalCollected /
            invoiceTotal
          ) *
            100
        )
      : 0


  const profitMargin =
    totalIncome > 0
      ? (
          balance /
          totalIncome
        ) *
        100
      : 0


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
    dataKey = 'value'
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
            dataKey="name"
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
  // FINANCIAL CHART
  // ======================================================

  const renderFinancialChart =
    () => {

      if (
        financialChart ===
        'bar'
      ) {

        return (

          <ResponsiveContainer
            width="100%"
            height={350}
          >

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

              <Bar
                dataKey="profit"
                name="Profit"
                fill="#2563EB"
              />

            </BarChart>

          </ResponsiveContainer>

        )
      }


      if (
        financialChart ===
        'line'
      ) {

        return (

          <ResponsiveContainer
            width="100%"
            height={350}
          >

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

              <Line
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#2563EB"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        )
      }


      return (

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <AreaChart
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

            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#16A34A"
              fill="#16A34A"
              fillOpacity={0.15}
            />

            <Area
              type="monotone"
              dataKey="expense"
              name="Expenses"
              stroke="#DC2626"
              fill="#DC2626"
              fillOpacity={0.10}
            />

            <Area
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="#2563EB"
              fill="#2563EB"
              fillOpacity={0.10}
            />

          </AreaChart>

        </ResponsiveContainer>

      )
    }


  // ======================================================
  // STAT CARD
  // ======================================================

  const StatCard = ({
    title,
    value,
    subtitle,
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

          <p className="text-xs text-slate-400 mt-2">
            {subtitle}
          </p>

        </div>


        <div
          className={`
            w-12
            h-12
            rounded-xl
            flex
            items-center
            justify-center
            ${className}
          `}
        >

          <Icon size={22} />

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

      <div>

        <h1 className="text-3xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Interactive business performance analytics.
        </p>

      </div>


      {/* KPI */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        <StatCard
          title="Total Income"
          value={formatCurrency(
            totalIncome
          )}
          subtitle="All recorded income"
          icon={TrendingUp}
          className="bg-green-50 text-green-600"
        />


        <StatCard
          title="Total Expenses"
          value={formatCurrency(
            totalExpense
          )}
          subtitle="All recorded expenses"
          icon={TrendingDown}
          className="bg-red-50 text-red-600"
        />


        <StatCard
          title="Net Profit"
          value={formatCurrency(
            balance
          )}
          subtitle="Income minus expenses"
          icon={Wallet}
          className="bg-blue-50 text-blue-600"
        />


        <StatCard
          title="Receivables"
          value={formatCurrency(
            customerOutstanding
          )}
          subtitle="Customer outstanding"
          icon={CircleDollarSign}
          className="bg-orange-50 text-orange-600"
        />

      </div>


      {/* BUSINESS HEALTH */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">

            <Activity
              size={23}
            />

          </div>


          <div>

            <h2 className="font-bold text-lg">
              Business Health
            </h2>

            <p className="text-sm text-slate-500">

              Profit margin:{' '}

              {profitMargin.toFixed(
                1
              )}

              %

              {' · '}

              Collection rate:{' '}

              {collectionRate.toFixed(
                1
              )}

              %

            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          FINANCIAL TREND
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">

          <div>

            <h2 className="font-bold text-lg">
              Financial Trend
            </h2>

            <p className="text-sm text-slate-500">
              Change the chart type whenever you want.
            </p>

          </div>


          <ChartButtons
            value={financialChart}
            onChange={
              setFinancialChart
            }
            options={[
              {
                value: 'area',
                label: 'Area',
              },
              {
                value: 'line',
                label: 'Line',
              },
              {
                value: 'bar',
                label: 'Bar',
              },
            ]}
          />

        </div>


        {renderFinancialChart()}

      </div>


      {/* ==================================================
          EXPENSE + INCOME
      ================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">


        {/* EXPENSE */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex justify-between items-center mb-5">

            <div>

              <h2 className="font-bold text-lg">
                Expense Analysis
              </h2>

              <p className="text-sm text-slate-500">
                Expense distribution by category.
              </p>

            </div>


            <ChartButtons
              value={expenseChart}
              onChange={
                setExpenseChart
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


          {expenseChart ===
          'pie'
            ? renderPieChart(
                expenseCategoryData
              )
            : renderBarChart(
                expenseCategoryData
              )}

        </div>


        {/* INCOME */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <div className="flex justify-between items-center mb-5">

            <div>

              <h2 className="font-bold text-lg">
                Income Sources
              </h2>

              <p className="text-sm text-slate-500">
                Where your income comes from.
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
                  value: 'pie',
                  label: 'Pie',
                },
              ]}
            />

          </div>


          {incomeChart ===
          'pie'
            ? renderPieChart(
                incomeSourceData
              )
            : renderBarChart(
                incomeSourceData
              )}

        </div>

      </div>


      {/* ==================================================
          COLLECTION
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

        <div className="flex justify-between items-center mb-5">

          <div>

            <h2 className="font-bold text-lg">
              Collection Analytics
            </h2>

            <p className="text-sm text-slate-500">
              Monthly payment collection.
            </p>

          </div>


          <ChartButtons
            value={collectionChart}
            onChange={
              setCollectionChart
            }
            options={[
              {
                value: 'line',
                label: 'Line',
              },
              {
                value: 'bar',
                label: 'Bar',
              },
            ]}
          />

        </div>


        <ResponsiveContainer
          width="100%"
          height={320}
        >

          {collectionChart ===
          'line' ? (

            <LineChart
              data={collectionData}
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
                dataKey="collected"
                name="Collected"
                stroke="#16A34A"
                strokeWidth={3}
              />

            </LineChart>

          ) : (

            <BarChart
              data={collectionData}
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
                dataKey="collected"
                name="Collected"
                fill="#16A34A"
              />

            </BarChart>

          )}

        </ResponsiveContainer>

      </div>


      {/* ==================================================
          CUSTOMER ANALYTICS
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

        <div className="flex justify-between items-center mb-5">

          <div>

            <h2 className="font-bold text-lg">
              Customer Analytics
            </h2>

            <p className="text-sm text-slate-500">
              Compare customer invoice value.
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
              topCustomers.map(
                (customer) => ({
                  name:
                    customer.name,

                  value:
                    customer.total,
                })
              )
            )
          : renderBarChart(
              topCustomers.map(
                (customer) => ({
                  name:
                    customer.name,

                  value:
                    customer.total,
                })
              )
            )}

      </div>


      {/* ==================================================
          INVOICE STATUS
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

        <div className="flex items-center gap-3 mb-5">

          <Receipt
            size={23}
            className="text-blue-600"
          />


          <div>

            <h2 className="font-bold">
              Invoice Status
            </h2>

            <p className="text-sm text-slate-500">
              Current invoice performance.
            </p>

          </div>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {invoiceStatusData.map(
            (item) => (

              <div
                key={item.name}
                className="bg-slate-50 rounded-xl p-4"
              >

                <p className="text-sm text-slate-500">
                  {item.name}
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {item.value}
                </p>

              </div>

            )
          )}

        </div>

      </div>


      {/* ==================================================
          INVENTORY
      ================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <Package
            className="text-purple-600"
            size={23}
          />

          <p className="text-sm text-slate-500 mt-4">
            Products
          </p>

          <p className="text-3xl font-bold mt-1">
            {products.length}
          </p>

        </div>


        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <Wallet
            className="text-green-600"
            size={23}
          />

          <p className="text-sm text-slate-500 mt-4">
            Stock Selling Value
          </p>

          <p className="text-3xl font-bold mt-1">
            {formatCurrency(
              inventorySellingValue
            )}
          </p>

        </div>


        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

          <AlertTriangle
            className="text-orange-600"
            size={23}
          />

          <p className="text-sm text-slate-500 mt-4">
            Low Stock Products
          </p>

          <p className="text-3xl font-bold mt-1 text-orange-600">
            {lowStockProducts.length}
          </p>

        </div>

      </div>


      {/* FOOTER */}

      <div className="text-center text-xs text-slate-400 pb-5">
        Personal Books · Interactive Analytics
      </div>

    </div>
  )
}