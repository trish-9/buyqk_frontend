import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Calculator,
  FileText,
  IndianRupee,
  Settings2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ReceiptIndianRupee,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
} from 'lucide-react'

import { useFinance } from '../context/FinanceContext'

/*
==================================================
CONSTANTS
==================================================
*/

const GST_SETTINGS_KEY =
  'gstSettings'

const DEFAULT_RATES = [
  0,
  5,
  12,
  18,
  28,
]

/*
==================================================
DEFAULT SETTINGS
==================================================
*/

const DEFAULT_SETTINGS = {
  gstin: '',
  state: '',
  registrationType: 'Regular',
  defaultRate: 18,
  rates: DEFAULT_RATES,
}

/*
==================================================
MONEY FORMAT
==================================================
*/

function formatMoney(value) {
  const amount =
    Number(value) || 0

  return `₹${amount.toLocaleString(
    'en-IN',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`
}

/*
==================================================
LOAD GST SETTINGS
==================================================
*/

function loadGSTSettings() {
  try {
    const saved =
      localStorage.getItem(
        GST_SETTINGS_KEY
      )

    if (!saved) {
      return {
        ...DEFAULT_SETTINGS,
      }
    }

    const parsed =
      JSON.parse(saved)

    const rates =
      Array.isArray(parsed.rates) &&
      parsed.rates.length > 0
        ? parsed.rates
            .map(Number)
            .filter(
              (rate) =>
                Number.isFinite(rate) &&
                rate >= 0 &&
                rate <= 100
            )
        : DEFAULT_RATES

    return {
      gstin:
        parsed.gstin || '',

      state:
        parsed.state || '',

      registrationType:
        parsed.registrationType ||
        'Regular',

      defaultRate:
        Number.isFinite(
          Number(
            parsed.defaultRate
          )
        )
          ? Number(
              parsed.defaultRate
            )
          : 18,

      rates:
        rates.length > 0
          ? [
              ...new Set(
                rates
              ),
            ].sort(
              (a, b) =>
                a - b
            )
          : DEFAULT_RATES,
    }
  } catch {
    return {
      ...DEFAULT_SETTINGS,
    }
  }
}

/*
==================================================
DATE HELPER
==================================================
*/

function getItemDate(item) {
  return (
    item?.invoiceDate ||
    item?.date ||
    item?.createdAt ||
    ''
  )
}

/*
==================================================
DATE FILTER
==================================================
*/

function isInPeriod(
  dateValue,
  period
) {
  if (period === 'all') {
    return true
  }

  if (!dateValue) {
    return false
  }

  const date =
    new Date(dateValue)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false
  }

  const now =
    new Date()

  /*
  ------------------------------
  CURRENT MONTH
  ------------------------------
  */

  if (
    period === 'month'
  ) {
    return (
      date.getMonth() ===
        now.getMonth() &&
      date.getFullYear() ===
        now.getFullYear()
    )
  }

  /*
  ------------------------------
  CURRENT QUARTER
  ------------------------------
  */

  if (
    period === 'quarter'
  ) {
    const currentQuarter =
      Math.floor(
        now.getMonth() / 3
      )

    const itemQuarter =
      Math.floor(
        date.getMonth() / 3
      )

    return (
      currentQuarter ===
        itemQuarter &&
      date.getFullYear() ===
        now.getFullYear()
    )
  }

  /*
  ------------------------------
  FINANCIAL YEAR
  APRIL - MARCH
  ------------------------------
  */

  if (
    period === 'fy'
  ) {
    const financialYearStart =
      now.getMonth() >= 3
        ? now.getFullYear()
        : now.getFullYear() - 1

    const startDate =
      new Date(
        financialYearStart,
        3,
        1,
        0,
        0,
        0,
        0
      )

    const endDate =
      new Date(
        financialYearStart + 1,
        2,
        31,
        23,
        59,
        59,
        999
      )

    return (
      date >= startDate &&
      date <= endDate
    )
  }

  return true
}

/*
==================================================
GST CALCULATION
==================================================
*/

