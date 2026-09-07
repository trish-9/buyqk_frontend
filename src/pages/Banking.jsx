export default function Banking() {
  return (
    <Page
      title="Banking"
      description="Manage cash, bank and payment accounts."
    />
  )
}

function Page({ title, description }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-semibold text-slate-700">
          No accounts added
        </p>
      </div>
    </div>
  )
}