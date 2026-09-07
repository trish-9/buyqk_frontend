import { useMemo, useState } from 'react'
import {
  BarChart3,
  LineChart,
  AreaChart,
  TrendingUp,
} from 'lucide-react'

export default function IncomeChart({ data = [] }) {
  const [chartType, setChartType] = useState('bar')

  const safeData = Array.isArray(data) ? data : []

  const maxValue = useMemo(() => {
    const values = safeData.map((item) =>
      Number(item.amount || 0)
    )

    return Math.max(...values, 1)
  }, [safeData])

  const total = useMemo(() => {
    return safeData.reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    )
  }, [safeData])

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 0,
      }
    )}`
  }

  const getHeight = (amount) => {
    if (!amount) return 3

    return Math.max(
      (Number(amount) / maxValue) * 100,
      4
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">

            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Income Overview
              </h2>

              <p className="text-sm text-slate-500">
                Last 6 months
              </p>
            </div>

          </div>
        </div>

        {/* CHART SELECT */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">

          <button
            type="button"
            onClick={() =>
              setChartType('bar')
            }
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
              chartType === 'bar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 size={16} />
            Bar
          </button>

          <button
            type="button"
            onClick={() =>
              setChartType('line')
            }
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
              chartType === 'line'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LineChart size={16} />
            Line
          </button>

          <button
            type="button"
            onClick={() =>
              setChartType('area')
            }
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
              chartType === 'area'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <AreaChart size={16} />
            Area
          </button>

        </div>

      </div>

      {/* TOTAL */}
      <div className="mt-5">

        <p className="text-sm text-slate-500">
          6 Month Income
        </p>

        <p className="text-2xl font-bold text-green-600 mt-1">
          {formatCurrency(total)}
        </p>

      </div>

      {/* CHART */}
      <div className="mt-8">

        {safeData.length === 0 ? (

          <div className="h-64 flex items-center justify-center text-slate-400">
            No income data available.
          </div>

        ) : chartType === 'bar' ? (

          /* =========================
             BAR CHART
          ========================= */

          <div className="h-64 flex items-end gap-3 md:gap-6 border-b border-slate-200 px-2">

            {safeData.map(
              (item, index) => {

                const amount =
                  Number(
                    item.amount || 0
                  )

                const height =
                  getHeight(amount)

                return (
                  <div
                    key={`${item.month}-${index}`}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                  >

                    <span className="text-xs text-slate-500 mb-2">
                      {formatCurrency(
                        amount
                      )}
                    </span>

                    <div
                      className="w-full max-w-14 bg-green-500 hover:bg-green-600 rounded-t-xl transition-all duration-300"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${item.month}: ${formatCurrency(
                        amount
                      )}`}
                    />

                    <span className="text-xs font-medium text-slate-500 mt-3">
                      {item.month}
                    </span>

                  </div>
                )
              }
            )}

          </div>

        ) : (

          /* =========================
             LINE / AREA CHART
          ========================= */

          <div className="relative h-64">

            {/* GRID */}

            <div className="absolute inset-0 flex flex-col justify-between">

              <div className="border-t border-slate-100" />
              <div className="border-t border-slate-100" />
              <div className="border-t border-slate-100" />
              <div className="border-t border-slate-100" />
              <div className="border-t border-slate-200" />

            </div>

            {/* SVG */}

            <svg
              viewBox="0 0 600 250"
              className="absolute inset-0 w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >

              {/* AREA */}

              {chartType === 'area' && (
                <polygon
                  points={`
                    ${safeData
                      .map(
                        (item, index) => {
                          const x =
                            safeData.length ===
                            1
                              ? 300
                              : (index /
                                  (safeData.length -
                                    1)) *
                                560 +
                                20

                          const y =
                            225 -
                            (Number(
                              item.amount || 0
                            ) /
                              maxValue) *
                              190

                          return `${x},${y}`
                        }
                      )
                      .join(' ')}

                    580,225
                    20,225
                  `}
                  fill="currentColor"
                  className="text-green-100"
                />
              )}

              {/* LINE */}

              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
                points={safeData
                  .map(
                    (item, index) => {
                      const x =
                        safeData.length ===
                        1
                          ? 300
                          : (index /
                              (safeData.length -
                                1)) *
                              560 +
                            20

                      const y =
                        225 -
                        (Number(
                          item.amount || 0
                        ) /
                          maxValue) *
                          190

                      return `${x},${y}`
                    }
                  )
                  .join(' ')}
              />

              {/* POINTS */}

              {safeData.map(
                (item, index) => {

                  const x =
                    safeData.length === 1
                      ? 300
                      : (index /
                          (safeData.length -
                            1)) *
                          560 +
                        20

                  const y =
                    225 -
                    (Number(
                      item.amount || 0
                    ) /
                      maxValue) *
                      190

                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="6"
                      fill="white"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-green-500"
                    />
                  )
                }
              )}

            </svg>

            {/* LABELS */}

            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">

              {safeData.map(
                (item, index) => (
                  <span
                    key={`${item.month}-label-${index}`}
                    className="text-xs font-medium text-slate-500"
                  >
                    {item.month}
                  </span>
                )
              )}

            </div>

            {/* VALUES */}

            <div className="absolute top-0 left-0 right-0 flex justify-between px-2 pointer-events-none">

              {safeData.map(
                (item, index) => (
                  <span
                    key={`${item.month}-value-${index}`}
                    className="text-[10px] text-slate-400"
                  >
                    {formatCurrency(
                      item.amount
                    )}
                  </span>
                )
              )}

            </div>

          </div>

        )}

      </div>

      {/* FOOTER */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">

        <p className="text-xs text-slate-400">
          Income performance
        </p>

        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">

          <TrendingUp size={14} />

          Tracking income

        </div>

      </div>

    </div>
  )
}