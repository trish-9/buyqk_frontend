import {
  Calculator,
  FileText,
  Receipt,
  Wallet,
  TrendingUp,
} from 'lucide-react'

export default function Tools() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Tools
        </h1>

        <p className="text-slate-500 mt-1">
          Useful tools for managing your business finances.
        </p>
      </div>

      {/* TOOL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* GST CALCULATOR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Calculator size={24} />
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mt-4">
            GST Calculator
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Calculate GST amount and total invoice value quickly.
          </p>

          <button
            type="button"
            className="mt-5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
          >
            Open Calculator
          </button>
        </div>

        {/* INVOICE TOOL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText size={24} />
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mt-4">
            Invoice Generator
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Create professional invoices for your customers.
          </p>

          <button
            type="button"
            className="mt-5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            Create Invoice
          </button>
        </div>

        {/* EXPENSE TOOL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Receipt size={24} />
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mt-4">
            Expense Tracker
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Track and review your business expenses.
          </p>

          <button
            type="button"
            className="mt-5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
          >
            View Expenses
          </button>
        </div>

        {/* BALANCE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Wallet size={24} />
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mt-4">
            Balance Calculator
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Check your income, expenses and available balance.
          </p>

          <button
            type="button"
            className="mt-5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
          >
            Check Balance
          </button>
        </div>

        {/* PROFIT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mt-4">
            Profit Calculator
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Calculate your monthly income, expenses and profit.
          </p>

          <button
            type="button"
            className="mt-5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition"
          >
            Calculate Profit
          </button>
        </div>

      </div>

    </div>
  )
}