function calculateGST(
  amount,
  rate
) {
  const taxableAmount =
    Number(amount) || 0

  const gstRate =
    Number(rate) || 0

  const totalGST =
    (taxableAmount *
      gstRate) /
    100

  const cgst =
    totalGST / 2

  const sgst =
    totalGST / 2

  const grandTotal =
    taxableAmount +
    totalGST

  return {
    taxableAmount,
    gstRate,
    cgst,
    sgst,
    totalGST,
    grandTotal,
  }
}

/*
==================================================
GET INVOICE GST
==================================================
*/

function getInvoiceGST(
  invoice
) {
  const amount =
    Number(
      invoice?.amount ||
        invoice?.taxableAmount ||
        0
    )

  const rate =
    Number(
      invoice?.gstRate || 0
    )

  const calculated =
    calculateGST(
      amount,
      rate
    )

  return {
    taxableAmount:
      amount,

    rate,

    cgst:
      Number(
        invoice?.cgst ??
          calculated.cgst
      ),

    sgst:
      Number(
        invoice?.sgst ??
          calculated.sgst
      ),

    totalGST:
      Number(
        invoice?.totalGST ??
          calculated.totalGST
      ),

    grandTotal:
      Number(
        invoice?.grandTotal ??
          calculated.grandTotal
      ),
  }
}

/*
==================================================
GET PURCHASE GST
==================================================
*/

function getPurchaseGST(
  purchase
) {
  /*
  Your purchase data may have
  different structures.

  First try direct GST values.
  */

  if (
    purchase?.totalGST !==
      undefined ||
    purchase?.gst !==
      undefined
  ) {
    const directGST =
      Number(
        purchase?.totalGST ??
          purchase?.gst ??
          0
      )

    const taxable =
      Number(
        purchase?.taxableAmount ??
          purchase?.amount ??
          0
      )

    return {
      taxableAmount:
        taxable,

      totalGST:
        directGST,
    }
  }

  /*
  ------------------------------
  PURCHASE ITEMS
  ------------------------------
  */

  const items =
    Array.isArray(
      purchase?.items
    )
      ? purchase.items
      : []

  if (
    items.length === 0
  ) {
    return {
      taxableAmount: 0,
      totalGST: 0,
    }
  }

  return items.reduce(
    (
      result,
      item
    ) => {
      const quantity =
        Number(
          item?.quantity || 0
        )

      const rate =
        Number(
          item?.rate ||
            item?.price ||
            0
        )

      const discount =
        Number(
          item?.discount || 0
        )

      const gstRate =
        Number(
          item?.gstRate ||
            item?.taxRate ||
            0
        )

      const taxable =
        Math.max(
          0,
          quantity * rate -
            discount
        )

      const gst =
        (taxable *
          gstRate) /
        100

      return {
        taxableAmount:
          result.taxableAmount +
          taxable,

        totalGST:
          result.totalGST +
          gst,
      }
    },
    {
      taxableAmount: 0,
      totalGST: 0,
    }
  )
}

/*
==================================================
MAIN COMPONENT
==================================================
*/

