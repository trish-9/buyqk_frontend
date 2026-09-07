import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

import { useState } from 'react'

export default function ChartCard({ data = [] }) {
  const [chartType, setChartType] =
    useState('line')

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      'en-IN'
    )}`
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

        <div>
          <h3 className="font-semibold text-lg text-slate-800">
            Income vs Expense
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Monthly financial performance
          </p>
        </div>

        {/* CHART SELECT */}

        <select
          value={chartType}
          onChange={(e) =>
            setChartType(e.target.value)
          }
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
        >
          <option value="line">
            Line Chart
          </option>

          <option value="bar">
            Bar Chart
          </option>

          <option value="area">
            Area Chart
          </option>
        </select>

      </div>

      {/* CHART */}

      <div className="w-full h-[320px]">

        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            No chart data available.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            {/* ==============================
                LINE CHART
            ============================== */}

            {chartType === 'line' && (
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 13,
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                  }}
                  tickFormatter={(value) =>
                    `₹${value}`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </LineChart>
            )}

            {/* ==============================
                BAR CHART
            ============================== */}

            {chartType === 'bar' && (
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 13,
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                  }}
                  tickFormatter={(value) =>
                    `₹${value}`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#2563eb"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />

                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#dc2626"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />

              </BarChart>
            )}

            {/* ==============================
                AREA CHART
            ============================== */}

            {chartType === 'area' && (
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 13,
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                  }}
                  tickFormatter={(value) =>
                    `₹${value}`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#2563eb"
                  fill="#dbeafe"
                  strokeWidth={3}
                />

                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#dc2626"
                  fill="#fee2e2"
                  strokeWidth={3}
                />

              </AreaChart>
            )}

          </ResponsiveContainer>
        )}

      </div>

    </div>
  )
}