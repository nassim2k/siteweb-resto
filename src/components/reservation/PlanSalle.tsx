'use client'

import { motion } from 'framer-motion'
import { Table } from '@/types'
import TableInteractive from './TableInteractive'

interface PlanSalleProps {
  tables: Table[]
  selectedTableId: string | null
  onSelectTable: (table: Table) => void
}

export default function PlanSalle({ tables, selectedTableId, onSelectTable }: PlanSalleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full bg-gray-50 rounded-2xl border-2 border-gray-200"
      style={{ minHeight: 500 }}
    >
      {/* Mur / décoration */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gray-300 rounded-t-2xl" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gray-300 rounded-b-2xl" />
      <div className="absolute top-3 left-0 bottom-3 w-3 bg-gray-300" />
      <div className="absolute top-3 right-0 bottom-3 w-3 bg-gray-300" />

      {/* Porte */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 bg-[var(--secondary)] rounded-t-sm" />

      <div className="p-8" style={{ minHeight: 500 }}>
        {tables.map((table) => (
          <TableInteractive
            key={table.id}
            table={table}
            isSelected={table.id === selectedTableId}
            onClick={() => onSelectTable(table)}
          />
        ))}
      </div>

      {tables.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <p className="text-lg">Aucune table dans cette salle</p>
        </div>
      )}

      {/* Légende */}
      <div className="absolute bottom-6 left-6 flex gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-gray-600">Libre</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span className="text-gray-600">Occupée</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500" />
          <span className="text-gray-600">Sélectionnée</span>
        </div>
      </div>
    </motion.div>
  )
}