export default function GST() {
  /*
  ================================================
  FINANCE CONTEXT
  ================================================
  */

  const finance =
    useFinance()

  const invoices =
    Array.isArray(
      finance?.invoices
    )
      ? finance.invoices
      : []

  /*
  ================================================
  PURCHASES
  ================================================
  */

  const [
    purchases,
    setPurchases,
  ] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          'purchases'
        )

      if (!saved) {
        return []
      }

      const parsed =
        JSON.parse(saved)

      return Array.isArray(
        parsed
      )
        ? parsed
        : []
    } catch {
      return []
    }
  })

  /*
  ================================================
  GST SETTINGS
  ================================================
  */

  const [
    settings,
    setSettings,
  ] = useState(
    loadGSTSettings
  )

  /*
  ================================================
  PERIOD
  ================================================
  */

  const [
    period,
    setPeriod,
  ] = useState(
    'fy'
  )

  /*
  ================================================
  SETTINGS OPEN/CLOSE
  ================================================
  */

  const [
    showSettings,
    setShowSettings,
  ] = useState(
    false
  )

  /*
  ================================================
  NEW RATE
  ================================================
  */

  const [
    newRate,
    setNewRate,
  ] = useState('')

  /*
  ================================================
  CALCULATOR AMOUNT
  ================================================
  */

  const [
    calculatorAmount,
    setCalculatorAmount,
  ] = useState('')

  /*
  ================================================
  CALCULATOR RATE
  ================================================
  */

  const [
    calculatorRate,
    setCalculatorRate,
  ] = useState(
    String(
      settings.defaultRate
    )
  )

  /*
  ================================================
  SAVE STATE
  ================================================
  */

  const [
    settingsSaved,
    setSettingsSaved,
  ] = useState(
    false
  )

  /*
  ================================================
  PURCHASE STORAGE UPDATE
  ================================================
  */

  useEffect(() => {
    const reloadPurchases =
      () => {
        try {
          const saved =
            localStorage.getItem(
              'purchases'
            )

          if (!saved) {
            setPurchases([])
            return
          }

          const parsed =
            JSON.parse(saved)

          setPurchases(
            Array.isArray(
              parsed
            )
              ? parsed
              : []
          )
        } catch {
          setPurchases([])
        }
      }

    window.addEventListener(
      'storage',
      reloadPurchases
    )

    window.addEventListener(
      'purchasesUpdated',
      reloadPurchases
    )

    window.addEventListener(
      'financeDataUpdated',
      reloadPurchases
    )

    return () => {
      window.removeEventListener(
        'storage',
        reloadPurchases
      )

      window.removeEventListener(
        'purchasesUpdated',
        reloadPurchases
      )

      window.removeEventListener(
        'financeDataUpdated',
        reloadPurchases
      )
    }
  }, [])

  /*
  ================================================
  UPDATE CALCULATOR RATE WHEN DEFAULT CHANGES
  ================================================
  */

  useEffect(() => {
    if (
      calculatorRate ===
      ''
    ) {
      setCalculatorRate(
        String(
          settings.defaultRate
        )
      )
    }
  }, [
    settings.defaultRate,
    calculatorRate,
  ])

  /*
  ================================================
  FILTER INVOICES
  ================================================
  */

  const filteredInvoices =
    useMemo(() => {
      return invoices.filter(
        (invoice) =>
          isInPeriod(
            getItemDate(
              invoice
            ),
            period
          )
      )
    }, [
      invoices,
      period,
    ])

  /*
  ================================================
  FILTER PURCHASES
  ================================================
  */

  const filteredPurchases =
    useMemo(() => {
      return purchases.filter(
        (purchase) =>
          isInPeriod(
            getItemDate(
              purchase
            ),
            period
          )
      )
    }, [
      purchases,
      period,
    ])

  /*
  ================================================
  SALES GST SUMMARY
  ================================================
  */

  const salesSummary =
    useMemo(() => {
      return filteredInvoices.reduce(
        (
          result,
          invoice
        ) => {
          const gst =
            getInvoiceGST(
              invoice
            )

          return {
            taxable:
              result.taxable +
              gst.taxableAmount,

            cgst:
              result.cgst +
              gst.cgst,

            sgst:
              result.sgst +
              gst.sgst,

            gst:
              result.gst +
              gst.totalGST,

            total:
              result.total +
              gst.grandTotal,
          }
        },
        {
          taxable: 0,
          cgst: 0,
          sgst: 0,
          gst: 0,
          total: 0,
        }
      )
    }, [
      filteredInvoices,
    ])

  /*
  ================================================
  PURCHASE GST SUMMARY
  ================================================
  */

  const purchaseSummary =
    useMemo(() => {
      return filteredPurchases.reduce(
        (
          result,
          purchase
        ) => {
          const gst =
            getPurchaseGST(
              purchase
            )

          return {
            taxable:
              result.taxable +
              gst.taxableAmount,

            gst:
              result.gst +
              gst.totalGST,
          }
        },
        {
          taxable: 0,
          gst: 0,
        }
      )
    }, [
      filteredPurchases,
    ])

  /*
  ================================================
  NET GST
  ================================================
  */

  const netGST =
    salesSummary.gst -
    purchaseSummary.gst

  /*
  ================================================
  CALCULATOR
  ================================================
  */

  const calculator =
    calculateGST(
      calculatorAmount,
      calculatorRate
    )

  /*
  ================================================
  SAVE SETTINGS
  ================================================
  */

  const saveSettings =
    () => {
      const cleanRates = [
        ...new Set(
          settings.rates
            .map(Number)
            .filter(
              (rate) =>
                Number.isFinite(
                  rate
                ) &&
                rate >= 0 &&
                rate <= 100
            )
        ),
      ].sort(
        (a, b) =>
          a - b
      )

      const nextSettings = {
        ...settings,

        rates:
          cleanRates.length
            ? cleanRates
            : DEFAULT_RATES,
      }

      localStorage.setItem(
        GST_SETTINGS_KEY,
        JSON.stringify(
          nextSettings
        )
      )

      setSettings(
        nextSettings
      )

      setSettingsSaved(
        true
      )

      window.dispatchEvent(
        new Event(
          'financeDataUpdated'
        )
      )

      setTimeout(() => {
        setSettingsSaved(
          false
        )
      }, 2000)
    }

  /*
  ================================================
  ADD RATE
  ================================================
  */

  const addRate =
    () => {
      const rate =
        Number(
          newRate
        )

      if (
        !Number.isFinite(
          rate
        ) ||
        rate < 0 ||
        rate > 100
      ) {
        return
      }

      if (
        settings.rates.includes(
          rate
        )
      ) {
        setNewRate('')
        return
      }

      setSettings(
        (
          current
        ) => ({
          ...current,

          rates: [
            ...current.rates,
            rate,
          ].sort(
            (a, b) =>
              a - b
          ),
        })
      )

      setNewRate('')
    }

  /*
  ================================================
  DELETE RATE
  ================================================
  */

  const deleteRate =
    (rate) => {
      if (
        settings.rates
          .length <= 1
      ) {
        return
      }

      const rates =
        settings.rates.filter(
          (item) =>
            item !== rate
        )

      setSettings(
        (
          current
        ) => ({
          ...current,

          rates,

          defaultRate:
            current.defaultRate ===
            rate
              ? rates[0]
              : current.defaultRate,
        })
      )
    }

  /*
  ================================================
  RESET CALCULATOR
  ================================================
  */

  const resetCalculator =
    () => {
      setCalculatorAmount(
        ''
      )

      setCalculatorRate(
        String(
          settings.defaultRate
        )
      )
    }

  return (
    <div className="space-y-6">

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
            <ReceiptIndianRupee
              size={24}
              className="text-orange-500"
            />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              GST / Taxes
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage GST, taxes and calculate
              your tax liability.
            </p>

          </div>

        </div>

        <div className="flex flex-wrap gap-2">

          {/* PERIOD */}

          <select
            value={period}
            onChange={(event) =>
              setPeriod(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
          >

            <option value="fy">
              Current Financial Year
            </option>

            <option value="quarter">
              Current Quarter
            </option>

            <option value="month">
              Current Month
            </option>

            <option value="all">
              All Time
            </option>

          </select>

          {/* SETTINGS */}

          <button
            type="button"
            onClick={() =>
              setShowSettings(
                (value) =>
                  !value
              )
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >

            <Settings2
              size={17}
            />

            Tax Settings

          </button>

        </div>

      </div>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Taxable Sales"
          value={formatMoney(
            salesSummary.taxable
          )}
          icon={
            <FileText
              size={21}
            />
          }
        />

        <SummaryCard
          title="Output GST"
          value={formatMoney(
            salesSummary.gst
          )}
          icon={
            <TrendingUp
              size={21}
            />
          }
        />

        <SummaryCard
          title="Input GST"
          value={formatMoney(
            purchaseSummary.gst
          )}
          icon={
            <TrendingDown
              size={21}
            />
          }
        />

        <SummaryCard
          title="Net GST"
          value={formatMoney(
            netGST
          )}
          icon={
            <IndianRupee
              size={21}
            />
          }
        />

      </div>

      {/* ==========================================
          GST BREAKDOWN
      ========================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* SALES */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <TrendingUp
                size={19}
                className="text-green-600"
              />
            </div>

            <div>

              <h2 className="font-semibold text-slate-900">
                Output GST
              </h2>

              <p className="text-sm text-slate-500">
                GST collected from customers.
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-4">

            <BreakdownRow
              label="Taxable Sales"
              value={
                salesSummary.taxable
              }
            />

            <BreakdownRow
              label="CGST"
              value={
                salesSummary.cgst
              }
            />

            <BreakdownRow
              label="SGST"
              value={
                salesSummary.sgst
              }
            />

            <BreakdownRow
              label="Total Output GST"
              value={
                salesSummary.gst
              }
              strong
            />

          </div>

        </div>

        {/* PURCHASE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <TrendingDown
                size={19}
                className="text-blue-600"
              />
            </div>

            <div>

              <h2 className="font-semibold text-slate-900">
                Input GST
              </h2>

              <p className="text-sm text-slate-500">
                GST paid on purchases.
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-4">

            <BreakdownRow
              label="Taxable Purchases"
              value={
                purchaseSummary.taxable
              }
            />

            <BreakdownRow
              label="Input GST"
              value={
                purchaseSummary.gst
              }
            />

            <div className="mt-5 rounded-xl bg-orange-50 p-4">

              <p className="text-sm text-orange-700">
                Net GST Payable
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-900">
                {formatMoney(
                  netGST
                )}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          TAX SETTINGS
      ========================================== */}

      {showSettings && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                GST Settings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure your GST registration and
                tax rates.
              </p>

            </div>

            <button
              type="button"
              onClick={
                saveSettings
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >

              {settingsSaved ? (
                <>
                  <CheckCircle2
                    size={17}
                  />

                  Saved
                </>
              ) : (
                <>
                  <Save
                    size={17}
                  />

                  Save Settings
                </>
              )}

            </button>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* GSTIN */}

            <InputField
              label="GSTIN"
              value={
                settings.gstin
              }
              onChange={(value) =>
                setSettings(
                  (current) => ({
                    ...current,
                    gstin:
                      value.toUpperCase(),
                  })
                )
              }
              placeholder="Enter GSTIN"
            />

            {/* STATE */}

            <InputField
              label="State"
              value={
                settings.state
              }
              onChange={(value) =>
                setSettings(
                  (current) => ({
                    ...current,
                    state: value,
                  })
                )
              }
              placeholder="Enter state"
            />

            {/* REGISTRATION */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Registration Type
              </label>

              <select
                value={
                  settings.registrationType
                }
                onChange={(event) =>
                  setSettings(
                    (current) => ({
                      ...current,
                      registrationType:
                        event.target.value,
                    })
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
              >

                <option value="Regular">
                  Regular
                </option>

                <option value="Composition">
                  Composition
                </option>

                <option value="Casual">
                  Casual
                </option>

                <option value="Unregistered">
                  Unregistered
                </option>

              </select>

            </div>

            {/* DEFAULT RATE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Default GST Rate
              </label>

              <select
                value={
                  settings.defaultRate
                }
                onChange={(event) =>
                  setSettings(
                    (current) => ({
                      ...current,
                      defaultRate:
                        Number(
                          event.target
                            .value
                        ),
                    })
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
              >

                {settings.rates.map(
                  (rate) => (
                    <option
                      key={rate}
                      value={rate}
                    >
                      {rate}%
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* TAX RATES */}

          <div className="mt-7 border-t border-slate-100 pt-6">

            <h3 className="font-semibold text-slate-900">
              Tax Rates
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add custom tax rates if required.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">

              {settings.rates.map(
                (rate) => (
                  <div
                    key={rate}
                    className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2"
                  >

                    <span className="text-sm font-semibold text-slate-700">
                      {rate}%
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        deleteRate(
                          rate
                        )
                      }
                      disabled={
                        settings
                          .rates
                          .length <=
                        1
                      }
                      className="text-slate-400 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Delete rate"
                    >
                      <Trash2
                        size={15}
                      />
                    </button>

                  </div>
                )
              )}

            </div>

            <div className="mt-4 flex max-w-sm gap-2">

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={
                  newRate
                }
                onChange={(event) =>
                  setNewRate(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    event.preventDefault()
                    addRate()
                  }
                }}
                placeholder="Enter rate"
                className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
              />

              <button
                type="button"
                onClick={
                  addRate
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >

                <Plus
                  size={16}
                />

                Add

              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          GST CALCULATOR
      ========================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">

        {/* CALCULATOR HEADER */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
              <Calculator
                size={21}
                className="text-orange-500"
              />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                GST Calculator
              </h2>

              <p className="text-sm text-slate-500">
                Enter the amount and GST rate manually.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              resetCalculator
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >

            <RefreshCcw
              size={15}
            />

            Reset

          </button>

        </div>

        {/* INPUTS */}

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* AMOUNT */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Taxable Amount
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  calculatorAmount
                }
                onChange={(event) =>
                  setCalculatorAmount(
                    event.target.value
                  )
                }
                placeholder="Enter amount"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
              />

            </div>

          </div>

          {/* GST RATE */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              GST Rate (%)
            </label>

            <div className="relative">

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={
                  calculatorRate
                }
                onChange={(event) =>
                  setCalculatorRate(
                    event.target.value
                  )
                }
                placeholder="Enter GST rate"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                %
              </span>

            </div>

            {/* QUICK RATES */}

            <div className="mt-3 flex flex-wrap gap-2">

              {settings.rates.map(
                (rate) => (
                  <button
                    type="button"
                    key={rate}
                    onClick={() =>
                      setCalculatorRate(
                        String(
                          rate
                        )
                      )
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      String(
                        calculatorRate
                      ) ===
                      String(
                        rate
                      )
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    {rate}%
                  </button>
                )
              )}

            </div>

          </div>

          {/* GST AMOUNT */}

          <div className="rounded-xl bg-orange-50 p-4">

            <p className="text-xs font-semibold text-orange-700">
              GST Amount
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-900">
              {formatMoney(
                calculator.totalGST
              )}
            </p>

            <p className="mt-1 text-xs text-orange-700">
              {Number(
                calculatorRate ||
                  0
              )}% GST
            </p>

          </div>

        </div>

        {/* RESULTS */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* CGST */}

          <ResultCard
            title="CGST"
            value={
              calculator.cgst
            }
            subtitle={`${Number(
              calculatorRate ||
                0
            ) / 2}%`}
          />

          {/* SGST */}

          <ResultCard
            title="SGST"
            value={
              calculator.sgst
            }
            subtitle={`${Number(
              calculatorRate ||
                0
            ) / 2}%`}
          />

          {/* GRAND TOTAL */}

          <div className="rounded-xl bg-orange-500 p-5">

            <p className="text-sm font-medium text-orange-100">
              Grand Total
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {formatMoney(
                calculator.grandTotal
              )}
            </p>

            <p className="mt-1 text-xs text-orange-100">
              Amount + GST
            </p>

          </div>

        </div>

        {/* CALCULATION DETAILS */}

        <div className="mt-6 rounded-xl border border-slate-200">

          <div className="border-b border-slate-100 px-5 py-4">

            <h3 className="font-semibold text-slate-800">
              Calculation Details
            </h3>

          </div>

          <div className="space-y-4 p-5">

            <BreakdownRow
              label="Taxable Amount"
              value={
                calculator.taxableAmount
              }
            />

            <BreakdownRow
              label={`GST Rate (${Number(
                calculatorRate ||
                  0
              )}%)`}
              value={
                calculator.totalGST
              }
            />

            <BreakdownRow
              label="CGST"
              value={
                calculator.cgst
              }
            />

            <BreakdownRow
              label="SGST"
              value={
                calculator.sgst
              }
            />

            <div className="border-t border-slate-200 pt-4">

              <div className="flex items-center justify-between">

                <span className="font-bold text-slate-800">
                  Grand Total
                </span>

                <span className="text-xl font-bold text-orange-600">
                  {formatMoney(
                    calculator.grandTotal
                  )}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          INVOICE GST TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Invoice GST Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              GST calculated from your invoices.
            </p>

          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
            {filteredInvoices.length}{' '}
            invoice
            {filteredInvoices.length !==
            1
              ? 's'
              : ''}
          </div>

        </div>

        {filteredInvoices.length ===
        0 ? (
          <EmptyState
            icon={
              <FileText
                size={35}
              />
            }
            title="No invoices found"
            message="Create an invoice to see its GST information here."
          />
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Invoice
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Taxable
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    GST Rate
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    CGST
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    SGST
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Total GST
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Grand Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map(
                  (invoice) => {
                    const gst =
                      getInvoiceGST(
                        invoice
                      )

                    return (
                      <tr
                        key={
                          invoice.id
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {invoice.invoiceNumber ||
                            'Invoice'}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {invoice.customer ||
                            '—'}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {getItemDate(
                            invoice
                          )
                            ? formatDate(
                                getItemDate(
                                  invoice
                                )
                              )
                            : '—'}
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-slate-700">
                          {formatMoney(
                            gst.taxableAmount
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-medium text-slate-700">
                          {gst.rate}%
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-slate-700">
                          {formatMoney(
                            gst.cgst
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-slate-700">
                          {formatMoney(
                            gst.sgst
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                          {formatMoney(
                            gst.totalGST
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-bold text-orange-600">
                          {formatMoney(
                            gst.grandTotal
                          )}
                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==========================================
          PURCHASE GST TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-200 p-5">

          <h2 className="text-lg font-semibold text-slate-900">
            Purchase GST Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Input GST from your purchase records.
          </p>

        </div>

        {filteredPurchases.length ===
        0 ? (
          <EmptyState
            icon={
              <ReceiptIndianRupee
                size={35}
              />
            }
            title="No purchase records found"
            message="Purchase GST will appear here when purchase records are available."
          />
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Purchase
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Taxable
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Input GST
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPurchases.map(
                  (
                    purchase,
                    index
                  ) => {
                    const gst =
                      getPurchaseGST(
                        purchase
                      )

                    const purchaseId =
                      purchase.id ||
                      purchase._id ||
                      index

                    return (
                      <tr
                        key={
                          purchaseId
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {purchase.purchaseNumber ||
                            purchase.invoiceNumber ||
                            purchase.reference ||
                            `Purchase ${index + 1}`}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {getItemDate(
                            purchase
                          )
                            ? formatDate(
                                getItemDate(
                                  purchase
                                )
                              )
                            : '—'}
                        </td>

                        <td className="px-5 py-4 text-right text-sm text-slate-700">
                          {formatMoney(
                            gst.taxableAmount
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-semibold text-blue-600">
                          {formatMoney(
                            gst.totalGST
                          )}
                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  )
}

/*
==================================================
SUMMARY CARD
==================================================
*/

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
          {icon}
        </div>

      </div>

    </div>
  )
}

/*
==================================================
BREAKDOWN ROW
==================================================
*/

function BreakdownRow({
  label,
  value,
  strong = false,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">

      <span
        className={
          strong
            ? 'font-semibold text-slate-800'
            : 'text-sm text-slate-500'
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? 'font-bold text-slate-900'
            : 'text-sm font-semibold text-slate-700'
        }
      >
        {formatMoney(
          value
        )}
      </span>

    </div>
  )
}

/*
==================================================
INPUT FIELD
==================================================
*/

function InputField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
      />

    </div>
  )
}

/*
==================================================
RESULT CARD
==================================================
*/

function ResultCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-800">
        {formatMoney(
          value
        )}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>

    </div>
  )
}

/*
==================================================
EMPTY STATE
==================================================
*/

function EmptyState({
  icon,
  title,
  message,
}) {
  return (
    <div className="px-6 py-14 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-400">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {message}
      </p>

    </div>
  )
}

/*
==================================================
DATE FORMAT
==================================================
*/

function formatDate(
  dateValue
) {
  const date =
    new Date(dateValue)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—'
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}