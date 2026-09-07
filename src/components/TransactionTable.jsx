export default function TransactionTable({ data }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-500 border-b border-slate-200">
            <tr>
              <th className="text-left py-3">Transaction</th>
              <th className="text-left py-3">Date</th>
              <th className="text-right py-3">Amount</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-4 font-medium">{item.title}</td>
                <td className="py-4 text-slate-500">{item.date}</td>
                <td
                  className={`py-4 text-right font-semibold ${
                    item.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}