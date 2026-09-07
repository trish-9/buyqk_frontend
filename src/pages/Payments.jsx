import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock3,
} from "lucide-react"

export default function Payments() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Payments
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track received and outgoing payments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <Stat
          icon={IndianRupee}
          title="Total Received"
          value="₹1,25,000"
        />

        <Stat
          icon={CheckCircle2}
          title="Completed"
          value="₹98,500"
        />

        <Stat
          icon={Clock3}
          title="Pending"
          value="₹26,500"
        />

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <div className="mb-5 flex items-center gap-3">
          <CreditCard
            size={20}
            className="text-orange-500"
          />

          <h2 className="font-bold text-slate-800">
            Payment History
          </h2>
        </div>

        <div className="rounded-xl bg-slate-50 p-10 text-center">

          <CreditCard
            size={35}
            className="mx-auto mb-3 text-slate-300"
          />

          <p className="font-semibold text-slate-600">
            No payments yet
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Your payment records will appear here.
          </p>

        </div>

      </div>

    </div>
  )
}

function Stat({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon size={20} />
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  )
}