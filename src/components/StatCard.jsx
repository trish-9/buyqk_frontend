import { motion } from 'framer-motion'

export default function StatCard({ title, value, color }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200"
    >
      <p className="text-sm text-slate-500 mb-2">{title}</p>
      <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
      <p className="text-xs text-slate-400 mt-2">Updated just now</p>
    </motion.div>
  )
}